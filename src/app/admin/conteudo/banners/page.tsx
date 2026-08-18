import { prisma } from "@/server/db/prisma";
import { AdminTable, AdminPageHeader } from "@/features/admin/AdminTable";
import { saveBannerAction } from "@/features/admin/actions";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";

export default async function Page() {
  const [banners, hero] = await Promise.all([
    prisma.banner.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.movie.findFirst({ where: { heroEnabled: true } }),
  ]);
  return (
    <div>
      <AdminPageHeader kicker="CMS" title="HERO & BANNERS" />
      <p className="mb-6 text-sm text-cx-muted">Filme do Hero: {hero?.title || "—"} · defina o destaque na listagem de filmes.</p>
      <form action={saveBannerAction} className="mb-8 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-2">
        <input name="title" required placeholder="Título" className="rounded-xl bg-white/5 px-3 py-2" />
        <input name="subtitle" placeholder="Subtítulo" className="rounded-xl bg-white/5 px-3 py-2" />
        <input name="imageUrl" defaultValue={AMBIENCE.lobby} placeholder="URL da imagem" className="rounded-xl bg-white/5 px-3 py-2 md:col-span-2" />
        <input name="ctaLabel" defaultValue="Ver mais" placeholder="CTA" className="rounded-xl bg-white/5 px-3 py-2" />
        <input name="ctaHref" defaultValue="/filmes" placeholder="Ligação" className="rounded-xl bg-white/5 px-3 py-2" />
        <input name="placement" defaultValue="HOME" placeholder="Placement" className="rounded-xl bg-white/5 px-3 py-2" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked /> Activo
        </label>
        <button className="rounded-full bg-cx-red px-5 py-2 text-sm md:col-span-2">Criar banner</button>
      </form>
      <AdminTable
        columns={["", "Título", "Placement", "CTA", "Activo", ""]}
        rows={banners.map((b) => [
          <Cover key={b.id} src={b.imageUrl} alt="" className="h-12 w-20 rounded-lg" />,
          b.title,
          b.placement,
          b.ctaLabel || "—",
          b.active ? "Sim" : "Não",
          <form key={`e-${b.id}`} action={saveBannerAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={b.id} />
            <input type="hidden" name="title" value={b.title} />
            <input type="hidden" name="subtitle" value={b.subtitle || ""} />
            <input type="hidden" name="imageUrl" value={b.imageUrl} />
            <input type="hidden" name="ctaLabel" value={b.ctaLabel || ""} />
            <input type="hidden" name="ctaHref" value={b.ctaHref || ""} />
            <input type="hidden" name="placement" value={b.placement} />
            <input type="hidden" name="sortOrder" value={String(b.sortOrder)} />
            <label className="flex items-center gap-1 text-xs">
              <input type="checkbox" name="active" defaultChecked={b.active} /> activo
            </label>
            <button className="text-cx-gold text-xs">Guardar</button>
          </form>,
        ])}
      />
    </div>
  );
}
