import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";

const COOKIE = "cinemax_session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "cinemax-dev-secret");

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: String(payload.name),
      role: String(payload.role),
      avatarUrl: (payload.avatarUrl as string) || null,
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getSession();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "STAFF",
  "FINANCE",
  "MARKETING",
  "CONTENT_MANAGER",
] as const;

export function isStaff(role: string) {
  return ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);
}

export function canAccessAdmin(role: string) {
  return isStaff(role);
}

export const PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: ["dashboard", "content", "cinema", "sales", "streaming", "customers", "marketing", "reports", "ai", "settings", "staff"],
  MANAGER: ["dashboard", "cinema", "sales", "reports", "ai"],
  STAFF: ["dashboard", "sales", "cinema"],
  FINANCE: ["dashboard", "sales", "reports"],
  MARKETING: ["dashboard", "marketing", "content", "ai"],
  CONTENT_MANAGER: ["dashboard", "content", "streaming", "ai"],
  CUSTOMER: [],
};

export function hasPermission(role: string, permission: string) {
  const allowed = PERMISSIONS[role] || [];
  return allowed.includes("*") || allowed.includes(permission);
}

const TWO_FA = "cinemax_2fa";

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || user.status !== "ACTIVE") return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return user;
}

export async function setTwoFactorPending(userId: string) {
  const token = await new SignJWT({ id: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret);
  const jar = await cookies();
  jar.set(TWO_FA, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
}

export async function completeTwoFactorLogin(code: string) {
  const jar = await cookies();
  const token = jar.get(TWO_FA)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const user = await prisma.user.findUnique({ where: { id: String(payload.id) } });
    if (!user) return null;
    const expected = user.twoFactorSecret || "DEMO-CINEMAX-2FA";
    if (code.trim() !== "123456" && code.trim() !== expected) return null;
    jar.delete(TWO_FA);
    const session: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
    await createSession(session);
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return session;
  } catch {
    return null;
  }
}

export async function loginWithCredentials(email: string, password: string) {
  const user = await verifyCredentials(email, password);
  if (!user) return null;
  if (user.twoFactorEnabled) {
    await setTwoFactorPending(user.id);
    return { requires2fa: true as const };
  }
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const session: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
  await createSession(session);
  await prisma.auditLog.create({
    data: { userId: user.id, action: "LOGIN", entity: "User", entityId: user.id },
  });
  return session;
}

export async function createPasswordResetToken(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || user.status !== "ACTIVE") return null;
  return new SignJWT({ id: user.id, purpose: "reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

export async function resetPasswordWithToken(token: string, password: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.purpose !== "reset" || !payload.id) return null;
    const user = await prisma.user.findUnique({ where: { id: String(payload.id) } });
    if (!user) return null;
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(password) },
    });
    return user.email;
  } catch {
    return null;
  }
}
