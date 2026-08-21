import { prisma } from "@/server/db/prisma";
import { getSession } from "@/server/auth/session";
import { getSettings } from "@/server/services/settings";
import { cookies } from "next/headers";
import { JsonLd } from "@/shared/components/JsonLd";
import { CinemaxDashboard } from "@/shared/components/CinemaxDashboard";

export default async function HomePage() {
  const jar = await cookies();
  const locale = jar.get("cinemax-locale")?.value || "pt";
  const currency = jar.get("cinemax-currency")?.value || "AOA";
  const kids = jar.get("cinemax-kids")?.value === "1";
  const session = await getSession();
  const settings = await getSettings().catch(() => ({ currency: "AOA" }));

  const [showing, ranked, releases, series, products] = await Promise.all([
    prisma.movie.findMany({
      where: { cinemaAvailable: true, status: "NOW_SHOWING", ...(kids ? { OR: [{ rating: { in: ["M/6", "M/12"] } }, { genres: { some: { genre: { slug: "animacao" } } } }] } : {}) },
      include: { genres: { include: { genre: true } } },
      take: 12,
    }),
    prisma.movie.findMany({
      where: { status: "NOW_SHOWING" },
      orderBy: { popularity: "desc" },
      take: 4,
      include: { genres: { include: { genre: true } } },
    }),
    prisma.movie.findMany({
      where: { status: "NOW_SHOWING" },
      orderBy: { releaseDate: "desc" },
      take: 8,
      include: { genres: { include: { genre: true } } },
    }),
    prisma.movie.findMany({
      where: { streamingAvailable: true },
      take: 6,
      include: { genres: { include: { genre: true } } },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      take: 6,
    }),
  ]);

  const popularFormatted = ranked.map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    genre: m.genres.map((g) => g.genre.name).join(", "),
    rating: `IMDb ${m.avgRating.toFixed(1)}`,
    posterUrl: m.posterUrl,
  }));

  const favoritesFormatted = showing.slice(0, 3).map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    genre: m.genres.map((g) => g.genre.name).join(", "),
    rating: `IMDb ${m.avgRating.toFixed(1)}`,
    posterUrl: m.posterUrl,
  }));

  const releasesFormatted = releases.map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    genre: m.genres.map((g) => g.genre.name).join(" · "),
    rating: `IMDb ${m.avgRating.toFixed(1)}`,
    posterUrl: m.posterUrl,
    badge: m.cinemaAvailable ? "IMAX 3D" : "ESTREIA",
  }));

  const seriesFormatted = series.map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    genre: m.genres.map((g) => g.genre.name).join(" · "),
    rating: `IMDb ${m.avgRating.toFixed(1)}`,
    posterUrl: m.posterUrl,
    badge: "CINEMAX+ ORIGINAL",
    duration: `${m.durationMin || 45} min/ep`,
  }));

  const productsFormatted = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: `${p.price.toLocaleString("pt-AO")} ${settings.currency || "Kz"}`,
    imageUrl: p.imageUrl,
  }));

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MovieTheater",
          name: "CINEMAX",
          slogan: "Your Movie. Your Moment.",
          url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        }}
      />
      <CinemaxDashboard
        userName={session?.name}
        locale={locale}
        currency={currency}
        popularMovies={popularFormatted.length > 0 ? popularFormatted : undefined}
        favoriteMovies={favoritesFormatted.length > 0 ? favoritesFormatted : undefined}
        releases={releasesFormatted.length > 0 ? releasesFormatted : undefined}
        series={seriesFormatted.length > 0 ? seriesFormatted : undefined}
        products={productsFormatted.length > 0 ? productsFormatted : undefined}
      />
    </div>
  );
}
