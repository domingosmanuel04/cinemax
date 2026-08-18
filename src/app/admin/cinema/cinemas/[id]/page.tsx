import { prisma } from "@/server/db/prisma";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/features/admin/AdminTable";
import { Cover } from "@/shared/components/Cover";
import { updateCinemaAction } from "@/features/admin/actions";
import Link from "next/link";

export default async function EditCinema({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cinema = await prisma.cinema.findUnique({ where: { id }, include: { rooms: true } });
  if (!cinema) notFound();
  return (
    <div>
      <Cover src={cinema.imageUrl || ""} alt="" className="mb-6 h-40 w-full rounded-3xl" />
      <AdminPageHeader kicker="Cinema" title={cinema.name} />
      <form action={updateCinemaAction} className="max-w-2xl space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <input type="hidden" name="id" value={cinema.id} />
        <Field name="name" label="Nome" defaultValue={cinema.name} required />
        <Field name="address" label="Morada" defaultValue={cinema.address} required />
        <div className="grid grid-cols-2 gap-3">
          <Field name="city" label="Cidade" defaultValue={cinema.city} />
          <Field name="country" label="País" defaultValue={cinema.country} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field name="latitude" label="Latitude" type="number" defaultValue={String(cinema.latitude ?? "")} />
          <Field name="longitude" label="Longitude" type="number" defaultValue={String(cinema.longitude ?? "")} />
        </div>
        <Field name="phone" label="Telefone" defaultValue={cinema.phone || ""} />
        <Field name="email" label="Email" defaultValue={cinema.email || ""} />
        <Field name="openingHours" label="Horário" defaultValue={cinema.openingHours} />
        <Field name="imageUrl" label="URL da fotografia" defaultValue={cinema.imageUrl || ""} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="parking" defaultChecked={cinema.parking} /> Estacionamento
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="accessible" defaultChecked={cinema.accessible} /> Acessível
        </label>
        <label className="block text-sm">
          Estado
          <select name="status" defaultValue={cinema.status} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2">
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
          </select>
        </label>
        <button className="rounded-full bg-cx-red px-6 py-3">Guardar alterações</button>
      </form>
      <h2 className="mt-10 mb-3 text-sm tracking-[0.2em] text-cx-muted uppercase">Salas</h2>
      <ul className="space-y-2 text-sm">
        {cinema.rooms.map((r) => (
          <li key={r.id}>
            <Link href={`/admin/cinema/salas/${r.id}`} className="text-cx-gold">
              {r.name} · mapa de lugares
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  defaultValue = "",
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm">
      {label}
      <input name={name} type={type} step={type === "number" ? "any" : undefined} required={required} defaultValue={defaultValue} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 outline-none" />
    </label>
  );
}
