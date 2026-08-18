import { prisma } from "@/server/db/prisma";
import { AdminTable, AdminPageHeader } from "@/features/admin/AdminTable";
import { updateCustomerAction } from "@/features/admin/actions";
import { InlineSelect } from "@/features/admin/InlineSelect";

export default async function Page() {
  const rows = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { loyalty: true, subscriptions: true },
    take: 80,
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <AdminPageHeader kicker="Crescimento" title="CLIENTES" />
      <AdminTable
        columns={["Nome", "Email", "Club", "Assinatura", "Estado"]}
        rows={rows.map((u) => [
          u.name,
          u.email,
          u.loyalty?.tier || "—",
          u.subscriptions[0]?.status || "—",
          <InlineSelect
            key={u.id}
            action={updateCustomerAction}
            id={u.id}
            name="status"
            value={u.status}
            options={["ACTIVE", "SUSPENDED", "DELETED"]}
          />,
        ])}
      />
    </div>
  );
}
