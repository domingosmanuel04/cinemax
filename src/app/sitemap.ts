import { prisma } from "@/server/db/prisma";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const movies = await prisma.movie.findMany({ select: { slug: true, updatedAt: true } }).catch(() => []);
  const cinemas = await prisma.cinema.findMany({ select: { slug: true, updatedAt: true } }).catch(() => []);
  const series = await prisma.series.findMany({ select: { slug: true, updatedAt: true } }).catch(() => []);
  const statics = ["", "/filmes", "/series", "/cinemas", "/cinemax-plus", "/loja", "/promocoes", "/club", "/sobre"];
  return [
    ...statics.map((p) => ({ url: `${base}${p}`, lastModified: new Date() })),
    ...movies.map((m) => ({ url: `${base}/filmes/${m.slug}`, lastModified: m.updatedAt })),
    ...cinemas.map((c) => ({ url: `${base}/cinemas/${c.slug}`, lastModified: c.updatedAt })),
    ...series.map((s) => ({ url: `${base}/series/${s.slug}`, lastModified: s.updatedAt })),
  ];
}
