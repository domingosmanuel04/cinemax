import { MovieCard, type MovieCardMovie } from "@/shared/components/MovieCard";
import { SectionTitle } from "@/shared/components/Reveal";

export function MovieCarousel({
  title,
  kicker,
  href,
  movies,
}: {
  title: string;
  kicker?: string;
  href?: string;
  movies: MovieCardMovie[];
}) {
  if (!movies.length) {
    return (
      <section className="px-4 md:px-8">
        <SectionTitle kicker={kicker} title={title} href={href} />
        <p className="text-sm text-cx-muted">Nenhum título nesta secção de momento.</p>
      </section>
    );
  }
  return (
    <section className="px-4 md:px-8">
      <SectionTitle kicker={kicker} title={title} href={href} />
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
        {movies.map((m) => (
          <MovieCard key={m.slug} movie={m} />
        ))}
      </div>
    </section>
  );
}
