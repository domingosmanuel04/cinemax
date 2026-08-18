import { prisma } from "@/server/db/prisma";
import { formatCurrency } from "@/shared/lib/utils";
import Link from "next/link";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";

export default async function SessoesPage() {
  const sessions = await prisma.session.findMany({
    where: { startsAt: { gte: new Date() }, status: "SCHEDULED" },
    include: { movie: true, cinema: true, room: true },
    orderBy: { startsAt: "asc" },
    take: 60,
  });
  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-16">
      <div className="relative mb-10 overflow-hidden rounded-3xl">
        <Cover src={AMBIENCE.projector} alt="" className="h-44 w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black" />
        <div className="absolute bottom-8 left-8">
          <h1 className="font-display text-5xl">SESSÕES</h1>
        </div>
      </div>
      <div className="space-y-3">
        {sessions.map((s) => (
          <Link key={s.id} href={`/checkout/${s.id}`} className="flex items-center gap-4 overflow-hidden rounded-2xl border border-white/10 p-3">
            <Cover src={s.movie.posterUrl} alt="" className="h-20 w-14 rounded-lg" />
            <div className="flex-1">
              <p className="font-medium">{s.movie.title}</p>
              <p className="text-sm text-cx-muted">
                {s.cinema.name} · {s.room.name} · {s.startsAt.toLocaleString("pt-PT")} · {s.format} · {s.language.toUpperCase()}
              </p>
            </div>
            <span className="text-cx-gold">{formatCurrency(s.price)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
