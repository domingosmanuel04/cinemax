import { prisma } from "@/server/db/prisma";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/features/admin/AdminTable";
import { Cover } from "@/shared/components/Cover";
import { updateMovieAction } from "@/features/admin/actions";

export default async function EditMovie({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) notFound();
  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <div>
        <Cover src={movie.posterUrl} alt="" className="rounded-3xl" />
        <Cover src={movie.backdropUrl} alt="" className="mt-4 h-28 w-full rounded-2xl" />
      </div>
      <div>
        <AdminPageHeader kicker="CMS" title={movie.title} />
        <form action={updateMovieAction} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <input type="hidden" name="id" value={movie.id} />
          <Field name="title" label="Título" defaultValue={movie.title} required />
          <Field name="originalTitle" label="Título original" defaultValue={movie.originalTitle || ""} />
          <label className="block text-sm">
            Sinopse
            <textarea name="synopsis" defaultValue={movie.synopsis} className="mt-1 h-28 w-full rounded-xl bg-white/5 px-3 py-2 outline-none" />
          </label>
          <Field name="posterUrl" label="URL do poster" defaultValue={movie.posterUrl} />
          <Field name="backdropUrl" label="URL do backdrop" defaultValue={movie.backdropUrl} />
          <Field name="trailerUrl" label="URL do trailer" defaultValue={movie.trailerUrl || ""} />
          <Field name="videoUrl" label="URL de streaming" defaultValue={movie.videoUrl || ""} />
          <div className="grid grid-cols-2 gap-3">
            <Field name="year" label="Ano" type="number" defaultValue={String(movie.year)} />
            <Field name="durationMin" label="Duração (min)" type="number" defaultValue={String(movie.durationMin)} />
          </div>
          <Field name="director" label="Realizador" defaultValue={movie.director} />
          <Field name="rating" label="Classificação" defaultValue={movie.rating} />
          <label className="block text-sm">
            Estado
            <select name="status" defaultValue={movie.status} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2">
              <option value="NOW_SHOWING">Em cartaz</option>
              <option value="COMING_SOON">Estreia</option>
              <option value="STREAMING">Só streaming</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="cinemaAvailable" defaultChecked={movie.cinemaAvailable} /> Cinema
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="streamingAvailable" defaultChecked={movie.streamingAvailable} /> CINEMAX+
          </label>
          <button className="rounded-full bg-cx-red px-6 py-3">Guardar alterações</button>
        </form>
      </div>
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
      <input name={name} type={type} required={required} defaultValue={defaultValue} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 outline-none" />
    </label>
  );
}
