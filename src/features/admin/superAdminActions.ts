"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { getSession, hashPassword } from "@/server/auth/session";
import { setSettings } from "@/server/services/settings";

async function guardSuperAdmin() {
  const u = await getSession();
  if (!u) throw new Error("UNAUTHENTICATED");
  if (u.role !== "SUPER_ADMIN" && u.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED_SUPER_ADMIN_ONLY");
  }
  return u;
}

export async function updateUserRoleAction(userId: string, role: string) {
  const admin = await guardSuperAdmin();
  const validRoles = [
    "SUPER_ADMIN",
    "ADMIN",
    "MANAGER",
    "STAFF",
    "FINANCE",
    "MARKETING",
    "CONTENT_MANAGER",
    "CUSTOMER",
  ];
  if (!validRoles.includes(role)) {
    throw new Error("Papel inválido fornecido.");
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("Utilizador não encontrado.");

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "UPDATE_USER_ROLE",
      entity: "User",
      entityId: userId,
      metadata: JSON.stringify({ oldRole: target.role, newRole: role, targetEmail: target.email }),
    },
  });

  revalidatePath("/admin/super-admin");
  revalidatePath("/admin/funcionarios");
  revalidatePath("/admin/clientes");
  return { success: true, message: `Papel de ${target.name} alterado para ${role}.` };
}

export async function toggleUserStatusAction(userId: string, newStatus: string) {
  const admin = await guardSuperAdmin();
  const validStatuses = ["ACTIVE", "SUSPENDED", "INACTIVE"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Estado de conta inválido.");
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("Utilizador não encontrado.");

  await prisma.user.update({
    where: { id: userId },
    data: { status: newStatus },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "TOGGLE_USER_STATUS",
      entity: "User",
      entityId: userId,
      metadata: JSON.stringify({ oldStatus: target.status, newStatus, targetEmail: target.email }),
    },
  });

  revalidatePath("/admin/super-admin");
  revalidatePath("/admin/funcionarios");
  revalidatePath("/admin/clientes");
  return { success: true, message: `Conta de ${target.name} marcada como ${newStatus}.` };
}

export async function createNewStaffUserAction(formData: FormData) {
  const admin = await guardSuperAdmin();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const role = String(formData.get("role") || "STAFF").trim();
  const jobTitle = String(formData.get("jobTitle") || "Operador de Cinema").trim();
  const cinemaId = String(formData.get("cinemaId") || "").trim() || null;

  if (!email || !name || !password) {
    throw new Error("Email, Nome e Palavra-passe são obrigatórios.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Já existe um utilizador registado com este email.");
  }

  const passwordHash = await hashPassword(password);
  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role,
      status: "ACTIVE",
      staffProfile: role !== "CUSTOMER" ? {
        create: {
          jobTitle,
          cinemaId,
        },
      } : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "CREATE_STAFF_USER",
      entity: "User",
      entityId: newUser.id,
      metadata: JSON.stringify({ email: newUser.email, role: newUser.role, createdBy: admin.email }),
    },
  });

  revalidatePath("/admin/super-admin");
  revalidatePath("/admin/funcionarios");
  return { success: true, message: `Novo membro ${name} (${role}) criado com sucesso!` };
}

export async function toggleMaintenanceModeAction(enabled: boolean, message?: string) {
  const admin = await guardSuperAdmin();
  await setSettings({
    maintenanceMode: enabled ? "true" : "false",
    maintenanceMessage: message || "O sistema CINEMAX encontra-se em manutenção programada. Voltamos em breve.",
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "TOGGLE_MAINTENANCE_MODE",
      entity: "SystemSetting",
      metadata: JSON.stringify({ enabled, message, triggeredBy: admin.email }),
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/super-admin");
  return { success: true, enabled };
}

export async function toggleEmergencyKillSwitchAction(enabled: boolean) {
  const admin = await guardSuperAdmin();
  await setSettings({
    emergencyKillSwitch: enabled ? "true" : "false",
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "TOGGLE_EMERGENCY_KILL_SWITCH",
      entity: "SystemSetting",
      metadata: JSON.stringify({ enabled, triggeredBy: admin.email }),
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/super-admin");
  return { success: true, enabled };
}

export async function resolveAlertAction(alertId: string) {
  const admin = await guardSuperAdmin();
  const alert = await prisma.alert.findUnique({ where: { id: alertId } });
  if (!alert) throw new Error("Alerta não encontrado.");

  await prisma.alert.update({
    where: { id: alertId },
    data: { resolved: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "RESOLVE_ALERT",
      entity: "Alert",
      entityId: alertId,
      metadata: JSON.stringify({ title: alert.title, resolvedBy: admin.email }),
    },
  });

  revalidatePath("/admin/super-admin");
  return { success: true, message: `Alerta "${alert.title}" resolvido.` };
}

export async function purgeExpiredHoldsAction() {
  const admin = await guardSuperAdmin();
  const now = new Date();
  const result = await prisma.seatHold.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "PURGE_EXPIRED_HOLDS",
      entity: "SeatHold",
      metadata: JSON.stringify({ purgedCount: result.count, executedAt: now }),
    },
  });

  revalidatePath("/admin/super-admin");
  return { success: true, purgedCount: result.count };
}

export async function updateGlobalSettingAction(key: string, value: string) {
  const admin = await guardSuperAdmin();
  await setSettings({ [key]: value });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "UPDATE_GLOBAL_SETTING",
      entity: "Setting",
      entityId: key,
      metadata: JSON.stringify({ key, value, updatedBy: admin.email }),
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/super-admin");
  revalidatePath("/admin/configuracoes");
  return { success: true, key, value };
}

export async function createSystemAlertAction(formData: FormData) {
  const admin = await guardSuperAdmin();
  const type = String(formData.get("type") || "SECURITY").trim();
  const severity = String(formData.get("severity") || "HIGH").trim();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const href = String(formData.get("href") || "").trim() || null;

  if (!title || !body) {
    throw new Error("Título e Descrição do alerta são obrigatórios.");
  }

  const alert = await prisma.alert.create({
    data: {
      type,
      severity,
      title,
      body,
      href,
      resolved: false,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "CREATE_SYSTEM_ALERT",
      entity: "Alert",
      entityId: alert.id,
      metadata: JSON.stringify({ title, severity, createdBy: admin.email }),
    },
  });

  revalidatePath("/admin/super-admin");
  return { success: true, alert };
}
