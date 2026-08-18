"use client";

import { useState, useTransition } from "react";
import { checkoutShop, updateShopItem } from "@/features/checkout/actions";
import { PAYMENT_METHODS } from "@/shared/lib/payments";
import { toast } from "sonner";

export function ShopCheckout({
  items,
  total,
}: {
  items: { id: string; name: string; qty: number; price: number }[];
  total: number;
}) {
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]["id"]>("MULTICAIXA");
  const [pending, start] = useTransition();
  const [done, setDone] = useState<{ code: string; pending?: boolean; instructions?: string } | null>(null);

  if (done) {
    return (
      <div className="rounded-3xl border border-white/10 p-6">
        <p className="text-xs tracking-[0.3em] text-cx-gold uppercase">{done.pending ? "Aguarda pagamento" : "Pedido confirmado"}</p>
        <p className="mt-2 font-mono">{done.code}</p>
        {done.instructions ? <p className="mt-3 text-sm text-cx-muted">{done.instructions}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((i) => (
        <div key={i.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 p-3">
          <div>
            <p>{i.name}</p>
            <p className="text-xs text-cx-gold">{i.qty} × {i.price} AOA</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="rounded-full border border-white/20 px-3" onClick={() => start(() => updateShopItem(i.id, i.qty - 1))}>
              −
            </button>
            <button type="button" className="rounded-full border border-white/20 px-3" onClick={() => start(() => updateShopItem(i.id, i.qty + 1))}>
              +
            </button>
          </div>
        </div>
      ))}
      <label className="block text-sm">
        Pagamento
        <select value={method} onChange={(e) => setMethod(e.target.value as typeof method)} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2">
          {PAYMENT_METHODS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      <p className="text-lg text-cx-gold">Total {total.toLocaleString("pt-PT")} AOA</p>
      <button
        disabled={pending || !items.length}
        onClick={() =>
          start(async () => {
            const r = await checkoutShop(method);
            if (r.error) toast.error(r.error);
            else {
              toast.success("Pedido criado.");
              setDone({ code: r.code!, pending: r.pending, instructions: r.instructions });
            }
          })
        }
        className="w-full rounded-full bg-cx-red py-3 disabled:opacity-40"
      >
        {pending ? "A processar…" : "Pagar extras"}
      </button>
    </div>
  );
}
