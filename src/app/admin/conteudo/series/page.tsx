import { prisma } from "@/server/db/prisma";
import { AdminTable, AdminPageHeader } from "@/features/admin/AdminTable";
import { Cover } from "@/shared/components/Cover";
import Link from "next/link";

export default async function Page() {
  const rows = await prisma.series.findMany({ orderBy: { year: "desc" } });
  return (
    <div>
      <AdminPageHeader
        kicker="CMS"
        title="SÉRIES"
        action={
          <Link href="/admin/conteudo/series/nova" className="rounded-full bg-cx-red px-5 py-2 text-sm">
            Nova série
          </Link>
        }
      />
      <AdminTable
        columns={["", "Título", "Ano", "Rating", "Streaming", ""]}
        rows={rows.map((s) => [
          <Cover key={s.id} src={s.posterUrl} alt="" className="h-14 w-10 rounded-md" />,
          s.title,
          s.year,
          s.rating,
          s.streamingAvailable ? "Sim" : "Não",
          <Link key={`e-${s.id}`} href={`/admin/conteudo/series/${s.id}`} className="text-cx-gold">
            Editar
          </Link>,
        ])}
      />
    </div>
  );
}
