import { prisma } from "@/server/db/prisma";
import { AdminTable, AdminPageHeader } from "@/features/admin/AdminTable";
import { updateLicenseAction } from "@/features/admin/actions";
import { Cover } from "@/shared/components/Cover";

export default async function Page() {
  const rows = await prisma.contentLicense.findMany({ include: { movie: true, series: true } });
  return (
    <div>
      <AdminPageHeader kicker="Sistema" title="CONTENT RIGHTS" />
      <p className="mb-6 text-sm text-cx-muted">Alertas automáticos quando a licença está a menos de 30 dias do fim.</p>
      <AdminTable
        columns={["", "Título", "Território", "Fim", "Cinema", "Streaming", "Estado"]}
        rows={rows.map((l) => [
          <Cover key={l.id} src={l.movie?.posterUrl || l.series?.posterUrl || ""} alt="" className="h-12 w-8 rounded" />,
          l.movie?.title || l.series?.title || "—",
          l.territory,
          l.endsAt.toLocaleDateString("pt-PT"),
          <form key={`f-${l.id}`} action={updateLicenseAction} className="flex flex-wrap items-center gap-2 text-xs">
            <input type="hidden" name="id" value={l.id} />
            <label className="flex items-center gap-1">
              <input type="checkbox" name="cinemaOk" defaultChecked={l.cinemaOk} /> cinema
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" name="streamingOk" defaultChecked={l.streamingOk} /> stream
            </label>
            <select name="status" defaultValue={l.status} className="rounded bg-white/10 px-2 py-1">
              <option>ACTIVE</option>
              <option>EXPIRED</option>
              <option>REVOKED</option>
            </select>
            <button className="text-cx-gold">OK</button>
          </form>,
          l.streamingOk ? "Sim" : "Não",
          l.status,
        ])}
      />
    </div>
  );
}
