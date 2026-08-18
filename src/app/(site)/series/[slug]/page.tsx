import { notFound } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { cookies } from "next/headers";
import { getDictionary } from "@/shared/lib/i18n";
import { Cover } from "@/shared/components/Cover";
import { TrailerGate } from "@/features/movies/TrailerGate";
import Link from "next/link";

export default async function SeriesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  const dict = getDictionary(locale);
  const series = await prisma.series.findUnique({
    where: { slug },
    include: {
      genres: { include: { genre: true } },
      seasons: { include: { episodes: { orderBy: { number: "asc" } } }, orderBy: { number: "asc" } },
    },
  });
  if (!series) notFound();
  const first = series.seasons[0]?.episodes[0];

  return (
    <div>
      <section className="relative min-h-[70vh] film-grain">
        <Cover src={series.backdropUrl} alt="" className="absolute inset-0 h-full w-full" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 mx-auto flex max-w-[1600px] flex-col gap-8 px-4 pt-32 pb-16 md:flex-row md:px-8">
          <Cover src={series.posterUrl} alt={series.title} className="w-64 rounded-2xl shadow-2xl md:w-72" />
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.3em] text-cx-gold">CINEMAX+</p>
            <h1 className="font-display mt-2 text-5xl">{series.title}</h1>
            <p className="mt-2 text-sm text-cx-muted">
              {series.year} · {series.rating} · {series.seasons.length} {dict.catalog.seasons} · ★ {series.avgRating.toFixed(1)}
            </p>
            <p className="mt-4 text-white/85">{series.synopsis}</p>
            <p className="mt-4 text-sm text-cx-muted">{series.genres.map((g) => g.genre.name).join(", ")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {first && series.streamingAvailable ? (
                <Link href={`/assistir/episodio/${first.id}`} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
                  {dict.catalog.watchEpisode}
                </Link>
              ) : null}
              <TrailerGate title={series.title} src={series.trailerUrl} />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1600px] space-y-10 px-4 py-12 md:px-8">
        {series.seasons.map((season) => (
          <div key={season.id}>
            <h2 className="font-display text-2xl">
              {dict.catalog.season} {season.number}
              {season.title ? ` · ${season.title}` : ""}
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {season.episodes.map((ep) => (
                <Link
                  key={ep.id}
                  href={`/assistir/episodio/${ep.id}`}
                  className="glass flex gap-3 rounded-2xl p-3 hover:border-cx-red"
                >
                  <Cover src={ep.thumbnailUrl || series.backdropUrl} alt="" className="h-20 w-32 rounded-xl" />
                  <div>
                    <p className="text-xs text-cx-muted">
                      {dict.catalog.season} {season.number} · E{ep.number}
                    </p>
                    <p className="font-medium">{ep.title}</p>
                    <p className="line-clamp-2 text-xs text-cx-muted">{ep.synopsis}</p>
                    <p className="mt-1 text-xs text-cx-gold">{ep.durationMin} min</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
