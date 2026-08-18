import { prisma } from "@/server/db/prisma";
import { MovieCard } from "@/shared/components/MovieCard";
import Link from "next/link";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";

export default async function BilhetesIndex({
  searchParams,
}: {
  searchParams: Promise<{ cinema?: string }>;
}) {
  const sp = await searchParams;
  const movies = await prisma.movie.findMany({
    where: { cinemaAvailable: true, status: { in: ["NOW_SHOWING", "COMING_SOON"] } },
    include: { genres: { include: { genre: true } } },
    orderBy: { popularity: "desc" },
  });
  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-28 pb-16 md:px-8">
      <div className="relative mb-10 overflow-hidden rounded-3xl">
        <Cover src={AMBIENCE.seats} alt="" className="h-48 w-full md:h-56" />
        <div className="absolute inset-0 bg-gradient-to-t from-black" />
        <div className="absolute bottom-8 left-8">
          <p className="text-xs tracking-[0.3em] text-cx-red">ETAPA 1</p>
          <h1 className="font-display text-4xl md:text-5xl">ESCOLHER FILME</h1>
          <p className="mt-2 text-white/70">Filme → Sessão → Assento → Extras → Pagamento → Confirmação</p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-5">
        {movies.map((m) => (
          <div key={m.id}>
            <MovieCard movie={m} />
            <Link href={`/bilhetes/${m.slug}${sp.cinema ? `?cinema=${sp.cinema}` : ""}`} className="mt-2 inline-block text-xs text-cx-red">
              Seleccionar
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
