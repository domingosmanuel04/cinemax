"use client";

import { useCallback, useState, useTransition } from "react";
import { checkInTicket } from "@/features/checkout/actions";
import { Cover } from "@/shared/components/Cover";
import { QrCamera } from "@/features/admin/QrCamera";

type Result = {
  ok?: boolean;
  error?: string;
  ticket?: {
    code: string;
    checkedInAt?: Date | string | null;
    session: { movie: { title: string; posterUrl: string }; cinema: { name: string }; room: { name: string }; startsAt: Date | string };
    items: { seat: { row: string; number: number } }[];
  };
};

export function CheckInForm() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [pending, start] = useTransition();

  const applyCode = useCallback((value: string) => {
    setCode(value);
    start(async () => {
      const r = await checkInTicket(value);
      setResult(r as Result);
      if (r.ok) setCode("");
    });
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <form
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await checkInTicket(code);
            setResult(r as Result);
            if (r.ok) setCode("");
          });
        }}
      >
        <label className="block text-sm">
          Código do bilhete ou payload QR
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="TKT-XXXXXXXX ou CINEMAX:TKT-…"
            className="mt-2 w-full rounded-2xl bg-white/5 px-4 py-4 font-mono text-lg outline-none"
            autoFocus
          />
        </label>
        <QrCamera onCode={applyCode} />
        <button disabled={pending || !code.trim()} className="mt-5 w-full rounded-full bg-cx-red py-4 text-sm font-semibold disabled:opacity-40">
          {pending ? "A validar…" : "Validar entrada"}
        </button>
      </form>
      <div className="rounded-3xl border border-white/10 bg-black p-5">
        {result?.ok && result.ticket ? (
          <div>
            <Cover src={result.ticket.session.movie.posterUrl} alt="" className="mb-4 h-48 w-full rounded-2xl" />
            <p className="text-xs tracking-[0.3em] text-emerald-400 uppercase">Entrada autorizada</p>
            <h2 className="mt-2 text-xl">{result.ticket.session.movie.title}</h2>
            <p className="mt-1 text-sm text-cx-muted">
              {result.ticket.session.cinema.name} · {result.ticket.session.room.name}
            </p>
            <p className="mt-2 font-mono text-cx-gold">{result.ticket.code}</p>
            <p className="mt-3 text-sm">
              Lugares: {result.ticket.items.map((i) => `${i.seat.row}${i.seat.number}`).join(", ")}
            </p>
          </div>
        ) : result?.error ? (
          <p className="text-cx-red">{result.error}</p>
        ) : (
          <p className="text-sm text-cx-muted">Leia o QR no telemóvel do cliente ou introduza o código TKT.</p>
        )}
      </div>
    </div>
  );
}
