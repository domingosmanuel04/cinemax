import { prisma } from "@/server/db/prisma";
import { readShopCart } from "@/features/checkout/actions";
import { Cover } from "@/shared/components/Cover";
import { ShopCheckout } from "@/features/shop/ShopCheckout";
import { getSession } from "@/server/auth/session";
import Link from "next/link";

export default async function CarrinhoPage() {
  const cart = await readShopCart();
  const ids = Object.keys(cart);
  const products = ids.length
    ? await prisma.product.findMany({ where: { id: { in: ids } } })
    : [];
  const items = products.map((p) => ({
    id: p.id,
    name: p.name,
    qty: cart[p.id],
    price: p.price,
    imageUrl: p.imageUrl,
  }));
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const session = await getSession();

  return (
    <div className="mx-auto max-w-2xl px-4 pt-28 pb-16">
      <h1 className="font-display text-4xl">CARRINHO</h1>
      {!items.length ? (
        <p className="mt-8 text-cx-muted">
          Ainda não há extras. <Link href="/loja" className="text-cx-red">Ir à loja</Link>
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((i) => (
            <div key={i.id} className="flex gap-3">
              <Cover src={i.imageUrl} alt="" className="h-20 w-20 rounded-xl" />
              <div>
                <p>{i.name}</p>
                <p className="text-sm text-cx-muted">{i.qty} un.</p>
              </div>
            </div>
          ))}
          {session ? (
            <ShopCheckout items={items} total={total} />
          ) : (
            <Link href="/entrar?next=/loja/carrinho" className="inline-block rounded-full bg-cx-red px-5 py-3">
              Entrar para pagar
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
