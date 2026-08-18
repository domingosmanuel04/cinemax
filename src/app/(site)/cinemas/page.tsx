import { prisma } from "@/server/db/prisma";
import Link from "next/link";
import { parseJson } from "@/shared/lib/utils";
import { CinemaMap } from "@/shared/components/CinemaMap";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";

export default async function CinemasPage() {
  const cinemas = await prisma.cinema.findMany({ include: { rooms: true } });
  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-28 pb-16 md:px-8">
      <div className="relative mb-10 overflow-hidden rounded-3xl">
        <Cover src={AMBIENCE.lobby} alt="" className="h-56 w-full md:h-72" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-8 left-8">
          <h1 className="font-display text-5xl">CINEMAS</h1>
          <p className="mt-2 text-white/70">Rede CINEMAX em Angola — salas, sessões e acessibilidade.</p>
        </div>
      </div>
      <CinemaMap
        cinemas={cinemas.map((c) => ({
          slug: c.slug,
          name: c.name,
          city: c.city,
          latitude: c.latitude,
          longitude: c.longitude,
        }))}
      />
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cinemas.map((c) => (
          <article key={c.id} className="overflow-hidden rounded-3xl border border-white/10 bg-black">
            <Cover src={c.imageUrl || ""} alt={c.name} className="h-56 w-full" />
            <div className="p-5">
              <h2 className="text-xl">{c.name}</h2>
              <p className="text-sm text-cx-muted">
                {c.address}, {c.city}
              </p>
              <p className="mt-2 text-sm">
                {c.openingHours} · {c.phone}
              </p>
              <p className="mt-2 text-xs text-cx-gold">{parseJson<string[]>(c.services, []).join(" · ")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/cinemas/${c.slug}`} className="rounded-full bg-cx-red px-4 py-2 text-xs">
                  VER SESSÕES
                </Link>
                <Link href={`/bilhetes?cinema=${c.slug}`} className="rounded-full border border-white/20 px-4 py-2 text-xs">
                  COMPRAR BILHETE
                </Link>
                <a
                  href={`https://maps.google.com/?q=${c.latitude},${c.longitude}`}
                  className="rounded-full border border-white/20 px-4 py-2 text-xs"
                  target="_blank"
                  rel="noreferrer"
                >
                  VER LOCALIZAÇÃO
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
