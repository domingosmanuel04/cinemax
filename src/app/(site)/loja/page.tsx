import { prisma } from "@/server/db/prisma";
import { formatCurrency } from "@/shared/lib/utils";
import { getSettings } from "@/server/services/settings";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";
import { AddToCartButton } from "@/features/shop/AddToCartButton";
import Link from "next/link";
import { readShopCart } from "@/features/checkout/actions";
import { cookies } from "next/headers";
import { getDictionary } from "@/shared/lib/i18n";

export default async function LojaPage() {
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  const dict = getDictionary(locale);
  const [products, settings, cart] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, where: { status: "ACTIVE" } }),
    getSettings(),
    readShopCart(),
  ]);
  const count = Object.values(cart).reduce((s, n) => s + n, 0);
  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-28 pb-16 md:px-8">
      <div className="relative mb-10 overflow-hidden rounded-3xl">
        <Cover src={AMBIENCE.popcorn} alt="" className="h-56 w-full object-cover md:h-64" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-5xl">{dict.shop.title}</h1>
            <p className="mt-2 text-white/70">{dict.shop.hint}</p>
          </div>
          <Link href="/loja/carrinho" className="rounded-full bg-cx-red px-5 py-2 text-sm">
            {dict.shop.cart} ({count})
          </Link>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-3xl border border-white/10 bg-black">
            <Cover src={p.imageUrl} alt={p.name} className="h-52 w-full" />
            <div className="p-4">
              <p className="text-xs text-cx-red uppercase">{p.category.name}</p>
              <h2 className="mt-1">{p.name}</h2>
              <p className="text-sm text-cx-muted">{p.description}</p>
              <p className="mt-2 text-cx-gold">{formatCurrency(p.price, settings.currency)}</p>
              <AddToCartButton productId={p.id} addLabel={dict.shop.add} addingLabel={dict.shop.adding} addedLabel={dict.shop.added} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
