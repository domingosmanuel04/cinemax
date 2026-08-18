import { notFound } from "next/navigation";
import { getMovieBySlug } from "@/server/queries/catalog";
import { formatDuration, parseJson } from "@/shared/lib/utils";
import { MovieCarousel } from "@/shared/components/MovieCarousel";
import { prisma } from "@/server/db/prisma";
import Link from "next/link";
import { Cover } from "@/shared/components/Cover";
import { TrailerGate } from "@/features/movies/TrailerGate";
import { ReviewForm } from "@/features/movies/ReviewForm";
import { cookies } from "next/headers";
import { getDictionary } from "@/shared/lib/i18n";

export default async function MoviePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ trailer?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const movie = await getMovieBySlug(slug);
  if (!movie) notFound();
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  const dict = getDictionary(locale);
  const formats = parseJson<string[]>(movie.formats, []);
  const similar = movie.similarFrom.map((s) => s.similar);
  const sessions = await prisma.session.findMany({
    where: { movieId: movie.id, startsAt: { gte: new Date() } },
    include: { cinema: true, room: true },
    orderBy: { startsAt: "asc" },
    take: 8,
  });

  return (
    <div>
      <section className="relative min-h-[78vh] film-grain">
        <Cover src={movie.backdropUrl} alt="" className="absolute inset-0 h-full w-full" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 mx-auto flex max-w-[1600px] flex-col gap-8 px-4 pt-32 pb-16 md:flex-row md:px-8">
          <Cover src={movie.posterUrl} alt={`Poster de ${movie.title}`} className="w-64 rounded-2xl shadow-2xl md:w-72" />
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl">{movie.title}</h1>
            <p className="mt-2 text-sm text-cx-muted">
              {movie.originalTitle} · {movie.year} · {formatDuration(movie.durationMin)} · {movie.rating} · ★ {movie.avgRating.toFixed(1)} ({movie.voteCount})
            </p>
            <p className="mt-4 text-white/85">{movie.synopsis}</p>
            <p className="mt-4 text-sm text-cx-muted">
              Direcção: {movie.director} · Géneros: {movie.genres.map((g) => g.genre.name).join(", ")} · Formatos: {formats.join(", ")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {movie.streamingAvailable ? (
                <Link href={`/assistir/${movie.slug}`} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
                  {dict.actions.watch}
                </Link>
              ) : null}
              {movie.cinemaAvailable ? (
                <Link href={`/bilhetes/${movie.slug}`} className="rounded-full bg-cx-red px-5 py-3 text-sm font-semibold">
                  {dict.actions.buyTicket}
                </Link>
              ) : null}
              <Link href={`/conta/lista?add=${movie.slug}`} className="rounded-full border border-white/20 px-5 py-3 text-sm">
                {dict.actions.addList}
              </Link>
              <TrailerGate open={sp.trailer === "1"} title={movie.title} src={movie.trailerUrl} />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1600px] space-y-12 px-4 py-12 md:px-8">
        <div>
          <h2 className="font-display text-2xl">{dict.catalog.cast}</h2>
          <div className="mt-4 flex gap-4 overflow-x-auto">
            {movie.cast.map((c) => (
              <div key={c.id} className="w-28 shrink-0 text-sm">
                <Cover src={c.person.photoUrl || ""} alt={c.person.name} className="mb-2 h-28 w-28 rounded-full" />
                <p>{c.person.name}</p>
                <p className="text-cx-muted">{c.character}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-2xl">{dict.catalog.upcomingSessions}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {sessions.map((s) => (
              <Link key={s.id} href={`/checkout/${s.id}`} className="glass rounded-xl p-4 hover:border-cx-red">
                <p>{s.cinema.name} · {s.room.name}</p>
                <p className="text-sm text-cx-muted">
                  {s.startsAt.toLocaleString("pt-PT")} · {s.format} · {s.language.toUpperCase()}
                </p>
              </Link>
            ))}
            {!sessions.length ? <p className="text-cx-muted">{dict.catalog.noSessions}</p> : null}
          </div>
        </div>
        <MovieCarousel title={dict.catalog.alsoLike} kicker="CINEMAX AI" movies={similar} />
        <div>
          <h2 className="font-display text-2xl">{dict.catalog.reviews}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {movie.reviews.map((r) => (
              <article key={r.id} className="glass rounded-xl p-4">
                <p className="text-cx-gold">{"★".repeat(r.rating)}</p>
                <p className="mt-2 text-sm">{r.body}</p>
                <p className="mt-2 text-xs text-cx-muted">{r.user.name}</p>
              </article>
            ))}
          </div>
          <ReviewForm movieId={movie.id} />
        </div>
      </section>
    </div>
  );
}
