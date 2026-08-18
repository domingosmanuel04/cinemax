"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

export function ReviewForm({ movieId }: { movieId: string }) {
  const [pending, start] = useTransition();
  const [body, setBody] = useState("");
  return (
    <form
      className="glass mt-6 max-w-xl rounded-2xl p-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movieId, rating: 5, body }),
          });
          if (res.ok) {
            toast.success("Avaliação enviada.");
            setBody("");
          } else toast.error("Inicie sessão para avaliar.");
        });
      }}
    >
      <p className="mb-2 text-sm">A sua avaliação</p>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} className="h-24 w-full rounded-xl bg-white/5 p-3 text-sm outline-none" required />
      <button disabled={pending} className="mt-3 rounded-full bg-cx-red px-4 py-2 text-sm">
        Publicar
      </button>
    </form>
  );
}
