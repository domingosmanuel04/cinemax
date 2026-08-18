import { prisma } from "@/server/db/prisma";
import { parseJson } from "@/shared/lib/utils";
import Link from "next/link";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";

export default async function SalasPage() {
  const rooms = await prisma.room.findMany({ include: { cinema: true, sessions: { where: { startsAt: { gte: new Date() } }, include: { movie: true }, take: 3, orderBy: { startsAt: "asc" } } } });
  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-28 pb-16 md:px-8">
      <div className="relative mb-10 overflow-hidden rounded-3xl">
        <Cover src={AMBIENCE.seats} alt="" className="h-48 w-full md:h-64" />
        <div className="absolute inset-0 bg-gradient-to-t from-black" />
        <div className="absolute bottom-8 left-8">
          <h1 className="font-display text-5xl">SALAS</h1>
          <p className="mt-2 text-white/70">IMAX, VIP, Atmos — o ritual começa na sala.</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {rooms.map((r) => (
          <article key={r.id} className="overflow-hidden rounded-2xl border border-white/10">
            <Cover src={r.imageUrl || r.cinema.imageUrl || ""} alt={r.name} className="h-52 w-full" />
            <div className="p-5">
              <p className="text-xs tracking-[0.2em] text-cx-red uppercase">{r.cinema.name}</p>
              <h2 className="mt-1 text-xl">{r.name}</h2>
              <p className="mt-2 text-sm text-cx-muted">
                {r.capacity} lugares · {r.screenType} · {r.soundSystem} · {parseJson<string[]>(r.formats, []).join("/")}
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                {r.sessions.map((s) => (
                  <li key={s.id}>
                    <Link href={`/checkout/${s.id}`} className="hover:text-cx-red">
                      {s.movie.title} · {s.startsAt.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
