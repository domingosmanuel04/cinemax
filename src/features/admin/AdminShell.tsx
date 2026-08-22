"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Bell,
  Clapperboard,
  Cpu,
  LayoutDashboard,
  MapPin,
  Menu,
  Package,
  Settings,
  Sparkles,
  Ticket,
  Users,
  X,
  BarChart3,
  Film,
  Armchair,
  CalendarDays,
  CreditCard,
  Megaphone,
  Shield,
  ShieldAlert,
  ScanLine,
  Mail,
  Tv,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Logo } from "@/shared/components/Logo";
import type { Dictionary } from "@/shared/lib/i18n";

const GROUPS: { title: keyof Dictionary["admin"]; items: { href: string; label: keyof Dictionary["admin"]; icon: typeof LayoutDashboard }[] }[] = [
  {
    title: "operations",
    items: [
      { href: "/admin", label: "dashboard", icon: LayoutDashboard },
      { href: "/admin/command-center", label: "commandCenter", icon: Activity },
      { href: "/admin/check-in", label: "checkin", icon: ScanLine },
    ],
  },
  {
    title: "content",
    items: [
      { href: "/admin/conteudo/filmes", label: "movies", icon: Film },
      { href: "/admin/conteudo/series", label: "series", icon: Clapperboard },
      { href: "/admin/conteudo/banners", label: "banners", icon: Tv },
    ],
  },
  {
    title: "cinema",
    items: [
      { href: "/admin/cinema/cinemas", label: "cinemas", icon: MapPin },
      { href: "/admin/cinema/salas", label: "rooms", icon: Armchair },
      { href: "/admin/cinema/sessoes", label: "sessions", icon: CalendarDays },
    ],
  },
  {
    title: "sales",
    items: [
      { href: "/admin/vendas/bilhetes", label: "tickets", icon: Ticket },
      { href: "/admin/vendas/pedidos", label: "orders", icon: Package },
      { href: "/admin/vendas/pagamentos", label: "payments", icon: CreditCard },
    ],
  },
  {
    title: "growth",
    items: [
      { href: "/admin/clientes", label: "customers", icon: Users },
      { href: "/admin/marketing/promocoes", label: "promotions", icon: Megaphone },
      { href: "/admin/marketing/campanhas", label: "campaigns", icon: Sparkles },
      { href: "/admin/relatorios", label: "reports", icon: BarChart3 },
      { href: "/admin/ia", label: "ai", icon: Cpu },
    ],
  },
  {
    title: "system",
    items: [
      { href: "/admin/super-admin", label: "superAdmin", icon: ShieldAlert },
      { href: "/admin/streaming/licencas", label: "licenses", icon: Shield },
      { href: "/admin/inventario", label: "inventory", icon: Package },
      { href: "/admin/funcionarios", label: "staff", icon: Users },
      { href: "/admin/emails", label: "emails", icon: Mail },
      { href: "/admin/configuracoes", label: "settings", icon: Settings },
    ],
  },
];

export function AdminShell({
  children,
  userName,
  role,
  dict,
}: {
  children: React.ReactNode;
  userName: string;
  role: string;
  dict: Dictionary;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-6">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.28em] text-cx-gold/80 uppercase">{dict.admin[g.title]}</p>
          <div className="space-y-0.5">
            {g.items.map((item) => {
              const Icon = item.icon;
              const active = path === item.href || (item.href !== "/admin" && path.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                    active
                      ? "bg-cx-red/15 text-white shadow-[inset_3px_0_0_#e50914]"
                      : "text-white/55 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-cx-red" : "text-white/40")} />
                  {dict.admin[item.label]}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="admin-shell min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="relative hidden overflow-y-auto border-r border-white/10 bg-[#080808] lg:block">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_200px_at_0%_0%,rgba(229,9,20,0.18),transparent)]" />
        <div className="relative p-5">
          <Logo />
          <p className="mt-3 text-[10px] tracking-[0.35em] text-cx-gold">{dict.admin.deck}</p>
          <div className="mt-8">{nav}</div>
          <Link href="/" className="mt-10 block text-xs text-white/40 hover:text-white">
            ← {dict.admin.publicSite}
          </Link>
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/80 p-4 lg:hidden">
          <div className="flex items-center justify-between">
            <Logo />
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar">
              <X />
            </button>
          </div>
          <div className="mt-6 max-h-[80vh] overflow-y-auto">{nav}</div>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#050505]/80 px-4 py-3 backdrop-blur-xl lg:px-8">
          <button type="button" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
            <Menu />
          </button>
          <div className="hidden items-center gap-2 text-xs text-cx-muted md:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            {dict.admin.systems}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/admin/command-center" className="flex items-center gap-2 rounded-full border border-cx-red/30 bg-cx-red/10 px-3 py-1.5 text-[11px] tracking-[0.2em] text-cx-red uppercase">
              <Activity className="h-3.5 w-3.5" /> Live
            </Link>
            <Link href="/admin/ia" className="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 sm:block">
              {dict.admin.askData}
            </Link>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/5">
              <Bell className="h-4 w-4 text-white/60" />
            </span>
            <div className="text-right">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-[10px] tracking-wider text-cx-gold">{role.replace("_", " ")}</p>
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
