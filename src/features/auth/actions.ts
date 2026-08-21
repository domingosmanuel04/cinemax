"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { completeTwoFactorLogin, createPasswordResetToken, createSession, destroySession, getSession, hashPassword, loginWithCredentials, resetPasswordWithToken, verifyPassword } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

const creds = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  next: z.string().optional(),
});

export async function loginAction(
  _: { error?: string; requires2fa?: boolean } | null,
  formData: FormData,
) {
  if (formData.get("otp")) {
    const otp = String(formData.get("otp") || "");
    const next = String(formData.get("next") || "/");
    const user = await completeTwoFactorLogin(otp);
    if (!user) return { error: "Código 2FA inválido.", requires2fa: true };
    redirect(next.startsWith("/") ? next : "/");
  }
  const parsed = creds.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || "/",
  });
  if (!parsed.success) return { error: "Dados inválidos." };
  const user = await loginWithCredentials(parsed.data.email, parsed.data.password);
  if (!user) return { error: "Email ou palavra-passe incorrectos." };
  if ("requires2fa" in user && user.requires2fa) return { requires2fa: true };
  redirect(parsed.data.next?.startsWith("/") ? parsed.data.next : "/");
}

export async function registerAction(_: { error?: string } | null, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase();
  const password = String(formData.get("password") || "");
  if (name.length < 2 || !email.includes("@") || password.length < 8) {
    return { error: "Preencha nome, email e palavra-passe (mín. 8)." };
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Já existe uma conta com este email." };
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "CUSTOMER",
      loyalty: { create: { points: 100, lifetime: 100, tier: "BRONZE" } },
      profiles: { create: { name: name.split(" ")[0] || name } },
      notifications: {
        create: { title: "Bem-vindo ao CINEMAX", body: "Your Movie. Your Moment.", type: "SYSTEM" },
      },
    },
  });
  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl });
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function requestPasswordResetAction(
  _: { error?: string; ok?: boolean; demoUrl?: string } | null,
  formData: FormData,
) {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  if (!email.includes("@")) return { error: "Indique um email válido." };
  const token = await createPasswordResetToken(email);
  if (!token) return { ok: true };
  return { ok: true, demoUrl: `/recuperar/${encodeURIComponent(token)}` };
}

export async function resetPasswordAction(
  _: { error?: string } | null,
  formData: FormData,
) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < 8) return { error: "A palavra-passe precisa de pelo menos 8 caracteres." };
  if (password !== confirm) return { error: "As palavras-passe não coincidem." };
  const email = await resetPasswordWithToken(token, password);
  if (!email) return { error: "Ligação inválida ou expirada. Peça uma nova." };
  redirect("/entrar");
}

export async function updateProfileAction(
  _: { error?: string; ok?: boolean } | null,
  formData: FormData,
) {
  const session = await getSession();
  if (!session) return { error: "Inicie sessão." };
  const name = String(formData.get("name") || "").trim();
  if (name.length < 2) return { error: "O nome é obrigatório." };
  const phone = String(formData.get("phone") || "").trim() || null;
  const dobRaw = String(formData.get("dateOfBirth") || "");
  const preferredCinemaId = String(formData.get("preferredCinemaId") || "") || null;
  const locale = String(formData.get("locale") || "pt");
  const avatarUrl = String(formData.get("avatarUrl") || "").trim() || null;
  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      name,
      phone,
      dateOfBirth: dobRaw ? new Date(dobRaw) : null,
      preferredCinemaId,
      locale: ["pt", "en", "fr"].includes(locale) ? locale : "pt",
      avatarUrl,
    },
  });
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
  });
  const jar = await cookies();
  jar.set("cinemax-locale", user.locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  redirect("/conta?saved=1");
}

export async function changePasswordAction(
  _: { error?: string; ok?: boolean } | null,
  formData: FormData,
) {
  const session = await getSession();
  if (!session) return { error: "Inicie sessão." };
  const current = String(formData.get("current") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < 8) return { error: "A palavra-passe precisa de pelo menos 8 caracteres." };
  if (password !== confirm) return { error: "As palavras-passe não coincidem." };
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || !(await verifyPassword(current, user.passwordHash))) {
    return { error: "Palavra-passe actual incorrecta." };
  }
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } });
  return { ok: true };
}
