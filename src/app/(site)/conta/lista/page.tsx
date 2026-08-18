import { getSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { redirect } from "next/navigation";
import { MovieCarousel } from "@/shared/components/MovieCarousel";

export default async function ListaPage({ searchParams }: { searchParams: Promise<{ add?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/entrar?next=/conta/lista");
  const { add } = await searchParams;
  if (add) {
    const movie = await prisma.movie.findUnique({ where: { slug: add } });
    if (movie) {
      const exists = await prisma.watchlistItem.findFirst({ where: { userId: session.id, movieId: movie.id } });
      if (!exists) await prisma.watchlistItem.create({ data: { userId: session.id, movieId: movie.id } });
    }
  }
  const items = await prisma.watchlistItem.findMany({
    where: { userId: session.id },
    include: { movie: { include: { genres: { include: { genre: true } } } } },
  });
  return (
    <div className="pt-28">
      <MovieCarousel title="Minha Lista" movies={items.map((i) => i.movie!).filter(Boolean)} />
    </div>
  );
}
