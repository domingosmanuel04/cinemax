import { createCinemaAction } from "@/features/admin/actions";
import { AdminPageHeader } from "@/features/admin/AdminTable";
import { AMBIENCE } from "@/shared/lib/media";

export default function NovoCinemaPage() {
  return (
    <div className="max-w-2xl">
      <AdminPageHeader kicker="Cinema" title="NOVO CINEMA" />
      <form action={createCinemaAction} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <Field name="name" label="Nome" required />
        <Field name="address" label="Morada" required />
        <div className="grid grid-cols-2 gap-3">
          <Field name="city" label="Cidade" defaultValue="Luanda" />
          <Field name="country" label="País" defaultValue="Angola" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field name="latitude" label="Latitude" type="number" defaultValue="-8.8383" />
          <Field name="longitude" label="Longitude" type="number" defaultValue="13.2344" />
        </div>
        <Field name="phone" label="Telefone" />
        <Field name="email" label="Email" />
        <Field name="openingHours" label="Horário" defaultValue="10:00–23:00" />
        <Field name="imageUrl" label="URL da fotografia" defaultValue={AMBIENCE.lobby} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="parking" defaultChecked /> Estacionamento
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="accessible" defaultChecked /> Acessível
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="defaultRoom" defaultChecked /> Criar sala 1 com mapa de lugares
        </label>
        <label className="block text-sm">
          Estado
          <select name="status" className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2">
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
          </select>
        </label>
        <button className="rounded-full bg-cx-red px-6 py-3">Guardar</button>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  defaultValue,
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
