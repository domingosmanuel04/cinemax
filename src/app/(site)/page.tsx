import { HeroBanner } from "@/shared/components/HeroBanner";
import { MovieCarousel } from "@/shared/components/MovieCarousel";
import { Reveal, SectionTitle } from "@/shared/components/Reveal";
import { getDictionary } from "@/shared/lib/i18n";
import { formatCountdown, formatCurrency } from "@/shared/lib/utils";
import { prisma } from "@/server/db/prisma";
import { recommendMovies } from "@/server/services/recommendations";
import { getSession } from "@/server/auth/session";
import { getSettings } from "@/server/services/settings";
import Link from "next/link";
import { cookies } from "next/headers";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";
import { JsonLd } from "@/shared/components/JsonLd";

export default async function HomePage() {
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  const kids = (await cookies()).get("cinemax-kids")?.value === "1";
  const dict = getDictionary(locale);
  const session = await getSession();
  const settings = await getSettings();

  const [hero, releases, coming, showing, ranked, recommended, products, promotions, cinemas, banners] =
    await Promise.all([
      prisma.movie.findFirst({ where: { heroEnabled: true }, include: { genres: { include: { genre: true } } }, orderBy: { heroOrder: "asc" } }),
      prisma.movie.findMany({ where: { status: "NOW_SHOWING", ...(kids ? { OR: [{ rating: { in: ["M/6", "M/12"] } }, { genres: { some: { genre: { slug: "animacao" } } } }] } : {}) }, include: { genres: { include: { genre: true } } }, orderBy: { releaseDate: "desc" }, take: 12 }),
      prisma.movie.findMany({ where: { status: "COMING_SOON" }, include: { genres: { include: { genre: true } } }, orderBy: { releaseDate: "asc" }, take: 8 }),
      prisma.movie.findMany({ where: { cinemaAvailable: true, status: "NOW_SHOWING" }, include: { genres: { include: { genre: true } } }, take: 12 }),
      prisma.movie.findMany({ where: { status: "NOW_SHOWING" }, orderBy: { popularity: "desc" }, take: 4, include: { genres: { include: { genre: true } } } }),
      recommendMovies(session?.id, 10),
      prisma.product.findMany({ where: { status: "ACTIVE" }, take: 12 }),
      prisma.promotion.findMany({ where: { active: true }, take: 4 }),
      prisma.cinema.findMany({ where: { status: "ACTIVE" } }),
      prisma.banner.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    ]);

  const plus = await prisma.movie.findMany({
    where: { streamingAvailable: true },
    include: { genres: { include: { genre: true } } },
    take: 10,
  });

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MovieTheater",
          name: "CINEMAX",
          slogan: "Your Movie. Your Moment.",
          url: process.env.NEXT_PUBLIC_APP_URL,
        }}
      />
      {hero ? (
        <HeroBanner movie={hero} dict={dict} videoUrl={settings.heroVideoUrl || undefined} />
      ) : (
        <section className="grid h-[70vh] place-items-center">
          <p>A configurar o filme em destaque…</p>
        </section>
      )}

      <div className="relative z-10 -mt-16 space-y-20">
        <Reveal>
          <MovieCarousel title={dict.home.releases} kicker="CINEMAX" href="/lancamentos" movies={releases} />
        </Reveal>

        <Reveal>
          <section className="px-4 md:px-8">
            <SectionTitle kicker="Countdown" title={dict.home.weekPremieres} href="/estreias" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {coming.map((m) => (
                <Link key={m.id} href={`/filmes/${m.slug}`} className="overflow-hidden rounded-2xl border border-white/10">
                  <Cover src={m.backdropUrl} alt="" className="h-48 w-full md:h-56" />
                  <div className="p-4">
                    <h3 className="font-medium">{m.title}</h3>
                    <p className="mt-2 font-display tracking-[0.2em] text-cx-red">
                      {dict.home.premiereIn} {m.releaseDate ? formatCountdown(m.releaseDate) : "—"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <MovieCarousel title={dict.home.nowShowing} href="/filmes?status=NOW_SHOWING" movies={showing} />
        </Reveal>

        <Reveal>
          <section className="px-4 md:px-8">
            <SectionTitle title={dict.home.mostWatched} />
            <ol className="grid gap-4 md:grid-cols-2">
              {ranked.map((m, i) => (
                <li key={m.id}>
                  <Link href={`/filmes/${m.slug}`} className="glass flex items-center gap-4 rounded-2xl p-3">
                    <span className="font-display w-10 text-3xl text-cx-red">{i + 1}</span>
                    <Cover src={m.posterUrl} alt="" className="h-28 w-20 rounded-lg" />
                    <div>
                      <p className="font-medium">{m.title}</p>
                      <p className="text-sm text-cx-muted">★ {m.avgRating.toFixed(1)} · {m.year}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>

        <Reveal>
          <MovieCarousel title={dict.home.recommended} kicker="CINEMAX AI" movies={recommended} />
        </Reveal>

        <Reveal>
          <MovieCarousel title="CINEMAX+" kicker="Streaming" href="/cinemax-plus" movies={plus} />
        </Reveal>

        <Reveal>
          <section className="px-4 md:px-8">
            <SectionTitle title={dict.home.comingSoon} href="/estreias" />
            <div className="relative border-l border-cx-red/40 pl-6">
              {coming.map((m) => (
                <div key={m.id} className="relative mb-8 flex items-center gap-4">
                  <span className="absolute -left-[31px] top-4 h-3 w-3 rounded-full bg-cx-red" />
                  <Cover src={m.posterUrl} alt="" className="h-20 w-14 rounded-lg" />
                  <p className="text-xs tracking-[0.2em] text-cx-gold uppercase">
                    {m.releaseDate?.toLocaleDateString("pt-PT")}
                  </p>
                  <Link href={`/filmes/${m.slug}`} className="text-lg hover:text-cx-red">
                    {m.title}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {banners[0] ? (
          <Reveal>
            <section className="px-4 md:px-8">
              <Link href={banners[0].ctaHref || "/filmes?formato=3D"} className="relative block overflow-hidden rounded-3xl">
                <Cover src={banners[0].imageUrl} alt="" className="h-72 w-full md:h-96" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent p-8 md:p-12">
                  <p className="text-xs tracking-[0.3em] text-cx-gold uppercase">{dict.home.experience3d}</p>
                  <h2 className="font-display mt-2 text-4xl">{banners[0].title}</h2>
                  <p className="mt-2 max-w-md text-cx-muted">{banners[0].subtitle}</p>
                  <span className="mt-6 inline-block rounded-full bg-cx-red px-5 py-2 text-sm">{banners[0].ctaLabel}</span>
                </div>
              </Link>
            </section>
          </Reveal>
        ) : null}

        <Reveal>
          <section className="px-4 md:px-8">
            <SectionTitle title={dict.home.extras} href="/loja" />
            <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
              {products.map((p) => (
                <Link key={p.id} href="/loja" className="w-52 shrink-0 overflow-hidden rounded-2xl border border-white/10">
                  <Cover src={p.imageUrl} alt={p.name} className="h-40 w-full" />
                  <p className="p-3 text-sm">{p.name}</p>
                  <p className="px-3 pb-3 text-cx-gold">{formatCurrency(p.price, settings.currency)}</p>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="px-4 md:px-8">
            <SectionTitle title={dict.home.promotions} href="/promocoes" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {promotions.map((p) => (
                <Link key={p.id} href="/promocoes" className="overflow-hidden rounded-2xl border border-white/10">
                  <Cover src={p.imageUrl} alt="" className="h-48 w-full" />
                  <div className="p-4">
                    <h3>{p.title}</h3>
                    <p className="text-sm text-cx-muted">{p.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="px-4 md:px-8">
            <SectionTitle title={dict.home.cinemas} href="/cinemas" />
            <div className="grid gap-4 md:grid-cols-3">
              {cinemas.map((c) => (
                <Link key={c.id} href={`/cinemas/${c.slug}`} className="overflow-hidden rounded-2xl border border-white/10">
                  <Cover src={c.imageUrl || AMBIENCE.lobby} alt="" className="h-56 w-full" />
                  <div className="p-4">
                    <h3>{c.name}</h3>
                    <p className="text-sm text-cx-muted">{c.city} · {c.address}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="px-4 md:px-8">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[AMBIENCE.lobby, AMBIENCE.seats, AMBIENCE.popcorn, AMBIENCE.projector].map((src) => (
                <Cover key={src} src={src} alt="" className="h-40 w-full rounded-2xl md:h-56" />
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="relative mx-4 overflow-hidden rounded-3xl md:mx-8">
            <Cover src={AMBIENCE.lobby} alt="" className="absolute inset-0 h-full w-full" />
            <div className="relative bg-black/70 p-8 md:p-12">
            <h2 className="font-display text-3xl">{dict.home.newsletter}</h2>
            <form action="/api/newsletter" method="post" className="mt-6 flex max-w-lg gap-3">
              <input name="email" type="email" required placeholder="email@cinemax.ao" className="flex-1 rounded-full bg-black/50 px-4 py-3 text-sm outline-none" />
              <button className="rounded-full bg-cx-red px-6 py-3 text-sm font-semibold">OK</button>
            </form>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
