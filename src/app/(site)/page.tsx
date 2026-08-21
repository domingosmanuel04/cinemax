import { prisma } from "@/server/db/prisma";
import { recommendMovies } from "@/server/services/recommendations";
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

  const [showing, ranked] = await Promise.all([
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
  ]);

  const popularFormatted = ranked.map((m) => ({
    id: m.id,
    title: m.title,
    genre: m.genres.map((g) => g.genre.name).join(", "),
    rating: `IMDb ${m.avgRating.toFixed(1)}`,
    posterUrl: m.posterUrl,
  }));

  const favoritesFormatted = showing.slice(0, 3).map((m) => ({
    id: m.id,
    title: m.title,
    genre: m.genres.map((g) => g.genre.name).join(", "),
    rating: `IMDb ${m.avgRating.toFixed(1)}`,
    posterUrl: m.posterUrl,
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
      />
    </div>
  );
}
