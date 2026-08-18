"use client";

import { setHeroMovie } from "@/features/admin/actions";
import { useTransition } from "react";
import { toast } from "sonner";

export function HeroButton({ id }: { id: string }) {
  const [p, start] = useTransition();
  return (
    <button
      type="button"
      disabled={p}
      onClick={() =>
        start(async () => {
          await setHeroMovie(id);
          toast.success("Hero actualizado.");
        })
      }
      className="text-xs text-cx-gold"
    >
      Definir Hero
    </button>
  );
}
