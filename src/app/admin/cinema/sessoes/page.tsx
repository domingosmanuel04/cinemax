import { prisma } from "@/server/db/prisma";
import { AdminTable, AdminPageHeader } from "@/features/admin/AdminTable";
import { formatCurrency } from "@/shared/lib/utils";
import { Cover } from "@/shared/components/Cover";
import Link from "next/link";

export default async function Page() {
  const rows = await prisma.session.findMany({
    include: { movie: true, cinema: true, room: true, tickets: true },
    orderBy: { startsAt: "asc" },
    take: 80,
  });
  return (
    <div>
      <AdminPageHeader
        kicker="Cinema"
        title="SESSÕES"
        action={
          <Link href="/admin/cinema/sessoes/nova" className="rounded-full bg-cx-red px-5 py-2 text-sm">
            Nova sessão
          </Link>
        }
      />
      <AdminTable
        columns={["", "Filme", "Cinema", "Sala", "Início", "Formato", "Preço", "Bilhetes"]}
        rows={rows.map((s) => [
          <Cover key={s.id} src={s.movie.posterUrl} alt="" className="h-14 w-10 rounded-md" />,
          s.movie.title,
          s.cinema.name,
          s.room.name,
          s.startsAt.toLocaleString("pt-PT"),
          s.format,
          formatCurrency(s.price),
          s.tickets.length,
        ])}
      />
    </div>
  );
}
