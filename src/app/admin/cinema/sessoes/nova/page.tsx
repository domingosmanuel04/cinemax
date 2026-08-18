import { prisma } from "@/server/db/prisma";
import { createSessionAction } from "@/features/admin/actions";
import { AdminPageHeader } from "@/features/admin/AdminTable";

export default async function NovaSessao({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const [movies, cinemas, rooms] = await Promise.all([
    prisma.movie.findMany({ where: { cinemaAvailable: true }, orderBy: { title: "asc" } }),
    prisma.cinema.findMany(),
    prisma.room.findMany({ include: { cinema: true } }),
  ]);
  return (
    <div className="max-w-2xl">
      <AdminPageHeader kicker="Cinema" title="NOVA SESSÃO" />
      {erro === "conflito" ? (
        <p className="mb-4 rounded-2xl border border-cx-red/40 bg-cx-red/10 px-4 py-3 text-sm">
          Conflito: esta sala já tem sessão neste horário.
        </p>
      ) : null}
      <form action={createSessionAction} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <label className="block text-sm">
          Filme
          <select name="movieId" required className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2">
            {movies.map((m) => (
              <option key={m.id} value={m.id} data-duration={m.durationMin}>
                {m.title} ({m.durationMin}min)
              </option>
            ))}
          </select>
        </label>
        <input type="hidden" name="durationMin" value={movies[0]?.durationMin || 120} />
        <label className="block text-sm">
          Cinema
          <select name="cinemaId" required className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2">
            {cinemas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Sala
          <select name="roomId" required className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2">
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.cinema.name} · {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Início
          <input name="startsAt" type="datetime-local" required className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2" />
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="block text-sm">
            Formato
            <select name="format" className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2">
              <option>2D</option>
              <option>3D</option>
              <option>IMAX</option>
            </select>
          </label>
          <label className="block text-sm">
            Idioma
            <input name="language" defaultValue="pt" className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2" />
          </label>
          <label className="block text-sm">
            Preço (AOA)
            <input name="price" type="number" defaultValue={3500} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2" />
          </label>
        </div>
        <p className="text-xs text-cx-gold">Conflitos de horário na mesma sala são bloqueados automaticamente.</p>
        <button className="rounded-full bg-cx-red px-6 py-3">Criar sessão</button>
      </form>
    </div>
  );
}
