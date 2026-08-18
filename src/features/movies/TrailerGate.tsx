"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";
import { HERO_VIDEO } from "@/shared/lib/media";

export function TrailerGate({
  open,
  title,
  src,
}: {
  open?: boolean;
  title: string;
  src?: string | null;
}) {
  const [show, setShow] = useState(!!open);
  const stream = src || HERO_VIDEO;
  return (
    <>
      <button type="button" onClick={() => setShow(true)} className="rounded-full border border-white/20 px-5 py-3 text-sm">
        <span className="inline-flex items-center gap-2">
          <Play className="h-4 w-4" /> VER TRAILER
        </span>
      </button>
      {show ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-cx-black">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="font-display tracking-[0.2em]">TRAILER · {title}</p>
              <button type="button" onClick={() => setShow(false)} aria-label="Fechar">
                <X />
              </button>
            </div>
            <div className="relative aspect-video bg-black">
              <video className="h-full w-full object-cover" src={stream} controls autoPlay playsInline poster="" />
            </div>
            <p className="p-4 text-xs text-cx-muted">
              Stream de demonstração licenciado (não é um trailer comercial).
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
