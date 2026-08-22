import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { getSettings } from "@/server/services/settings";
import { AdminPageHeader } from "@/features/admin/AdminTable";
import { SuperAdminDashboard } from "@/features/admin/super-admin/SuperAdminDashboard";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const session = await getSession();
  if (!session) {
    redirect("/entrar?next=/admin/super-admin");
  }

  // Ensure user is SUPER_ADMIN or ADMIN
  if (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
    redirect("/admin");
  }

  const [
    users,
    auditLogs,
    alerts,
    settings,
    cinemas,
    totalUsers,
    superAdminsCount,
    staffCount,
    activeHoldsCount,
    auditLogsTotal,
    unresolvedAlertsCount,
    paidOrders,
  ] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        staffProfile: {
          include: {
            cinema: true,
          },
        },
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.alert.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    getSettings(),
    prisma.cinema.findMany({
      select: { id: true, name: true },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
    prisma.user.count({ where: { role: { in: ["ADMIN", "MANAGER", "STAFF", "FINANCE", "MARKETING", "CONTENT_MANAGER"] } } }),
    prisma.seatHold.count({ where: { expiresAt: { gt: new Date() } } }),
    prisma.auditLog.count(),
    prisma.alert.count({ where: { resolved: false } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "PAID" },
    }),
  ]);

  const revenueTotal = paidOrders._sum.total || 0;

  const formattedUsers = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    staffProfile: u.staffProfile
      ? {
          jobTitle: u.staffProfile.jobTitle,
          cinema: u.staffProfile.cinema ? { name: u.staffProfile.cinema.name } : null,
        }
      : null,
  }));

  const formattedAuditLogs = auditLogs.map((log) => ({
    id: log.id,
    userId: log.userId,
    action: log.action,
    entity: log.entity,
    entityId: log.entityId,
    metadata: log.metadata,
    createdAt: log.createdAt.toISOString(),
    user: log.user,
  }));

  const formattedAlerts = alerts.map((a) => ({
    id: a.id,
    type: a.type,
    severity: a.severity,
    title: a.title,
    body: a.body,
    resolved: a.resolved,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader kicker="Gestão Privilegiada" title="SUPER ADMIN" />
      <SuperAdminDashboard
        users={formattedUsers}
        auditLogs={formattedAuditLogs}
        alerts={formattedAlerts}
        settings={settings}
        cinemas={cinemas}
        stats={{
          totalUsers,
          superAdminsCount,
          staffCount,
          revenueTotal,
          activeHoldsCount,
          auditLogsTotal,
          unresolvedAlertsCount,
        }}
        currentUserId={session.id}
      />
    </div>
  );
}
