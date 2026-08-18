import { prisma } from "@/server/db/prisma";

export const movieInclude = {
  genres: { include: { genre: true } },
  cast: { include: { person: true }, orderBy: { order: "asc" as const } },
  trailers: true,
} as const;

export async function getHeroMovie() {
  return prisma.movie.findFirst({
    where: { heroEnabled: true },
    orderBy: { heroOrder: "asc" },
    include: movieInclude,
  });
}

export async function getMovies(filter?: {
  status?: string;
  genre?: string;
  format?: string;
  q?: string;
  kids?: boolean;
}) {
  return prisma.movie.findMany({
    where: {
      ...(filter?.status ? { status: filter.status } : {}),
      ...(filter?.genre ? { genres: { some: { genre: { slug: filter.genre } } } } : {}),
      ...(filter?.kids
        ? {
            OR: [
              { rating: { in: ["M/6", "M/12", "G", "PG"] } },
              { genres: { some: { genre: { slug: "animacao" } } } },
            ],
          }
        : {}),
      ...(filter?.q
        ? {
            OR: [
              { title: { contains: filter.q } },
              { director: { contains: filter.q } },
              { synopsis: { contains: filter.q } },
            ],
          }
        : {}),
    },
    include: movieInclude,
    orderBy: [{ popularity: "desc" }, { year: "desc" }],
  });
}

export async function getMovieBySlug(slug: string) {
  return prisma.movie.findUnique({
    where: { slug },
    include: {
      ...movieInclude,
      reviews: { include: { user: true }, where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" }, take: 12 },
      similarFrom: { include: { similar: { include: movieInclude } } },
      licenses: true,
    },
  });
}

export async function getCinemas() {
  return prisma.cinema.findMany({
    where: { status: "ACTIVE" },
    include: { rooms: true, _count: { select: { sessions: true } } },
    orderBy: { city: "asc" },
  });
}

export async function getUpcomingSessions(movieId?: string, cinemaId?: string) {
  return prisma.session.findMany({
    where: {
      startsAt: { gte: new Date() },
      status: "SCHEDULED",
      ...(movieId ? { movieId } : {}),
      ...(cinemaId ? { cinemaId } : {}),
    },
    include: { movie: true, cinema: true, room: true },
    orderBy: { startsAt: "asc" },
    take: 80,
  });
}
