"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Users,
  Lock,
  Activity,
  Database,
  Terminal,
  AlertTriangle,
  FileText,
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  Search,
  UserPlus,
  Power,
  Flame,
  ShieldCheck,
  Building2,
  Server,
  Filter,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import {
  updateUserRoleAction,
  toggleUserStatusAction,
  createNewStaffUserAction,
  toggleMaintenanceModeAction,
  toggleEmergencyKillSwitchAction,
  resolveAlertAction,
  purgeExpiredHoldsAction,
  updateGlobalSettingAction,
  createSystemAlertAction,
} from "@/features/admin/superAdminActions";

interface SuperAdminDashboardProps {
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    createdAt: string;
    lastLoginAt: string | null;
    staffProfile?: {
      jobTitle: string;
      cinema?: { name: string } | null;
    } | null;
  }>;
  auditLogs: Array<{
    id: string;
    userId: string | null;
    action: string;
    entity: string;
    entityId: string | null;
    metadata: string;
    createdAt: string;
    user?: { name: string; email: string; role: string } | null;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    severity: string;
    title: string;
    body: string;
    resolved: boolean;
    createdAt: string;
  }>;
  settings: Record<string, string>;
  cinemas: Array<{ id: string; name: string }>;
  stats: {
    totalUsers: number;
    superAdminsCount: number;
    staffCount: number;
    revenueTotal: number;
    activeHoldsCount: number;
    auditLogsTotal: number;
    unresolvedAlertsCount: number;
  };
  currentUserId: string;
}

