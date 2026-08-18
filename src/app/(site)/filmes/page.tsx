import { prisma } from "@/server/db/prisma";
import { MovieCard } from "@/shared/components/MovieCard";
import Link from "next/link";
import { cookies } from "next/headers";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";
import { getDictionary } from "@/shared/lib/i18n";

const filters = [
  { label: "Todos", href: "/filmes" },
  { label: "Em cartaz", href: "/filmes?status=NOW_SHOWING" },
  { label: "Lançamentos", href: "/lancamentos" },
  { label: "Estreias", href: "/estreias" },
  { label: "Brevemente", href: "/filmes?status=COMING_SOON" },
  { label: "Ação", href: "/filmes?genero=acao" },
  { label: "Comédia", href: "/filmes?genero=comedia" },
  { label: "Drama", href: "/filmes?genero=drama" },
  { label: "Terror", href: "/filmes?genero=terror" },
  { label: "Ficção científica", href: "/filmes?genero=ficcao-cientifica" },
  { label: "Animação", href: "/filmes?genero=animacao" },
  { label: "Romance", href: "/filmes?genero=romance" },
  { label: "Aventura", href: "/filmes?genero=aventura" },
  { label: "Documentário", href: "/filmes?genero=documentario" },
  { label: "2D", href: "/filmes?formato=2D" },
  { label: "3D", href: "/filmes?formato=3D" },
  { label: "IMAX", href: "/filmes?formato=IMAX" },
];

export default async function FilmesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; genero?: string; formato?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const kids = (await cookies()).get("cinemax-kids")?.value === "1";
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  const dict = getDictionary(locale);
  const movies = await prisma.movie.findMany({
    where: {
      ...(sp.status ? { status: sp.status } : {}),
      ...(sp.genero ? { genres: { some: { genre: { slug: sp.genero } } } } : {}),
      ...(kids
        ? {
            OR: [
              { rating: { in: ["M/6", "M/12", "G", "PG"] } },
              { genres: { some: { genre: { slug: "animacao" } } } },
            ],
          }
        : {}),
    },
    include: { genres: { include: { genre: true } } },
    orderBy: { popularity: "desc" },
  });
  const filtered = sp.formato ? movies.filter((m) => m.formats.includes(sp.formato!)) : movies;

  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-28 pb-16 md:px-8">
      <div className="relative mb-8 overflow-hidden rounded-3xl">
        <Cover src={AMBIENCE.projector} alt="" className="h-44 w-full md:h-56" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <p className="text-xs tracking-[0.3em] text-cx-red uppercase">{dict.catalog.kicker}</p>
          <h1 className="font-display mt-2 text-4xl md:text-5xl">{dict.catalog.movies}</h1>
          {kids ? <p className="mt-2 text-sm text-sky-300">{dict.catalog.kids}</p> : null}
        </div>
      </div>
      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <Link key={f.href} href={f.href} className="rounded-full border border-white/10 px-3 py-1 text-xs whitespace-nowrap hover:border-cx-red">
            {f.label}
          </Link>
        ))}
      </div>
      {filtered.length ? (
        <div className="mt-8 flex flex-wrap gap-5">
          {filtered.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-cx-muted">{dict.catalog.empty}</p>
      )}
    </div>
  );
}
