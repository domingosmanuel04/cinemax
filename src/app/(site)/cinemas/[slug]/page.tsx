import { notFound } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import Link from "next/link";
import { formatCurrency } from "@/shared/lib/utils";
import { Cover } from "@/shared/components/Cover";
import { CinemaMap } from "@/shared/components/CinemaMap";

export default async function CinemaDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cinema = await prisma.cinema.findUnique({
    where: { slug },
    include: {
      rooms: true,
      sessions: {
        where: { startsAt: { gte: new Date() } },
        include: { movie: true, room: true },
        orderBy: { startsAt: "asc" },
        take: 24,
      },
    },
  });
  if (!cinema) notFound();
  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-16">
      <div className="relative mb-8 overflow-hidden rounded-[2rem]">
        <Cover src={cinema.imageUrl || ""} alt={cinema.name} className="h-64 w-full md:h-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute bottom-8 left-8">
          <h1 className="font-display text-4xl md:text-5xl">{cinema.name}</h1>
          <p className="mt-2 text-white/70">{cinema.address} · {cinema.city}</p>
        </div>
      </div>
      <CinemaMap
        cinemas={[{ slug: cinema.slug, name: cinema.name, city: cinema.city, latitude: cinema.latitude, longitude: cinema.longitude }]}
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cinema.rooms.map((r) => (
          <Link key={r.id} href="/salas" className="overflow-hidden rounded-2xl border border-white/10">
            <Cover src={r.imageUrl || cinema.imageUrl || ""} alt="" className="h-32 w-full" />
            <div className="p-4">
              <h2>{r.name}</h2>
              <p className="text-sm text-cx-muted">{r.capacity} lugares · {r.soundSystem}</p>
            </div>
          </Link>
        ))}
      </div>
      <h2 className="font-display mt-10 text-2xl">Sessões</h2>
      <div className="mt-4 space-y-3">
        {cinema.sessions.map((s) => (
          <Link key={s.id} href={`/checkout/${s.id}`} className="glass flex items-center gap-4 rounded-xl p-3">
            <Cover src={s.movie.posterUrl} alt="" className="h-16 w-12 rounded-lg" />
            <div className="flex-1">
              <p>{s.movie.title}</p>
              <p className="text-sm text-cx-muted">{s.startsAt.toLocaleString("pt-PT")} · {s.room.name} · {s.format}</p>
            </div>
            <span className="text-cx-gold">{formatCurrency(s.price)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
