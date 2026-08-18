import { prisma } from "@/server/db/prisma";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/features/admin/AdminTable";
import { Cover } from "@/shared/components/Cover";
import { createEpisodeAction, createSeasonAction, updateEpisodeAction, updateSeriesAction } from "@/features/admin/actions";
import { DEMO_STREAM } from "@/shared/lib/media";

export default async function EditSeries({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const series = await prisma.series.findUnique({
    where: { id },
    include: { seasons: { include: { episodes: { orderBy: { number: "asc" } } }, orderBy: { number: "asc" } } },
  });
  if (!series) notFound();
  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <Cover src={series.posterUrl} alt="" className="rounded-3xl" />
        <div>
          <AdminPageHeader kicker="CMS" title={series.title} />
          <form action={updateSeriesAction} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <input type="hidden" name="id" value={series.id} />
            <Field name="title" label="Título" defaultValue={series.title} required />
            <label className="block text-sm">
              Sinopse
              <textarea name="synopsis" defaultValue={series.synopsis} className="mt-1 h-28 w-full rounded-xl bg-white/5 px-3 py-2 outline-none" />
            </label>
            <Field name="posterUrl" label="URL do poster" defaultValue={series.posterUrl} />
            <Field name="backdropUrl" label="URL do backdrop" defaultValue={series.backdropUrl} />
            <Field name="trailerUrl" label="URL do trailer" defaultValue={series.trailerUrl || ""} />
            <div className="grid grid-cols-2 gap-3">
              <Field name="year" label="Ano" type="number" defaultValue={String(series.year)} />
              <Field name="rating" label="Classificação" defaultValue={series.rating} />
            </div>
            <label className="block text-sm">
              Estado
              <select name="status" defaultValue={series.status} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2">
                <option value="PUBLISHED">Publicada</option>
                <option value="DRAFT">Rascunho</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="streamingAvailable" defaultChecked={series.streamingAvailable} /> CINEMAX+
            </label>
            <button className="rounded-full bg-cx-red px-6 py-3">Guardar alterações</button>
          </form>
        </div>
      </div>

      <section>
        <h2 className="font-display text-2xl">Temporadas e episódios</h2>
        <form action={createSeasonAction} className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 p-4">
          <input type="hidden" name="seriesId" value={series.id} />
          <Field name="number" label="Nº" type="number" defaultValue={String(series.seasons.length + 1)} />
          <Field name="title" label="Título" defaultValue={`Temporada ${series.seasons.length + 1}`} />
          <Field name="year" label="Ano" type="number" defaultValue={String(new Date().getFullYear())} />
          <button className="rounded-full bg-white px-4 py-2 text-sm text-black">Nova temporada</button>
        </form>

        <div className="mt-8 space-y-8">
          {series.seasons.map((season) => (
            <div key={season.id} className="rounded-3xl border border-white/10 p-5">
              <h3 className="text-lg">
                T{season.number} · {season.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {season.episodes.map((ep) => (
                  <li key={ep.id}>
                    <form action={updateEpisodeAction} className="grid gap-2 rounded-xl bg-white/5 p-3 md:grid-cols-[80px_1fr_1fr_90px_1fr_auto]">
                      <input type="hidden" name="id" value={ep.id} />
                      <input type="hidden" name="seriesId" value={series.id} />
                      <p className="self-center text-xs text-cx-muted">E{ep.number}</p>
                      <input name="title" defaultValue={ep.title} className="rounded-lg bg-black/40 px-2 py-2 text-sm" />
                      <input name="synopsis" defaultValue={ep.synopsis || ""} className="rounded-lg bg-black/40 px-2 py-2 text-sm" />
                      <input name="durationMin" type="number" defaultValue={ep.durationMin} className="rounded-lg bg-black/40 px-2 py-2 text-sm" />
                      <input name="videoUrl" defaultValue={ep.videoUrl || DEMO_STREAM} className="rounded-lg bg-black/40 px-2 py-2 text-sm" />
                      <button className="rounded-full border border-white/20 px-3 py-1 text-xs">Guardar</button>
                    </form>
                  </li>
                ))}
              </ul>
              <form action={createEpisodeAction} className="mt-4 flex flex-wrap items-end gap-3">
                <input type="hidden" name="seasonId" value={season.id} />
                <input type="hidden" name="seriesId" value={series.id} />
                <Field name="number" label="Nº" type="number" defaultValue={String(season.episodes.length + 1)} />
                <Field name="title" label="Título" defaultValue={`Episódio ${season.episodes.length + 1}`} />
                <Field name="durationMin" label="Min" type="number" defaultValue="42" />
                <Field name="videoUrl" label="Vídeo" defaultValue={DEMO_STREAM} />
                <button className="rounded-full bg-cx-red px-4 py-2 text-sm">Adicionar episódio</button>
              </form>
            </div>
          ))}
        </div>
      </section>
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
