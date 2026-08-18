import { prisma } from "@/server/db/prisma";
import { AdminTable, AdminPageHeader } from "@/features/admin/AdminTable";
import { CampaignForm } from "@/features/admin/CampaignForm";
import { updateCampaignStatusAction } from "@/features/admin/actions";
import { InlineSelect } from "@/features/admin/InlineSelect";

export default async function Page() {
  const rows = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <AdminPageHeader kicker="Crescimento" title="CAMPANHAS" />
      <CampaignForm />
      <div className="mt-8">
        <AdminTable
          columns={["Título", "Público", "CTA", "Estado"]}
          rows={rows.map((c) => [
            c.title,
            c.audience,
            c.cta,
            <InlineSelect
              key={c.id}
              action={updateCampaignStatusAction}
              id={c.id}
              name="status"
              value={c.status}
              options={["DRAFT", "ACTIVE", "PAUSED", "ENDED"]}
            />,
          ])}
        />
      </div>
    </div>
  );
}
