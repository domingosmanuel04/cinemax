import Link from "next/link";
import { formatDuration } from "@/shared/lib/utils";
import { Play, Ticket } from "lucide-react";
import { Cover } from "@/shared/components/Cover";

export type MovieCardMovie = {
  slug: string;
  title: string;
  posterUrl: string;
  backdropUrl?: string;
  year: number;
  avgRating: number;
  durationMin: number;
  rating: string;
  status?: string;
  genres?: { genre: { name: string } }[];
};

export function MovieCard({ movie, trailerHref }: { movie: MovieCardMovie; trailerHref?: string }) {
  const genre = movie.genres?.[0]?.genre.name;
  return (
    <article className="group relative w-[200px] shrink-0 md:w-[260px]">
      <div className="relative overflow-hidden rounded-2xl bg-cx-black shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <Link href={`/filmes/${movie.slug}`} className="block">
          <div className="relative aspect-[2/3] overflow-hidden">
            <Cover
              src={movie.posterUrl}
              alt={`Poster de ${movie.title}`}
              className="h-full w-full transition duration-700 group-hover:scale-110"
            />
            {movie.backdropUrl ? (
              <Cover
                src={movie.backdropUrl}
                alt=""
                className="absolute inset-0 h-full w-full opacity-0 transition duration-700 group-hover:opacity-100"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          </div>
        </Link>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 opacity-0 transition duration-300 group-hover:opacity-100">
          <p className="text-[11px] text-white/80">
            {genre} · {movie.year} · {formatDuration(movie.durationMin)}
          </p>
          <div className="pointer-events-auto mt-2 flex gap-2">
            <Link
              href={trailerHref || `/filmes/${movie.slug}?trailer=1`}
              className="grid h-8 w-8 place-items-center rounded-full bg-white text-black"
              aria-label="Trailer"
            >
              <Play className="h-3.5 w-3.5 fill-black" />
            </Link>
            <Link
              href={`/bilhetes/${movie.slug}`}
              className="grid h-8 w-8 place-items-center rounded-full bg-cx-red text-white"
              aria-label="Bilhete"
            >
              <Ticket className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
      <h3 className="mt-2 truncate text-sm font-medium">
        <Link href={`/filmes/${movie.slug}`}>{movie.title}</Link>
      </h3>
      <p className="text-xs text-cx-gold">★ {movie.avgRating ? movie.avgRating.toFixed(1) : "—"} · {movie.rating}</p>
    </article>
  );
}
