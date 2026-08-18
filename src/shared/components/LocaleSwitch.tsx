"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LocaleSwitch({ locale, currency }: { locale: string; currency: string }) {
  const router = useRouter();
  const [open, setOpen] = useState<"lang" | "cur" | null>(null);

  async function setPref(key: "locale" | "currency", value: string) {
    await fetch("/api/prefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    setOpen(null);
    router.refresh();
  }

  return (
    <div className="relative hidden items-center gap-1 md:flex">
      <button type="button" onClick={() => setOpen(open === "lang" ? null : "lang")} className="rounded-full px-2 py-1 text-[11px] text-white/70 hover:text-white">
        {locale.toUpperCase()} ▾
      </button>
      {open === "lang" ? (
        <div className="glass-strong absolute top-8 right-0 z-50 min-w-28 rounded-xl p-2 text-sm">
          {["pt", "en", "fr"].map((l) => (
            <button key={l} type="button" onClick={() => setPref("locale", l)} className="block w-full rounded px-2 py-1 text-left hover:bg-white/10">
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      ) : null}
      <button type="button" onClick={() => setOpen(open === "cur" ? null : "cur")} className="rounded-full px-2 py-1 text-[11px] text-white/70 hover:text-white">
        {currency} ▾
      </button>
      {open === "cur" ? (
        <div className="glass-strong absolute top-8 right-0 z-50 min-w-28 rounded-xl p-2 text-sm">
          {["AOA", "USD", "EUR"].map((c) => (
            <button key={c} type="button" onClick={() => setPref("currency", c)} className="block w-full rounded px-2 py-1 text-left hover:bg-white/10">
              {c}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
