import { notFound } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { formatCurrency } from "@/shared/lib/utils";
import Link from "next/link";

export default async function MovieTickets({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cinema?: string; data?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const movie = await prisma.movie.findUnique({ where: { slug } });
  if (!movie) notFound();
  const cinemas = await prisma.cinema.findMany({ where: { status: "ACTIVE" } });
  const cinema = sp.cinema ? cinemas.find((c) => c.slug === sp.cinema) : null;
  const day = sp.data ? new Date(sp.data) : new Date();
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);
  const sessions = await prisma.session.findMany({
    where: {
      movieId: movie.id,
      startsAt: { gte: start, lte: end },
      ...(cinema ? { cinemaId: cinema.id } : {}),
    },
    include: { cinema: true, room: true },
    orderBy: { startsAt: "asc" },
  });
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  return (
    <div className="mx-auto max-w-4xl px-4 pt-28 pb-16">
      <p className="text-xs tracking-[0.3em] text-cx-red">ETAPAS 2–4</p>
      <h1 className="font-display text-4xl">{movie.title}</h1>
      <h2 className="mt-8 text-sm tracking-[0.2em] uppercase">Cinema</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {cinemas.map((c) => (
          <Link
            key={c.id}
            href={`/bilhetes/${slug}?cinema=${c.slug}&data=${sp.data || dates[0]}`}
            className={`rounded-full px-4 py-2 text-sm ${cinema?.id === c.id ? "bg-cx-red" : "border border-white/15"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>
      <h2 className="mt-8 text-sm tracking-[0.2em] uppercase">Data</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {dates.map((d) => (
          <Link
            key={d}
            href={`/bilhetes/${slug}?cinema=${cinema?.slug || cinemas[0]?.slug}&data=${d}`}
            className={`rounded-full px-4 py-2 text-sm ${sp.data === d || (!sp.data && d === dates[0]) ? "bg-white text-black" : "border border-white/15"}`}
          >
            {new Date(d).toLocaleDateString("pt-PT", { weekday: "short", day: "2-digit", month: "short" })}
          </Link>
        ))}
      </div>
      <h2 className="mt-8 text-sm tracking-[0.2em] uppercase">Sessão</h2>
      <div className="mt-4 space-y-3">
        {sessions.map((s) => (
          <Link key={s.id} href={`/checkout/${s.id}`} className="glass flex items-center justify-between rounded-xl p-4">
            <div>
              <p className="font-medium">{s.startsAt.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</p>
              <p className="text-sm text-cx-muted">
                {s.cinema.name} · {s.room.name} · {s.format} · {s.language.toUpperCase()} {s.subtitles ? `· Leg. ${s.subtitles}` : ""}
              </p>
            </div>
            <span className="text-cx-gold">{formatCurrency(s.price)}</span>
          </Link>
        ))}
        {!sessions.length ? <p className="text-cx-muted">Sem sessões neste filtro. Escolha outro cinema ou data.</p> : null}
      </div>
    </div>
  );
}
