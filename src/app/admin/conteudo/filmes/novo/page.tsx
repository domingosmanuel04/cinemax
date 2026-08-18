import { createMovieAction } from "@/features/admin/actions";
import { AdminPageHeader } from "@/features/admin/AdminTable";

export default function NovoFilmePage() {
  return (
    <div className="max-w-2xl">
      <AdminPageHeader kicker="CMS" title="NOVO FILME" />
      <form action={createMovieAction} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <Field name="title" label="Título" required />
        <Field name="originalTitle" label="Título original" />
        <label className="block text-sm">
          Sinopse
          <textarea name="synopsis" className="mt-1 h-28 w-full rounded-xl bg-white/5 px-3 py-2 outline-none" />
        </label>
        <Field name="posterUrl" label="URL do poster" />
        <Field name="backdropUrl" label="URL do backdrop" />
        <Field name="trailerUrl" label="URL do trailer" />
        <Field name="videoUrl" label="URL de streaming (MP4/HLS)" />
        <div className="grid grid-cols-2 gap-3">
          <Field name="year" label="Ano" type="number" />
          <Field name="durationMin" label="Duração (min)" type="number" />
        </div>
        <Field name="director" label="Realizador" />
        <Field name="rating" label="Classificação" />
        <label className="block text-sm">
          Estado
          <select name="status" className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2">
            <option value="NOW_SHOWING">Em cartaz</option>
            <option value="COMING_SOON">Estreia</option>
            <option value="STREAMING">Só streaming</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="cinemaAvailable" defaultChecked /> Cinema
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="streamingAvailable" /> CINEMAX+
        </label>
        <button className="rounded-full bg-cx-red px-6 py-3">Guardar</button>
      </form>
    </div>
  );
}

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm">
      {label}
      <input name={name} type={type} required={required} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 outline-none" />
    </label>
  );
}
