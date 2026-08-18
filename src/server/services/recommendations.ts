import { prisma } from "@/server/db/prisma";

export async function recommendMovies(userId?: string | null, limit = 10) {
  if (!userId) {
    return prisma.movie.findMany({
      where: { status: { in: ["NOW_SHOWING", "STREAMING"] } },
      orderBy: { popularity: "desc" },
      take: limit,
      include: { genres: { include: { genre: true } } },
    });
  }

  const [history, ratings, favorites] = await Promise.all([
    prisma.watchHistory.findMany({ where: { userId, movieId: { not: null } }, include: { movie: { include: { genres: true } } } }),
    prisma.rating.findMany({ where: { userId }, include: { movie: { include: { genres: true } } } }),
    prisma.favorite.findMany({ where: { userId }, include: { movie: { include: { genres: true } } } }),
  ]);

  const genreScore = new Map<string, number>();
  const seen = new Set<string>();
  for (const h of history) {
    if (h.movieId) seen.add(h.movieId);
    h.movie?.genres.forEach((g) => genreScore.set(g.genreId, (genreScore.get(g.genreId) || 0) + 2));
  }
  for (const r of ratings) {
    seen.add(r.movieId);
    r.movie.genres.forEach((g) => genreScore.set(g.genreId, (genreScore.get(g.genreId) || 0) + r.value));
  }
  for (const f of favorites) {
    seen.add(f.movieId);
    f.movie.genres.forEach((g) => genreScore.set(g.genreId, (genreScore.get(g.genreId) || 0) + 3));
  }

  const topGenres = [...genreScore.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => id);
  if (!topGenres.length) {
    return prisma.movie.findMany({
      where: { status: { in: ["NOW_SHOWING", "STREAMING"] } },
      orderBy: { avgRating: "desc" },
      take: limit,
      include: { genres: { include: { genre: true } } },
    });
  }

  return prisma.movie.findMany({
    where: {
      id: { notIn: [...seen] },
      genres: { some: { genreId: { in: topGenres } } },
    },
    orderBy: [{ avgRating: "desc" }, { popularity: "desc" }],
    take: limit,
    include: { genres: { include: { genre: true } } },
  });
}

export async function becauseYouWatched(userId?: string | null) {
  if (!userId) return null;
  const last = await prisma.watchHistory.findFirst({
    where: { userId, movieId: { not: null } },
    orderBy: { updatedAt: "desc" },
    include: { movie: { include: { genres: true, similarFrom: { include: { similar: { include: { genres: { include: { genre: true } } } } } } } } },
  });
  if (!last?.movie) return null;
  const similar = last.movie.similarFrom.map((s) => s.similar);
  if (!similar.length) {
    const more = await prisma.movie.findMany({
      where: {
        id: { not: last.movie.id },
        genres: { some: { genreId: { in: last.movie.genres.map((g) => g.genreId) } } },
      },
      take: 8,
      include: { genres: { include: { genre: true } } },
    });
    return { source: last.movie, items: more };
  }
  return { source: last.movie, items: similar };
}
