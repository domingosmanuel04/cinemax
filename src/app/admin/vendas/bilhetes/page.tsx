import { prisma } from "@/server/db/prisma";
import { AdminTable, AdminPageHeader } from "@/features/admin/AdminTable";
import { Cover } from "@/shared/components/Cover";
import { InlineSelect } from "@/features/admin/InlineSelect";
import { updateTicketStatusAction } from "@/features/admin/actions";

export default async function Page() {
  const rows = await prisma.ticket.findMany({
    include: { user: true, session: { include: { movie: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <div>
      <AdminPageHeader kicker="Vendas" title="BILHETES" />
      <AdminTable
        columns={["", "Código", "Cliente", "Filme", "Estado"]}
        rows={rows.map((t) => [
          <Cover key={t.id} src={t.session.movie.posterUrl} alt="" className="h-12 w-8 rounded" />,
          t.code,
          t.user.name,
          t.session.movie.title,
          <InlineSelect
            key={`s-${t.id}`}
            action={updateTicketStatusAction}
            id={t.id}
            name="status"
            value={t.status}
            options={["PENDING", "PAID", "REFUND_REQUESTED", "REFUNDED", "CANCELLED", "USED"]}
          />,
        ])}
      />
    </div>
  );
}
