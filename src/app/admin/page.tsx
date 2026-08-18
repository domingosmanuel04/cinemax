import { prisma } from "@/server/db/prisma";
import { formatCurrency } from "@/shared/lib/utils";
import { DashboardCharts } from "@/features/admin/DashboardCharts";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";
import { LiveRefresh } from "@/features/admin/LiveRefresh";
import Link from "next/link";
import { Clapperboard, Ticket, Users, Wallet, Activity, Popcorn, Crown, Armchair } from "lucide-react";

export default async function AdminHome() {
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const startMonth = new Date(startToday.getFullYear(), startToday.getMonth(), 1);

  const [revToday, revMonth, tickets, sessionsToday, users, subs, productsSold, sessions, liveMovies, cinemas, recentTickets] =
    await Promise.all([
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID", paidAt: { gte: startToday } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID", paidAt: { gte: startMonth } } }),
      prisma.ticket.count({ where: { status: { in: ["PAID", "USED"] } } }),
      prisma.session.count({ where: { startsAt: { gte: startToday } } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.orderItem.aggregate({ _sum: { quantity: true } }),
      prisma.session.findMany({
        where: { startsAt: { gte: new Date(Date.now() - 86400000 * 14) } },
        include: { tickets: true, cinema: true, movie: true, room: true },
      }),
      prisma.movie.findMany({ where: { status: "NOW_SHOWING" }, take: 8, orderBy: { popularity: "desc" } }),
      prisma.cinema.findMany({ where: { status: "ACTIVE" }, include: { rooms: true } }),
      prisma.ticket.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { user: true, session: { include: { movie: true, cinema: true } } },
      }),
    ]);

  const occ =
    sessions.reduce((s, x) => s + x.tickets.length, 0) /
    Math.max(1, sessions.reduce((s, x) => s + x.room.capacity, 0));

  const byDay = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    return { day: key.slice(5), revenue: 0 };
  });

  const payments = await prisma.payment.findMany({
    where: { status: "PAID", paidAt: { gte: new Date(Date.now() - 86400000 * 14) } },
  });
  for (const p of payments) {
    const key = (p.paidAt || p.createdAt).toISOString().slice(5, 10);
    const row = byDay.find((x) => x.day === key);
    if (row) row.revenue += p.amount;
  }

  const byCinemaMap = new Map<string, number>();
  for (const s of sessions) {
    byCinemaMap.set(s.cinema.name, (byCinemaMap.get(s.cinema.name) || 0) + s.tickets.length);
  }
  const byCinema = [...byCinemaMap.entries()].map(([name, value]) => ({ name, value }));

  const cards = [
    { label: "Receita hoje", value: formatCurrency(revToday._sum.amount || 0), icon: Wallet, tone: "from-cx-gold/20" },
    { label: "Receita este mês", value: formatCurrency(revMonth._sum.amount || 0), icon: Activity, tone: "from-white/10" },
    { label: "Bilhetes vendidos", value: String(tickets), icon: Ticket, tone: "from-cx-red/25" },
    { label: "Sessões hoje", value: String(sessionsToday), icon: Clapperboard, tone: "from-white/10" },
    { label: "Ocupação", value: `${Math.round(occ * 100)}%`, icon: Armchair, tone: "from-emerald-500/20" },
    { label: "Clientes", value: String(users), icon: Users, tone: "from-white/10" },
    { label: "CINEMAX+", value: String(subs), icon: Crown, tone: "from-cx-gold/20" },
    { label: "Extras", value: String(productsSold._sum.quantity || 0), icon: Popcorn, tone: "from-amber-700/20" },
  ];

  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-[2rem]">
        <Cover src={AMBIENCE.seats} alt="" className="h-56 w-full md:h-64" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.35em] text-cx-gold uppercase">CINEMAX Command Deck</p>
              <h1 className="font-display mt-2 text-4xl tracking-[0.12em] md:text-5xl">DASHBOARD</h1>
              <p className="mt-2 max-w-xl text-sm text-white/70">Receita, ocupação e o pulso da rede — em tempo quase real.</p>
            </div>
            <LiveRefresh seconds={8} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${c.tone} to-transparent p-5`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-cx-muted">{c.label}</p>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-black/40">
                  <Icon className="h-4 w-4 text-white" />
                </span>
              </div>
              <p className="mt-4 text-2xl font-semibold tracking-tight">{c.value}</p>
            </div>
          );
        })}
      </div>
      <DashboardCharts revenue={byDay} cinemas={byCinema} />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="mb-4 font-display tracking-[0.15em]">EM CARTAZ</h2>
          <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
            {liveMovies.map((m) => (
              <Link key={m.id} href={`/admin/conteudo/filmes/${m.id}`} className="group overflow-hidden rounded-2xl">
                <Cover src={m.posterUrl} alt={m.title} className="aspect-[2/3] w-full transition group-hover:scale-105" />
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-4 font-display tracking-[0.15em]">REDE</h2>
          <div className="space-y-3">
            {cinemas.map((c) => (
              <Link key={c.id} href={`/cinemas/${c.slug}`} className="flex overflow-hidden rounded-2xl border border-white/10">
                <Cover src={c.imageUrl || ""} alt="" className="h-20 w-28" />
                <div className="flex flex-1 items-center justify-between px-4">
                  <div>
                    <p className="text-sm">{c.name}</p>
                    <p className="text-xs text-cx-muted">{c.city} · {c.rooms.length} salas</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <h2 className="mt-10 mb-4 font-display tracking-[0.15em]">ÚLTIMOS BILHETES</h2>
      <div className="space-y-2">
        {recentTickets.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <Cover src={t.session.movie.posterUrl} alt="" className="h-12 w-8 rounded" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{t.session.movie.title}</p>
              <p className="text-xs text-cx-muted">{t.user.name} · {t.session.cinema.name}</p>
            </div>
            <span className="text-[10px] tracking-wider text-cx-gold">{t.status}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/admin/command-center" className="rounded-full bg-cx-red px-5 py-2">Command Center</Link>
        <Link href="/admin/check-in" className="rounded-full border border-white/15 px-5 py-2">Check-in QR</Link>
        <Link href="/admin/relatorios" className="rounded-full border border-white/15 px-5 py-2">Relatórios</Link>
      </div>
    </div>
  );
}
