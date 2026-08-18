"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/features/auth/actions";
import { Logo } from "@/shared/components/Logo";
import Link from "next/link";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, null);
  return (
    <div className="mx-auto mt-28 mb-16 w-full max-w-md px-4">
      <div className="glass rounded-3xl p-8">
        <Logo />
        <h1 className="font-display mt-6 text-2xl tracking-[0.2em]">NOVA PALAVRA-PASSE</h1>
        <form action={action} className="mt-8 space-y-4">
          <input type="hidden" name="token" value={token} />
          <label className="block text-sm">
            Nova palavra-passe
            <input name="password" type="password" required minLength={8} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 outline-none" />
          </label>
          <label className="block text-sm">
            Confirmar
            <input name="confirm" type="password" required minLength={8} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 outline-none" />
          </label>
          {state?.error ? <p className="text-sm text-cx-red">{state.error}</p> : null}
          <button disabled={pending} className="w-full rounded-full bg-cx-red py-3 font-semibold disabled:opacity-60">
            {pending ? "A guardar…" : "Guardar e entrar"}
          </button>
        </form>
        <p className="mt-6 text-sm">
          <Link href="/recuperar" className="text-cx-red">Pedir nova ligação</Link>
        </p>
      </div>
    </div>
  );
}
