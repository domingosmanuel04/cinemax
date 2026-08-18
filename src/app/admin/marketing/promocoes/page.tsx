import { prisma } from "@/server/db/prisma";
import { AdminTable, AdminPageHeader } from "@/features/admin/AdminTable";
import { savePromotionAction } from "@/features/admin/actions";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";

export default async function Page() {
  const rows = await prisma.promotion.findMany({ orderBy: { startsAt: "desc" } });
  return (
    <div>
      <AdminPageHeader kicker="Crescimento" title="PROMOÇÕES" />
      <form action={savePromotionAction} className="mb-8 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-2">
        <input name="title" required placeholder="Título" className="rounded-xl bg-white/5 px-3 py-2" />
        <input name="type" defaultValue="FLASH" placeholder="Tipo" className="rounded-xl bg-white/5 px-3 py-2" />
        <textarea name="description" placeholder="Descrição" className="h-20 rounded-xl bg-white/5 px-3 py-2 md:col-span-2" />
        <input name="imageUrl" defaultValue={AMBIENCE.popcorn} placeholder="URL da imagem" className="rounded-xl bg-white/5 px-3 py-2 md:col-span-2" />
        <input name="discount" type="number" defaultValue={20} placeholder="% desconto" className="rounded-xl bg-white/5 px-3 py-2" />
        <input name="startsAt" type="datetime-local" className="rounded-xl bg-white/5 px-3 py-2" />
        <input name="endsAt" type="datetime-local" className="rounded-xl bg-white/5 px-3 py-2" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked /> Activa
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" /> Destaque
        </label>
        <button className="rounded-full bg-cx-red px-5 py-2 text-sm md:col-span-2">Criar promoção</button>
      </form>
      <AdminTable
        columns={["", "Título", "Tipo", "Desconto", "Activa", ""]}
        rows={rows.map((p) => [
          <Cover key={p.id} src={p.imageUrl} alt="" className="h-12 w-20 rounded-lg" />,
          p.title,
          p.type,
          p.discount ? `${p.discount}%` : "—",
          p.active ? "Sim" : "Não",
          <form key={`e-${p.id}`} action={savePromotionAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={p.id} />
            <input type="hidden" name="title" value={p.title} />
            <input type="hidden" name="description" value={p.description} />
            <input type="hidden" name="type" value={p.type} />
            <input type="hidden" name="imageUrl" value={p.imageUrl} />
            <input type="hidden" name="discount" value={String(p.discount || 0)} />
            <input type="hidden" name="startsAt" value={p.startsAt.toISOString().slice(0, 16)} />
            <input type="hidden" name="endsAt" value={p.endsAt.toISOString().slice(0, 16)} />
            <label className="flex items-center gap-1 text-xs">
              <input type="checkbox" name="active" defaultChecked={p.active} /> activa
            </label>
            <button className="text-xs text-cx-gold">Guardar</button>
          </form>,
        ])}
      />
    </div>
  );
}
