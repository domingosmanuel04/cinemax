import { prisma } from "@/server/db/prisma";
import { AdminTable, AdminPageHeader } from "@/features/admin/AdminTable";
import { HeroButton } from "@/features/admin/HeroButton";
import { Cover } from "@/shared/components/Cover";
import Link from "next/link";

export default async function AdminMovies() {
  const movies = await prisma.movie.findMany({ orderBy: { popularity: "desc" } });
  return (
    <div>
      <AdminPageHeader
        kicker="CMS"
        title="FILMES"
        action={
          <Link href="/admin/conteudo/filmes/novo" className="rounded-full bg-cx-red px-5 py-2 text-sm">
            Novo filme
          </Link>
        }
      />
      <AdminTable
        columns={["", "Título", "Ano", "Estado", "Cinema", "Streaming", "Hero", "Acções"]}
        rows={movies.map((m) => [
          <Cover key={m.id} src={m.posterUrl} alt="" className="h-14 w-10 rounded-md" />,
          m.title,
          m.year,
          m.status,
          m.cinemaAvailable ? "Sim" : "Não",
          m.streamingAvailable ? "Sim" : "Não",
          m.heroEnabled ? "ACTIVO" : "—",
          <span key={`a-${m.id}`} className="flex gap-3">
            <Link href={`/admin/conteudo/filmes/${m.id}`} className="text-cx-gold">Editar</Link>
            <Link href={`/filmes/${m.slug}`} className="text-white/50">Ver</Link>
            <HeroButton id={m.id} />
          </span>,
        ])}
      />
    </div>
  );
}
