import { prisma } from "@/server/db/prisma";
import { AdminTable, AdminPageHeader } from "@/features/admin/AdminTable";
import { updateInventoryAction } from "@/features/admin/actions";
import { Cover } from "@/shared/components/Cover";

export default async function Page() {
  const rows = await prisma.inventoryItem.findMany({ include: { product: true, cinema: true } });
  return (
    <div>
      <AdminPageHeader kicker="Sistema" title="INVENTÁRIO" />
      <AdminTable
        columns={["", "Produto", "Cinema", "Stock", "Mínimo", "Alerta"]}
        rows={rows.map((i) => [
          <Cover key={i.id} src={i.product.imageUrl} alt="" className="h-10 w-10 rounded" />,
          i.product.name,
          i.cinema.name,
          <form key={`s-${i.id}`} action={updateInventoryAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={i.id} />
            <input name="stock" type="number" defaultValue={i.stock} className="w-20 rounded bg-white/10 px-2 py-1 text-sm" />
            <input name="minStock" type="number" defaultValue={i.minStock} className="w-16 rounded bg-white/10 px-2 py-1 text-sm" />
            <button className="text-xs text-cx-gold">OK</button>
          </form>,
          i.minStock,
          i.stock <= i.minStock ? "BAIXO" : "OK",
        ])}
      />
    </div>
  );
}
