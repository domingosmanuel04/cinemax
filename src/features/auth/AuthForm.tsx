"use client";

import { useActionState } from "react";
import { loginAction, registerAction } from "@/features/auth/actions";
import Link from "next/link";
import { Logo } from "@/shared/components/Logo";
import type { Dictionary } from "@/shared/lib/i18n";

export function AuthForm({
  mode,
  next,
  dict,
}: {
  mode: "login" | "register";
  next?: string;
  dict: Dictionary;
}) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState(action, null);
  const needs2fa = mode === "login" && Boolean(state && "requires2fa" in state && state.requires2fa);

  return (
    <div className="mx-auto mt-28 mb-16 w-full max-w-md px-4">
      <div className="glass rounded-3xl p-8">
        <Logo />
        <h1 className="font-display mt-6 text-2xl tracking-[0.2em]">
          {needs2fa ? dict.auth.twoFactor : mode === "login" ? dict.auth.signIn : dict.auth.register}
        </h1>
        <p className="mt-2 text-sm text-cx-muted">{needs2fa ? dict.auth.otpHint : dict.tagline}</p>
        <form action={formAction} className="mt-8 space-y-4">
          <input type="hidden" name="next" value={next || "/conta"} />
          {needs2fa ? (
            <label className="block text-sm">
              {dict.auth.otp}
              <input name="otp" inputMode="numeric" autoFocus required className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 outline-none" />
            </label>
          ) : (
            <>
              {mode === "register" ? (
                <label className="block text-sm">
                  {dict.auth.name}
                  <input name="name" required className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 outline-none" />
                </label>
              ) : null}
              <label className="block text-sm">
                {dict.auth.email}
                <input name="email" type="email" required className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 outline-none" />
              </label>
              <label className="block text-sm">
                {dict.auth.password}
                <input name="password" type="password" required className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 outline-none" />
              </label>
            </>
          )}
          {state?.error ? <p className="text-sm text-cx-red">{state.error}</p> : null}
          <button disabled={pending} className="w-full rounded-full bg-cx-red py-3 font-semibold disabled:opacity-60">
            {pending
              ? dict.auth.processing
              : needs2fa
                ? dict.auth.confirmOtp
                : mode === "login"
                  ? dict.actions.login
                  : dict.actions.register}
          </button>
        </form>
        <p className="mt-6 text-sm text-cx-muted">
          Demo: wendy.h@example.net / Cinemax@2026
          <br />
          Cliente: cliente1@cinemax.ao / Cinemax@2026
          {needs2fa ? (
            <>
              <br />
              {dict.auth.demoOtp}
            </>
          ) : null}
        </p>
        {mode === "login" ? (
          <p className="mt-4 text-sm">
            {dict.auth.newHere}{" "}
            <Link href="/registar" className="text-cx-red">
              {dict.actions.register}
            </Link>
            <br />
            <Link href="/recuperar" className="text-cx-gold">
              {dict.auth.forgot}
            </Link>
          </p>
        ) : (
          <p className="mt-4 text-sm">
            {dict.auth.already}{" "}
            <Link href="/entrar" className="text-cx-red">
              {dict.actions.login}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
