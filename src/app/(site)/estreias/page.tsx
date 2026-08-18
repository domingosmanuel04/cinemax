import { prisma } from "@/server/db/prisma";
import { formatCountdown } from "@/shared/lib/utils";
import Link from "next/link";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";

export default async function EstreiasPage() {
  const movies = await prisma.movie.findMany({
    where: { status: "COMING_SOON" },
    orderBy: { releaseDate: "asc" },
  });
  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-16">
      <div className="relative mb-10 overflow-hidden rounded-3xl">
        <Cover src={AMBIENCE.projector} alt="" className="h-48 w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black" />
        <div className="absolute bottom-8 left-8">
          <h1 className="font-display text-5xl">ESTREIAS</h1>
        </div>
      </div>
      <div className="space-y-6">
        {movies.map((m) => (
          <Link key={m.id} href={`/filmes/${m.slug}`} className="flex overflow-hidden rounded-2xl border border-white/10">
            <Cover src={m.posterUrl} alt="" className="h-48 w-32" />
            <Cover src={m.backdropUrl} alt="" className="hidden h-48 flex-1 sm:block" />
            <div className="min-w-0 flex-1 p-4">
              <h2 className="text-xl">{m.title}</h2>
              <p className="mt-2 font-display tracking-[0.2em] text-cx-red">
                ESTREIA EM {m.releaseDate ? formatCountdown(m.releaseDate) : "—"}
              </p>
              <p className="mt-2 line-clamp-3 text-sm text-cx-muted">{m.synopsis}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
