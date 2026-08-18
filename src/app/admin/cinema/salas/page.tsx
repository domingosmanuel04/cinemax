import { prisma } from "@/server/db/prisma";
import { AdminTable, AdminPageHeader } from "@/features/admin/AdminTable";
import { Cover } from "@/shared/components/Cover";
import Link from "next/link";

export default async function Page() {
  const rows = await prisma.room.findMany({ include: { cinema: true, _count: { select: { seats: true } } } });
  return (
    <div>
      <AdminPageHeader kicker="Cinema" title="SALAS" />
      <AdminTable
        columns={["", "Cinema", "Sala", "Tipo", "Capacidade", "Assentos", "Som", ""]}
        rows={rows.map((r) => [
          <Cover key={r.id} src={r.imageUrl || ""} alt="" className="h-12 w-20 rounded-lg" />,
          r.cinema.name,
          r.name,
          r.type,
          r.capacity,
          r._count.seats,
          r.soundSystem,
          <Link key={`e-${r.id}`} href={`/admin/cinema/salas/${r.id}`} className="text-cx-gold">
            Mapa
          </Link>,
        ])}
      />
    </div>
  );
}
