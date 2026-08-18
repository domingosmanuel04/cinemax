import { prisma } from "@/server/db/prisma";
import { LiveRefresh } from "@/features/admin/LiveRefresh";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";

function Dot({ level }: { level: "GREEN" | "YELLOW" | "RED" }) {
  const c = level === "GREEN" ? "bg-emerald-400" : level === "YELLOW" ? "bg-amber-400" : "bg-cx-red";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${c} shadow-[0_0_10px_currentColor]`} />;
}

export default async function CommandCenter() {
  const now = new Date();
  const soon = new Date(now.getTime() + 3 * 3600000);
  const [live, alerts, payments, licenses] = await Promise.all([
    prisma.session.findMany({
      where: { startsAt: { lte: soon }, endsAt: { gte: now } },
      include: { movie: true, cinema: true, room: true, tickets: true },
    }),
    prisma.alert.findMany({ where: { resolved: false }, orderBy: { createdAt: "desc" } }),
    prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.contentLicense.findMany({ where: { endsAt: { lte: new Date(Date.now() + 86400000 * 30) } }, include: { movie: true } }),
  ]);

  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-[2rem]">
        <Cover src={AMBIENCE.projector} alt="" className="h-44 w-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-end justify-between p-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl">COMMAND CENTER</h1>
            <p className="mt-1 text-sm text-cx-muted">Operações em tempo quase-real</p>
          </div>
          <LiveRefresh seconds={5} />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["Sistemas", "GREEN", "API · DB · Auth online"],
          ["Pagamentos", payments.some((p) => p.status === "FAILED") ? "YELLOW" : "GREEN", "Gateway mock operacional"],
          ["Streaming", "GREEN", "Player demo + licenças"],
          ["Alertas", alerts.length ? "YELLOW" : "GREEN", `${alerts.length} abertos`],
        ].map(([k, l, v]) => (
          <div key={k} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="flex items-center gap-2 text-sm">
              <Dot level={l as "GREEN"} /> {k}
            </p>
            <p className="mt-2 text-xs text-cx-muted">{v}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-8 text-lg">Sessões a decorrer / iminentes</h2>
      <div className="mt-3 space-y-2">
        {live.map((s) => {
          const occ = s.tickets.length / Math.max(1, s.room.capacity);
          return (
            <div key={s.id} className="flex items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <Cover src={s.movie.posterUrl} alt="" className="h-20 w-14" />
              <div className="flex flex-1 items-center justify-between py-3 pr-4 text-sm">
                <span>
                  {s.movie.title} · {s.cinema.name} · {s.room.name}
                </span>
                <span className="flex items-center gap-2">
                  <Dot level={occ > 0.85 ? "RED" : occ < 0.2 ? "YELLOW" : "GREEN"} />
                  {Math.round(occ * 100)}% · {s.tickets.length} bilhetes
                </span>
              </div>
            </div>
          );
        })}
        {!live.length ? <p className="text-cx-muted">Sem sessões neste intervalo.</p> : null}
      </div>
      <h2 className="mt-8 text-lg">Alertas</h2>
      <ul className="mt-3 space-y-2">
        {alerts.map((a) => (
          <li key={a.id} className="rounded-xl border border-white/10 p-3 text-sm">
            <Dot level={a.severity as "YELLOW"} /> {a.title} — {a.body}
          </li>
        ))}
        {licenses.map((l) => (
          <li key={l.id} className="rounded-xl border border-white/10 p-3 text-sm">
            <Dot level="YELLOW" /> Licença {l.movie?.title} expira em {l.endsAt.toLocaleDateString("pt-PT")}
          </li>
        ))}
      </ul>
    </div>
  );
}
