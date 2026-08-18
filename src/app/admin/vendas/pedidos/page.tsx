import { prisma } from "@/server/db/prisma";
import { AdminTable, AdminPageHeader } from "@/features/admin/AdminTable";
import { formatCurrency } from "@/shared/lib/utils";
import { updateOrderStatusAction } from "@/features/admin/actions";
import { InlineSelect } from "@/features/admin/InlineSelect";

export default async function Page() {
  const rows = await prisma.order.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 80 });
  return (
    <div>
      <AdminPageHeader kicker="Vendas" title="PEDIDOS" />
      <AdminTable
        columns={["Código", "Cliente", "Tipo", "Total", "Estado"]}
        rows={rows.map((o) => [
          o.code,
          o.user.name,
          o.type,
          formatCurrency(o.total),
          <InlineSelect
            key={o.id}
            action={updateOrderStatusAction}
            id={o.id}
            name="status"
            value={o.status}
            options={["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"]}
          />,
        ])}
      />
    </div>
  );
}