const ROLES = [
  { value: "SUPER_ADMIN", label: "Super Admin", color: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
  { value: "ADMIN", label: "Admin", color: "bg-red-500/20 text-red-400 border-red-500/40" },
  { value: "MANAGER", label: "Manager", color: "bg-purple-500/20 text-purple-400 border-purple-500/40" },
  { value: "STAFF", label: "Staff", color: "bg-blue-500/20 text-blue-400 border-blue-500/40" },
  { value: "FINANCE", label: "Financeiro", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" },
  { value: "MARKETING", label: "Marketing", color: "bg-pink-500/20 text-pink-400 border-pink-500/40" },
  { value: "CONTENT_MANAGER", label: "Gestor de Conteúdo", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40" },
  { value: "CUSTOMER", label: "Cliente", color: "bg-white/10 text-white/70 border-white/20" },
];

export function SuperAdminDashboard({
  users: initialUsers,
  auditLogs: initialAuditLogs,
  alerts: initialAlerts,
  settings: initialSettings,
  cinemas,
  stats,
  currentUserId,
}: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "rbac" | "emergency" | "audit" | "alerts" | "utilities">("overview");
  const [isPending, startTransition] = useTransition();

  // Local reactive states
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [auditSearch, setAuditSearch] = useState("");
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [showCreateAlertModal, setShowCreateAlertModal] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<any | null>(null);

  // Settings states
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(initialSettings.maintenanceMode === "true");
  const [maintenanceMessage, setMaintenanceMessage] = useState(initialSettings.maintenanceMessage || "");
  const [killSwitchEnabled, setKillSwitchEnabled] = useState(initialSettings.emergencyKillSwitch === "true");

  // Handlers for Server Actions
  const handleRoleChange = (userId: string, newRole: string) => {
    startTransition(async () => {
      try {
        const res = await updateUserRoleAction(userId, newRole);
        toast.success(res.message);
      } catch (err: any) {
        toast.error(err.message || "Erro ao alterar papel.");
      }
    });
  };

  const handleStatusToggle = (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    startTransition(async () => {
      try {
        const res = await toggleUserStatusAction(userId, nextStatus);
        toast.success(res.message);
      } catch (err: any) {
        toast.error(err.message || "Erro ao alterar estado.");
      }
    });
  };

  const handleMaintenanceToggle = () => {
    const nextState = !maintenanceEnabled;
    setMaintenanceEnabled(nextState);
    startTransition(async () => {
      try {
        await toggleMaintenanceModeAction(nextState, maintenanceMessage);
        toast.success(`Modo de Manutenção ${nextState ? "ATIVADO" : "DESATIVADO"}`);
      } catch (err: any) {
        setMaintenanceEnabled(!nextState);
        toast.error(err.message || "Erro ao atualizar manutenção.");
      }
    });
  };

  const handleKillSwitchToggle = () => {
    const nextState = !killSwitchEnabled;
    setKillSwitchEnabled(nextState);
    startTransition(async () => {
      try {
        await toggleEmergencyKillSwitchAction(nextState);
        toast.success(`Paragem de Emergência ${nextState ? "ATIVADA" : "DESATIVADA"}`);
      } catch (err: any) {
        setKillSwitchEnabled(!nextState);
        toast.error(err.message || "Erro ao alterar travão de emergência.");
      }
    });
  };

  const handleResolveAlert = (alertId: string) => {
    startTransition(async () => {
      try {
        const res = await resolveAlertAction(alertId);
        toast.success(res.message);
      } catch (err: any) {
        toast.error(err.message || "Erro ao resolver alerta.");
      }
    });
  };

  const handlePurgeHolds = () => {
    startTransition(async () => {
      try {
        const res = await purgeExpiredHoldsAction();
        toast.success(`${res.purgedCount} reservas de lugares expiradas foram purgadas com sucesso!`);
      } catch (err: any) {
        toast.error(err.message || "Erro ao purgar reservas.");
      }
    });
  };

  const handleCreateStaffSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const res = await createNewStaffUserAction(formData);
        toast.success(res.message);
        setShowCreateStaffModal(false);
      } catch (err: any) {
        toast.error(err.message || "Erro ao criar utilizador.");
      }
    });
  };

  const handleCreateAlertSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createSystemAlertAction(formData);
        toast.success("Alerta do sistema emitido com sucesso!");
        setShowCreateAlertModal(false);
      } catch (err: any) {
        toast.error(err.message || "Erro ao emitir alerta.");
      }
    });
  };

  // Filtered lists
  const filteredUsers = initialUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredLogs = initialAuditLogs.filter((log) => {
    const query = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.entity.toLowerCase().includes(query) ||
      (log.user?.name && log.user.name.toLowerCase().includes(query)) ||
      (log.user?.email && log.user.email.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-8">
      {/* Super Admin Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-black to-red-950/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(212,175,55,0.08)]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-red-600/30 text-amber-400 shadow-inner">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-wider text-white sm:text-3xl">SUPER ADMIN DECK</h1>
                <span className="rounded-full border border-amber-500/50 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-amber-300 uppercase shadow-sm">
                  ROOT CLEARANCE
                </span>
              </div>
              <p className="mt-1 text-xs text-cx-muted sm:text-sm">
                Controlo centralizado de acessos, emergências, logs de auditoria e parâmetros do sistema CINEMAX.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateStaffModal(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-semibold text-black transition hover:opacity-90 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              <UserPlus className="h-4 w-4" /> Novo Membro/Staff
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tabs Bar */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-md">
        {[
          { id: "overview", label: "Visão Geral", icon: Activity },
          { id: "rbac", label: "Acessos & RBAC", icon: Users, badge: initialUsers.length },
          { id: "emergency", label: "Emergência & Manutenção", icon: AlertTriangle, activeAlert: maintenanceEnabled || killSwitchEnabled },
          { id: "audit", label: "Logs de Auditoria", icon: FileText, badge: stats.auditLogsTotal },
          { id: "alerts", label: "Alertas", icon: AlertTriangle, badge: stats.unresolvedAlertsCount },
          { id: "utilities", label: "Utilitários BD", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all duration-200",
                isActive
                  ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/20"
                  : "text-cx-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-amber-400" : "text-white/40")} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 ? (
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                    tab.id === "alerts" && stats.unresolvedAlertsCount > 0
                      ? "bg-red-500/30 text-red-400 border border-red-500/40"
                      : "bg-white/10 text-white/70"
                  )}
                >
                  {tab.badge}
                </span>
              ) : null}
              {tab.activeAlert ? (
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <AnimatePresence mode="wait">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-cx-muted">Total Utilizadores</span>
                  <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-white">{stats.totalUsers}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-cx-muted">
                  <span className="text-amber-400 font-semibold">{stats.superAdminsCount} Super Admins</span>
                  <span>•</span>
                  <span className="text-blue-400 font-semibold">{stats.staffCount} Staff</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-cx-muted">Receita Acumulada</span>
                  <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
                    <Flame className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-white">
                  {stats.revenueTotal.toLocaleString()} AOA
                </p>
                <p className="mt-2 text-[11px] text-emerald-400 font-medium">
                  Vendas de bilhetes e produtos processados
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-cx-muted">Reservas em Hold</span>
                  <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400">
                    <Zap className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-white">{stats.activeHoldsCount}</p>
                <p className="mt-2 text-[11px] text-cx-muted">Lugares em contagem decrescente (10 min)</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-cx-muted">Estado do Sistema</span>
                  <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400">
                    <Server className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-lg font-bold text-white">ONLINE</span>
                </div>
                <p className="mt-2 text-[11px] text-cx-muted">Base de Dados SQLite & Prisma activas</p>
              </div>
            </div>

            {/* Quick Status Status Banner */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Emergency Status Box */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white tracking-wider flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  SISTEMA DE EMERGÊNCIA & MANUTENÇÃO
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-black/40 p-4 border border-white/5">
                    <div>
                      <p className="text-xs font-medium text-white">Modo de Manutenção</p>
                      <p className="text-[11px] text-cx-muted">Bloqueia acesso ao site público para utilizadores sem privilégio</p>
                    </div>
                    <span className={cn("px-2.5 py-1 text-[10px] font-bold rounded-full border", maintenanceEnabled ? "bg-red-500/20 text-red-400 border-red-500/40" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40")}>
                      {maintenanceEnabled ? "ATIVO" : "NORMAL"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-black/40 p-4 border border-white/5">
                    <div>
                      <p className="text-xs font-medium text-white">Travão de Emergência (Kill Switch)</p>
                      <p className="text-[11px] text-cx-muted">Suspende a criação de novas compras de bilhetes e pedidos</p>
                    </div>
                    <span className={cn("px-2.5 py-1 text-[10px] font-bold rounded-full border", killSwitchEnabled ? "bg-red-500/20 text-red-400 border-red-500/40" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40")}>
                      {killSwitchEnabled ? "ATIVO" : "DESATIVADO"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active System Alerts Card */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white tracking-wider flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-red-400" />
                    ALERTAS CRÍTICOS DO SISTEMA
                  </h3>
                  <button
                    onClick={() => setShowCreateAlertModal(true)}
                    className="text-xs text-amber-400 hover:underline font-medium"
                  >
                    + Emitir Alerta
                  </button>
                </div>
                <div className="space-y-2 max-h-[160px] overflow-y-auto">
                  {initialAlerts.length === 0 ? (
                    <p className="text-xs text-cx-muted py-4 text-center">Nenhum alerta pendente no sistema.</p>
                  ) : (
                    initialAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={cn(
                          "flex items-center justify-between rounded-xl p-3 text-xs border",
                          alert.resolved
                            ? "bg-white/[0.02] border-white/5 text-white/50"
                            : "bg-red-950/20 border-red-500/30 text-white"
                        )}
                      >
                        <div>
                          <p className="font-semibold text-white">{alert.title}</p>
                          <p className="text-[11px] text-cx-muted">{alert.body}</p>
                        </div>
                        {!alert.resolved && (
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/30"
                          >
                            Resolver
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: RBAC & ACCESS CONTROL */}
        {activeTab === "rbac" && (
          <motion.div
            key="rbac"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full rounded-xl bg-white/5 py-2 pl-9 pr-4 text-xs text-white placeholder-white/40 outline-none focus:ring-1 focus:ring-amber-500/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-white/40" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-xl bg-white/5 border border-white/10 py-2 px-3 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-black text-white">Todos os Papéis</option>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value} className="bg-black text-white">
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-cx-muted">
                    <tr>
                      <th className="px-6 py-4">Utilizador</th>
                      <th className="px-6 py-4">Papel (Role)</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4">Último Acesso</th>
                      <th className="px-6 py-4 text-right">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-cx-muted">
                          Nenhum utilizador encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const isSelf = user.id === currentUserId;
                        const roleObj = ROLES.find((r) => r.value === user.role) || ROLES[7];
                        return (
                          <tr key={user.id} className="hover:bg-white/[0.02]">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10 font-bold text-white text-xs">
                                  {user.name[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-white flex items-center gap-1.5">
                                    {user.name}
                                    {isSelf && (
                                      <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.2 rounded-full">
                                        VOCÊ
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-cx-muted">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                disabled={isSelf || isPending}
                                className={cn(
                                  "rounded-lg px-2.5 py-1 text-[11px] font-bold border outline-none cursor-pointer transition",
                                  roleObj.color,
                                  isSelf && "opacity-60 cursor-not-allowed"
                                )}
                              >
                                {ROLES.map((r) => (
                                  <option key={r.value} value={r.value} className="bg-neutral-900 text-white">
                                    {r.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                                  user.status === "ACTIVE"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                    : "bg-red-500/10 text-red-400 border-red-500/30"
                                )}
                              >
                                {user.status === "ACTIVE" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-cx-muted text-[11px]">
                              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("pt-PT") : "Nunca"}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleStatusToggle(user.id, user.status)}
                                disabled={isSelf || isPending}
                                className={cn(
                                  "rounded-lg border px-3 py-1 text-[11px] font-semibold transition",
                                  user.status === "ACTIVE"
                                    ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                    : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
                                  isSelf && "opacity-40 cursor-not-allowed"
                                )}
                              >
                                {user.status === "ACTIVE" ? "Suspender" : "Ativar"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: EMERGENCY & MAINTENANCE */}
        {activeTab === "emergency" && (
          <motion.div
            key="emergency"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              {/* Maintenance Toggle Panel */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Power className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Modo de Manutenção Global</h3>
                    <p className="text-xs text-cx-muted">Ativa o ecrã de manutenção para visitantes</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-semibold text-cx-muted uppercase tracking-wider">
                    Mensagem de Manutenção
                  </label>
                  <textarea
                    rows={3}
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-xs text-white outline-none focus:ring-1 focus:ring-amber-500/50"
                  />
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-cx-muted">Estado actual: {maintenanceEnabled ? "ATIVO" : "DESATIVADO"}</span>
                    <button
                      onClick={handleMaintenanceToggle}
                      disabled={isPending}
                      className={cn(
                        "rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-lg",
                        maintenanceEnabled
                          ? "bg-emerald-600 text-white hover:bg-emerald-500"
                          : "bg-red-600 text-white hover:bg-red-500"
                      )}
                    >
                      {maintenanceEnabled ? "Desativar Manutenção" : "Ativar Modo de Manutenção"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Emergency Kill Switch */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Travão de Emergência de Bilheteira</h3>
                    <p className="text-xs text-cx-muted">Interrompe instantaneamente novas vendas e reservas</p>
                  </div>
                </div>

                <p className="text-xs text-cx-muted leading-relaxed">
                  Ao ativar o Kill Switch, a checkout de bilhetes e a loja de pipocas em todo o portal ficam temporariamente suspensas. Útil para reajustes urgentes de preços, picos não planeados ou manutenção de pagamentos.
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs text-cx-muted">Kill Switch: {killSwitchEnabled ? "ATIVADO" : "DESATIVADO"}</span>
                  <button
                    onClick={handleKillSwitchToggle}
                    disabled={isPending}
                    className={cn(
                      "rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-lg",
                      killSwitchEnabled
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "bg-red-600 text-white hover:bg-red-500"
                    )}
                  >
                    {killSwitchEnabled ? "Reativar Bilheteira" : "ATIVAR TRAVÃO DE EMERGÊNCIA"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === "audit" && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Audit Logs Filter */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Search className="h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Pesquisar nos logs por acção, entidade ou utilizador..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-white/40 outline-none"
              />
            </div>

            {/* Audit Logs Table */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-cx-muted">
                    <tr>
                      <th className="px-6 py-4">Data & Hora</th>
                      <th className="px-6 py-4">Acção</th>
                      <th className="px-6 py-4">Entidade</th>
                      <th className="px-6 py-4">Executado Por</th>
                      <th className="px-6 py-4 text-right">Metadados</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-cx-muted">
                          Nenhum registo de auditoria encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02]">
                          <td className="px-6 py-4 text-cx-muted text-[11px]">
                            {new Date(log.createdAt).toLocaleString("pt-PT")}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white font-medium">{log.entity}</td>
                          <td className="px-6 py-4">
                            {log.user ? (
                              <div>
                                <p className="font-medium text-white">{log.user.name}</p>
                                <p className="text-[10px] text-cx-muted">{log.user.email}</p>
                              </div>
                            ) : (
                              <span className="text-cx-muted italic">SISTEMA</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setSelectedAuditLog(log)}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white hover:bg-white/10"
                            >
                              <Eye className="h-3 w-3" /> Ver JSON
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: ALERTS */}
        {activeTab === "alerts" && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Central de Alertas & Incidentes</h3>
              <button
                onClick={() => setShowCreateAlertModal(true)}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-amber-400"
              >
                + Criar Alerta Manual
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {initialAlerts.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-cx-muted rounded-3xl border border-white/10 bg-white/[0.02]">
                  Nenhum alerta de sistema ativo.
                </div>
              ) : (
                initialAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "rounded-2xl border p-5 space-y-3",
                      alert.resolved
                        ? "border-white/10 bg-white/[0.02] text-white/60"
                        : "border-red-500/40 bg-red-950/20 text-white"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[10px] font-bold text-red-300">
                        {alert.severity}
                      </span>
                      <span className="text-[11px] text-cx-muted">
                        {new Date(alert.createdAt).toLocaleString("pt-PT")}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{alert.title}</h4>
                    <p className="text-xs text-cx-muted">{alert.body}</p>
                    <div className="pt-2 flex items-center justify-between border-t border-white/10">
                      <span className="text-[11px] font-medium text-cx-muted">
                        Estado: {alert.resolved ? "RESOLVIDO" : "PENDENTE"}
                      </span>
                      {!alert.resolved && (
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          disabled={isPending}
                          className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30"
                        >
                          Marcar como Resolvido
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 6: UTILITIES */}
        {activeTab === "utilities" && (
          <motion.div
            key="utilities"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-3">
              {/* Purge Holds Tool */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 w-max border border-purple-500/30">
                  <Database className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-sm text-white">Purga de Seat Holds Expirados</h4>
                <p className="text-xs text-cx-muted">
                  Remove imediatamente todas as reservas de lugares temporárias cujo tempo limite de 10 minutos já caducou.
                </p>
                <button
                  onClick={handlePurgeHolds}
                  disabled={isPending}
                  className="w-full rounded-xl bg-purple-600/30 border border-purple-500/40 py-2.5 text-xs font-bold text-purple-200 transition hover:bg-purple-600/50"
                >
                  Limpar Holds Expirados Agora
                </button>
              </div>

              {/* System Settings Tool */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 w-max border border-blue-500/30">
                  <SlidersHorizontal className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-sm text-white">Parâmetros de CMS & Taxas</h4>
                <p className="text-xs text-cx-muted">
                  Ajuste instantâneo de taxas de serviço, e-mails de suporte e definições globais da marca.
                </p>
                <a
                  href="/admin/configuracoes"
                  className="block text-center w-full rounded-xl bg-blue-600/30 border border-blue-500/40 py-2.5 text-xs font-bold text-blue-200 transition hover:bg-blue-600/50"
                >
                  Abrir Configurações CMS
                </a>
              </div>

              {/* Licensing Sync Tool */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 w-max border border-emerald-500/30">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-sm text-white">Direitos & Licenciamento</h4>
                <p className="text-xs text-cx-muted">
                  Controlo de conformidade territorial e gestão de direitos digitais de transmissão.
                </p>
                <a
                  href="/admin/streaming/licencas"
                  className="block text-center w-full rounded-xl bg-emerald-600/30 border border-emerald-500/40 py-2.5 text-xs font-bold text-emerald-200 transition hover:bg-emerald-600/50"
                >
                  Gerir Licenças de Conteúdo
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: CREATE STAFF USER */}
      {showCreateStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-base text-white">Criar Membro de Staff / Admin</h3>
              <button
                onClick={() => setShowCreateStaffModal(false)}
                className="text-cx-muted hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateStaffSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-cx-muted mb-1">Nome Completo</label>
                <input
                  name="name"
                  required
                  placeholder="Ex: Carlos Manuel"
                  className="w-full rounded-xl bg-white/5 border border-white/10 p-2.5 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-cx-muted mb-1">Email Profissional</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="carlos@cinemax.co.ao"
                  className="w-full rounded-xl bg-white/5 border border-white/10 p-2.5 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-cx-muted mb-1">Palavra-passe Temporária</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white/5 border border-white/10 p-2.5 text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-cx-muted mb-1">Papel / Nível</label>
                  <select
                    name="role"
                    className="w-full rounded-xl bg-neutral-900 border border-white/10 p-2.5 text-white outline-none"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-cx-muted mb-1">Função / Cargo</label>
                  <input
                    name="jobTitle"
                    defaultValue="Supervisão de Operações"
                    className="w-full rounded-xl bg-white/5 border border-white/10 p-2.5 text-white outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-cx-muted mb-1">Cinema Alocado (Opcional)</label>
                <select
                  name="cinemaId"
                  className="w-full rounded-xl bg-neutral-900 border border-white/10 p-2.5 text-white outline-none"
                >
                  <option value="">Rede Global CINEMAX</option>
                  {cinemas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateStaffModal(false)}
                  className="w-1/2 rounded-xl border border-white/10 py-2.5 font-semibold text-cx-muted hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-1/2 rounded-xl bg-amber-500 py-2.5 font-bold text-black hover:bg-amber-400"
                >
                  Criar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE MANUAL SYSTEM ALERT */}
      {showCreateAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-base text-white">Emitir Alerta do Sistema</h3>
              <button
                onClick={() => setShowCreateAlertModal(false)}
                className="text-cx-muted hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateAlertSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-cx-muted mb-1">Título do Alerta</label>
                <input
                  name="title"
                  required
                  placeholder="Ex: Atualização de BD agendada"
                  className="w-full rounded-xl bg-white/5 border border-white/10 p-2.5 text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-cx-muted mb-1">Tipo</label>
                  <select
                    name="type"
                    className="w-full rounded-xl bg-neutral-900 border border-white/10 p-2.5 text-white outline-none"
                  >
                    <option value="SECURITY">Segurança</option>
                    <option value="MAINTENANCE">Manutenção</option>
                    <option value="SYSTEM">Sistema</option>
                  </select>
                </div>
                <div>
                  <label className="block text-cx-muted mb-1">Gravidade</label>
                  <select
                    name="severity"
                    className="w-full rounded-xl bg-neutral-900 border border-white/10 p-2.5 text-white outline-none"
                  >
                    <option value="HIGH">Alta</option>
                    <option value="MEDIUM">Média</option>
                    <option value="CRITICAL">Crítica</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-cx-muted mb-1">Descrição detalhada</label>
                <textarea
                  name="body"
                  required
                  rows={3}
                  placeholder="Detalhes do incidente ou avisos de segurança..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 p-2.5 text-white outline-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateAlertModal(false)}
                  className="w-1/2 rounded-xl border border-white/10 py-2.5 font-semibold text-cx-muted hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-1/2 rounded-xl bg-red-600 py-2.5 font-bold text-white hover:bg-red-500"
                >
                  Emitir Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW AUDIT JSON */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-amber-400" /> Metadados da Auditoria
              </h3>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="text-cx-muted hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p><span className="text-cx-muted">Acção:</span> <strong className="text-amber-400">{selectedAuditLog.action}</strong></p>
              <p><span className="text-cx-muted">Entidade:</span> <strong className="text-white">{selectedAuditLog.entity} ({selectedAuditLog.entityId || "N/A"})</strong></p>
              <div className="mt-4 rounded-xl bg-black p-4 font-mono text-[11px] text-emerald-400 border border-white/10 overflow-x-auto">
                <pre>{JSON.stringify(JSON.parse(selectedAuditLog.metadata || "{}"), null, 2)}</pre>
              </div>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
