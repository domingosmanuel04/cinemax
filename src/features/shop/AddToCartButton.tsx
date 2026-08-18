"use client";

import { useTransition } from "react";
import { addShopItem } from "@/features/checkout/actions";
import { toast } from "sonner";

export function AddToCartButton({
  productId,
  addLabel = "Adicionar ao carrinho",
  addingLabel = "A adicionar…",
  addedLabel = "Adicionado ao carrinho de extras.",
}: {
  productId: string;
  addLabel?: string;
  addingLabel?: string;
  addedLabel?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await addShopItem(productId);
          toast.success(addedLabel);
        })
      }
      className="mt-3 text-sm text-cx-red disabled:opacity-50"
    >
      {pending ? addingLabel : addLabel}
    </button>
  );
}
