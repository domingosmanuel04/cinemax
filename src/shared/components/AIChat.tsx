"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function AIChat({ scope = "PUBLIC" }: { scope?: "PUBLIC" | "ADMIN" }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string; href?: string }[]>([
    {
      role: "assistant",
      content:
        scope === "ADMIN"
          ? "Sou a CINEMAX AI Business Assistant. Pergunte aos seus dados — receita, ocupação, campanhas."
          : "Sou a CINEMAX AI. Filmes, sessões, bilhetes, pipocas ou CINEMAX+ — pergunte.",
    },
  ]);
  const [pending, start] = useTransition();

  const label = useMemo(() => {
    if (path.startsWith("/admin")) return "Pergunte aos seus dados";
    if (path.startsWith("/checkout") || path.startsWith("/bilhetes")) return "Precisa de ajuda?";
    return "Pergunte à CINEMAX AI";
  }, [path]);

  useEffect(() => {
    if (path.startsWith("/assistir")) setOpen(false);
  }, [path]);

  function send(text?: string) {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    start(async () => {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, scope }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.answer || "Não consegui responder agora.", href: data.href }]);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glow-red fixed right-4 bottom-20 z-40 flex items-center gap-2 rounded-full bg-cx-red px-4 py-3 text-sm font-medium md:bottom-6"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </button>
      {open ? (
        <div className="glass-strong fixed right-4 bottom-24 z-50 flex h-[min(70vh,560px)] w-[min(92vw,400px)] flex-col overflow-hidden rounded-2xl md:bottom-20">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="font-display tracking-[0.2em] text-sm">CINEMAX AI</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "ml-8 rounded-2xl bg-cx-red/80 p-3" : "mr-6 rounded-2xl bg-white/5 p-3"}>
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.href ? (
                  <a href={m.href} className="mt-2 inline-block text-xs text-cx-gold">
                    Abrir no catálogo →
                  </a>
                ) : null}
              </div>
            ))}
            {pending ? <p className="text-cx-muted">A consultar o catálogo…</p> : null}
          </div>
          <form
            className="border-t border-white/10 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Qual filme de acção recomendas?"
              className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm outline-none"
            />
          </form>
        </div>
      ) : null}
    </>
  );
}
