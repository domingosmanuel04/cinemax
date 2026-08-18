"use client";

import { generateCampaign } from "@/features/admin/actions";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function CampaignForm() {
  const [prompt, setPrompt] = useState("Cria uma campanha para o lançamento de um filme de terror.");
  const [out, setOut] = useState("");
  const [p, start] = useTransition();
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-sm text-cx-muted">CINEMAX AI Marketing</p>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="mt-2 h-24 w-full rounded-xl bg-white/5 p-3 text-sm" />
      <button
        disabled={p}
        onClick={() =>
          start(async () => {
            const copy = await generateCampaign(prompt);
            setOut(copy);
            toast.success("Campanha gerada em rascunho.");
          })
        }
        className="mt-3 rounded-full bg-cx-red px-4 py-2 text-sm"
      >
        Gerar campanha
      </button>
      {out ? <pre className="mt-4 whitespace-pre-wrap text-sm text-cx-muted">{out}</pre> : null}
    </div>
  );
}
