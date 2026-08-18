"use client";

import { subscribePlan } from "@/features/checkout/actions";
import { useTransition } from "react";
import { toast } from "sonner";

export function SubscribeButton({ planId }: { planId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await subscribePlan(planId, "MONTHLY");
          if (res.error === "login") toast.error("Inicie sessão para assinar.");
          else if (res.error) toast.error(res.error);
          else toast.success("CINEMAX+ activado.");
        })
      }
      className="mt-6 w-full rounded-full bg-cx-red py-2 text-sm"
    >
      {pending ? "A processar…" : "Assinar"}
    </button>
  );
}
