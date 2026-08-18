import { prisma } from "@/server/db/prisma";
import { AdminTable, AdminPageHeader } from "@/features/admin/AdminTable";
import { Cover } from "@/shared/components/Cover";
import Link from "next/link";

export default async function Page() {
  const rows = await prisma.cinema.findMany({ include: { _count: { select: { rooms: true, sessions: true } } } });
  return (
    <div>
      <AdminPageHeader
        kicker="Cinema"
        title="CINEMAS"
        action={
          <Link href="/admin/cinema/cinemas/novo" className="rounded-full bg-cx-red px-5 py-2 text-sm">
            Novo cinema
          </Link>
        }
      />
      <AdminTable
        columns={["", "Nome", "Cidade", "Salas", "Sessões", ""]}
        rows={rows.map((c) => [
          <Cover key={c.id} src={c.imageUrl || ""} alt="" className="h-12 w-20 rounded-lg" />,
          <Link key={`n-${c.id}`} href={`/cinemas/${c.slug}`} className="text-cx-red">
            {c.name}
          </Link>,
          c.city,
          c._count.rooms,
          c._count.sessions,
          <Link key={`e-${c.id}`} href={`/admin/cinema/cinemas/${c.id}`} className="text-cx-gold">
            Editar
          </Link>,
        ])}
      />
    </div>
  );
}
