"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, resetPasswordAction } from "@/features/auth/actions";
import Link from "next/link";
import { Logo } from "@/shared/components/Logo";
import type { Dictionary } from "@/shared/lib/i18n";

export function RecoverRequestForm({ dict }: { dict: Dictionary }) {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, null);
  return (
    <div className="mx-auto mt-28 mb-16 w-full max-w-md px-4">
      <div className="glass rounded-3xl p-8">
        <Logo />
        <h1 className="font-display mt-6 text-2xl tracking-[0.2em]">{dict.auth.recoverTitle}</h1>
        <p className="mt-2 text-sm text-cx-muted">{dict.auth.recoverHint}</p>
        <form action={formAction} className="mt-8 space-y-4">
          <label className="block text-sm">
            {dict.auth.email}
            <input name="email" type="email" required className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 outline-none" />
          </label>
          {state?.error ? <p className="text-sm text-cx-red">{state.error}</p> : null}
          <button disabled={pending} className="w-full rounded-full bg-cx-red py-3 font-semibold disabled:opacity-60">
            {pending ? dict.auth.processing : dict.auth.sendLink}
          </button>
        </form>
        {state?.ok ? (
          <div className="mt-6 text-sm">
            <p className="text-cx-muted">{dict.auth.sent}</p>
            {state.demoUrl ? (
              <p className="mt-3 break-all">
                {dict.auth.demoLink}{" "}
                <Link href={state.demoUrl} className="text-cx-red">
                  {state.demoUrl}
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}
        <p className="mt-6 text-sm">
          <Link href="/entrar" className="text-cx-red">
            {dict.auth.backToLogin}
          </Link>
        </p>
      </div>
    </div>
  );
}

export function RecoverResetForm({ dict, token }: { dict: Dictionary; token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, null);
  return (
    <div className="mx-auto mt-28 mb-16 w-full max-w-md px-4">
      <div className="glass rounded-3xl p-8">
        <Logo />
        <h1 className="font-display mt-6 text-2xl tracking-[0.2em]">{dict.auth.newPassword}</h1>
        <form action={formAction} className="mt-8 space-y-4">
          <input type="hidden" name="token" value={token} />
          <label className="block text-sm">
            {dict.auth.newPassword}
            <input name="password" type="password" minLength={8} required className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 outline-none" />
          </label>
          <label className="block text-sm">
            {dict.auth.confirm}
            <input name="confirm" type="password" minLength={8} required className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 outline-none" />
          </label>
          {state?.error ? <p className="text-sm text-cx-red">{state.error}</p> : null}
          <button disabled={pending} className="w-full rounded-full bg-cx-red py-3 font-semibold disabled:opacity-60">
            {pending ? dict.auth.processing : dict.auth.savePassword}
          </button>
        </form>
      </div>
    </div>
  );
}
