import { prisma } from "@/server/db/prisma";
import { AdminTable, AdminPageHeader } from "@/features/admin/AdminTable";
import { formatCurrency } from "@/shared/lib/utils";
import { updatePaymentStatusAction } from "@/features/admin/actions";
import { InlineSelect } from "@/features/admin/InlineSelect";

export default async function Page() {
  const rows = await prisma.payment.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 80 });
  return (
    <div>
      <AdminPageHeader kicker="Vendas" title="PAGAMENTOS" />
      <AdminTable
        columns={["Referência", "Método", "Montante", "Estado", "Cliente"]}
        rows={rows.map((p) => [
          p.reference,
          p.method,
          formatCurrency(p.amount),
          <InlineSelect
            key={p.id}
            action={updatePaymentStatusAction}
            id={p.id}
            name="status"
            value={p.status}
            options={["PENDING", "PAID", "FAILED", "REFUNDED"]}
          />,
          p.user.name,
        ])}
      />
    </div>
  );
}
