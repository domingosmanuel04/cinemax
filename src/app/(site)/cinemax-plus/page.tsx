import { prisma } from "@/server/db/prisma";
import { formatCurrency, parseJson } from "@/shared/lib/utils";
import { MovieCarousel } from "@/shared/components/MovieCarousel";
import { getSession } from "@/server/auth/session";
import { recommendMovies } from "@/server/services/recommendations";
import Link from "next/link";
import { SubscribeButton } from "@/features/plus/SubscribeButton";
import { Cover } from "@/shared/components/Cover";

export default async function PlusPage() {
  const user = await getSession();
  const [plans, movies, series, rec, continueWatching] = await Promise.all([
    prisma.subscriptionPlan.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.movie.findMany({ where: { streamingAvailable: true }, include: { genres: { include: { genre: true } } }, take: 16 }),
    prisma.series.findMany({ take: 8 }),
    recommendMovies(user?.id, 10),
    user
      ? prisma.watchHistory.findMany({
          where: { userId: user.id, completed: false },
          include: { movie: { include: { genres: { include: { genre: true } } } } },
          take: 8,
        })
      : Promise.resolve([]),
  ]);
  const hero = movies[0];
  const sub = user
    ? await prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE" }, include: { plan: true } })
    : null;

  return (
    <div>
      <section className="relative min-h-[80vh]">
        {hero ? (
          <>
            <Cover src={hero.backdropUrl} alt="" className="absolute inset-0 h-full w-full" />
            <div className="hero-overlay absolute inset-0" />
            <div className="relative z-10 mx-auto max-w-[1600px] px-4 pt-40 pb-16 md:px-8">
              <p className="text-xs tracking-[0.4em] text-cx-gold">CINEMAX+</p>
              <h1 className="font-display mt-2 text-5xl md:text-7xl">{hero.title}</h1>
              <p className="mt-4 max-w-xl text-white/80">{hero.synopsis}</p>
              <div className="mt-6 flex gap-3">
                <Link href={`/assistir/${hero.slug}`} className="rounded-full bg-white px-6 py-3 font-semibold text-black">
                  Assistir
                </Link>
                <Link href={`/filmes/${hero.slug}`} className="rounded-full border border-white/20 px-6 py-3">
                  Detalhes
                </Link>
              </div>
            </div>
          </>
        ) : null}
      </section>

      <div className="space-y-16 px-0 py-12">
        {continueWatching.length ? (
          <MovieCarousel
            title="Continuar Assistindo"
            movies={continueWatching.map((w) => w.movie!).filter(Boolean)}
          />
        ) : null}
        <MovieCarousel title="Recomendados" kicker="CINEMAX AI" movies={rec} />
        <MovieCarousel title="Mais Populares" movies={movies} />
        <section className="px-4 md:px-8">
          <h2 className="font-display text-2xl">Séries originais</h2>
          <div className="mt-4 flex gap-4 overflow-x-auto">
            {series.map((s) => (
              <Link key={s.id} href={`/series/${s.slug}`} className="w-44 shrink-0">
                <Cover src={s.posterUrl} alt={s.title} className="aspect-[2/3] rounded-xl" />
                <p className="mt-2 text-sm">{s.title}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-center text-4xl">PLANOS CINEMAX+</h2>
        {sub ? <p className="mt-2 text-center text-cx-gold">Plano activo: {sub.plan.name}</p> : null}
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => (
            <article key={p.id} className={`glass rounded-2xl p-6 ${p.highlight ? "ring-1 ring-cx-red" : ""}`}>
              <h3 className="font-display tracking-[0.15em]">{p.name}</h3>
              <p className="mt-2 text-sm text-cx-muted">{p.tagline}</p>
              <p className="mt-4 text-3xl">{formatCurrency(p.monthlyPrice)}<span className="text-sm text-cx-muted">/mês</span></p>
              <p className="text-xs text-cx-muted">ou {formatCurrency(p.yearlyPrice)}/ano · {p.trialDays} dias trial</p>
              <ul className="mt-4 space-y-1 text-sm text-cx-muted">
                {parseJson<string[]>(p.features, []).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <SubscribeButton planId={p.id} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
