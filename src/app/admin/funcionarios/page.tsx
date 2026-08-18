import { prisma } from "@/server/db/prisma";
import { AdminTable, AdminPageHeader } from "@/features/admin/AdminTable";
import { updateStaffAction } from "@/features/admin/actions";
import { InlineSelect } from "@/features/admin/InlineSelect";

export default async function Page() {
  const rows = await prisma.user.findMany({
    where: { role: { not: "CUSTOMER" } },
    include: { staffProfile: { include: { cinema: true } } },
  });
  return (
    <div>
      <AdminPageHeader kicker="Sistema" title="EQUIPA" />
      <AdminTable
        columns={["Nome", "Email", "Função", "Cinema", "Turno"]}
        rows={rows.map((u) => [
          u.name,
          u.email,
          <InlineSelect
            key={u.id}
            action={updateStaffAction}
            id={u.id}
            name="role"
            value={u.role}
            options={["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "FINANCE", "MARKETING", "CONTENT_MANAGER"]}
          />,
          u.staffProfile?.cinema?.name || "Global",
          u.staffProfile?.shift || "—",
        ])}
      />
    </div>
  );
}
