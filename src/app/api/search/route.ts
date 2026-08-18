import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json({ movies: [], cinemas: [], people: [] });
  const [movies, series, cinemas, people] = await Promise.all([
    prisma.movie.findMany({
      where: { OR: [{ title: { contains: q } }, { director: { contains: q } }, { synopsis: { contains: q } }] },
      take: 8,
    }),
    prisma.series.findMany({ where: { title: { contains: q } }, take: 5 }),
    prisma.cinema.findMany({ where: { OR: [{ name: { contains: q } }, { city: { contains: q } }] }, take: 5 }),
    prisma.person.findMany({ where: { name: { contains: q } }, take: 5 }),
  ]);
  return NextResponse.json({
    movies: movies.map((m) => ({
      slug: m.slug,
      title: m.title,
      year: m.year,
      posterUrl: m.posterUrl,
      backdropUrl: m.backdropUrl,
    })),
    series: series.map((s) => ({ slug: s.slug, title: s.title, posterUrl: s.posterUrl })),
    cinemas: cinemas.map((c) => ({ slug: c.slug, name: c.name, city: c.city, imageUrl: c.imageUrl })),
    people: people.map((p) => ({ name: p.name, photoUrl: p.photoUrl })),
  });
}
