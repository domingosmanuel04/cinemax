import { prisma } from "@/server/db/prisma";
import { Cover } from "@/shared/components/Cover";
import Link from "next/link";

export default async function TvPage() {
  const [hero, movies, plus] = await Promise.all([
    prisma.movie.findFirst({ where: { heroEnabled: true } }),
    prisma.movie.findMany({ where: { status: "NOW_SHOWING" }, take: 8, orderBy: { popularity: "desc" } }),
    prisma.movie.findMany({ where: { streamingAvailable: true }, take: 8 }),
  ]);

  return (
    <div className="min-h-screen bg-black px-10 py-12">
      <p className="text-xs tracking-[0.4em] text-cx-gold">CINEMAX SMART TV</p>
      <h1 className="font-display mt-2 text-5xl">YOUR MOVIE. YOUR MOMENT.</h1>
      {hero ? (
        <Link href={`/filmes/${hero.slug}`} className="relative mt-10 block overflow-hidden rounded-[2rem]">
          <Cover src={hero.backdropUrl} alt={hero.title} className="h-[52vh] w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute bottom-10 left-10">
            <p className="text-xs tracking-[0.3em] text-cx-red uppercase">Em destaque</p>
            <h2 className="font-display mt-2 text-4xl">{hero.title}</h2>
            <p className="mt-4 max-w-xl text-white/70">{hero.synopsis}</p>
          </div>
        </Link>
      ) : null}
      <h2 className="font-display mt-12 text-2xl">Em cartaz</h2>
      <div className="mt-4 flex gap-6 overflow-x-auto pb-4">
        {movies.map((m) => (
          <Link key={m.id} href={`/filmes/${m.slug}`} className="w-48 shrink-0">
            <Cover src={m.posterUrl} alt={m.title} className="aspect-[2/3] w-full rounded-2xl" />
            <p className="mt-2 text-lg">{m.title}</p>
          </Link>
        ))}
      </div>
      <h2 className="font-display mt-10 text-2xl">CINEMAX+</h2>
      <div className="mt-4 flex gap-6 overflow-x-auto pb-4">
        {plus.map((m) => (
          <Link key={m.id} href={`/assistir/${m.slug}`} className="w-48 shrink-0">
            <Cover src={m.posterUrl} alt={m.title} className="aspect-[2/3] w-full rounded-2xl" />
            <p className="mt-2 text-lg">{m.title}</p>
          </Link>
        ))}
      </div>
      <p className="mt-12 text-sm text-cx-muted">Comando: ← → para navegar · OK para seleccionar · Back para sair</p>
    </div>
  );
}
