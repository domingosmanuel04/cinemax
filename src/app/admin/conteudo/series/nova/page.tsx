import { createSeriesAction } from "@/features/admin/actions";
import { AdminPageHeader } from "@/features/admin/AdminTable";
import { AMBIENCE, HERO_VIDEO } from "@/shared/lib/media";

export default function NovaSeriePage() {
  return (
    <div className="max-w-2xl">
      <AdminPageHeader kicker="CMS" title="NOVA SÉRIE" />
      <form action={createSeriesAction} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <Field name="title" label="Título" required />
        <label className="block text-sm">
          Sinopse
          <textarea name="synopsis" className="mt-1 h-28 w-full rounded-xl bg-white/5 px-3 py-2 outline-none" />
        </label>
        <Field name="posterUrl" label="URL do poster" defaultValue={AMBIENCE.projector} />
        <Field name="backdropUrl" label="URL do backdrop" defaultValue={AMBIENCE.lobby} />
        <Field name="trailerUrl" label="URL do trailer" defaultValue={HERO_VIDEO} />
        <div className="grid grid-cols-2 gap-3">
          <Field name="year" label="Ano" type="number" defaultValue={String(new Date().getFullYear())} />
          <Field name="rating" label="Classificação" defaultValue="M/12" />
        </div>
        <label className="block text-sm">
          Estado
          <select name="status" className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2">
            <option value="PUBLISHED">Publicada</option>
            <option value="DRAFT">Rascunho</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="streamingAvailable" defaultChecked /> CINEMAX+
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
      <input name={name} type={type} required={required} defaultValue={defaultValue} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 outline-none" />
    </label>
  );
}
