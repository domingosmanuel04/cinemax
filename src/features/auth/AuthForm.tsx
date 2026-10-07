"use client";

import { useActionState, useState } from "react";
import { loginAction, registerAction } from "@/features/auth/actions";
import Link from "next/link";
import { Logo } from "@/shared/components/Logo";
import type { Dictionary } from "@/shared/lib/i18n";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="relative min-h-[75vh] flex items-center justify-center px-4 py-8">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-[#e50914]/15 via-red-950/5 to-transparent blur-[100px]" />

      <div className="relative w-full max-w-sm">
        {/* Compact Glass Card */}
        <div className="rounded-3xl border border-white/10 bg-[#0c0d12]/95 p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-300">
          
          {/* Top Logo & Title */}
          <div className="flex flex-col items-center text-center">
            <Logo />
            <h1 className="mt-4 font-display text-2xl font-bold tracking-wide text-white">
              {needs2fa ? dict.auth.twoFactor : mode === "login" ? "Iniciar Sessão" : dict.auth.register}
            </h1>
          </div>

          {/* Form */}
          <form action={formAction} className="mt-6 space-y-3.5">
            <input type="hidden" name="next" value={next || "/"} />

            {needs2fa ? (
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-cx-muted uppercase tracking-wider">
                  {dict.auth.otp}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-amber-400" />
                  <input
                    name="otp"
                    inputMode="numeric"
                    autoFocus
                    required
                    placeholder="123456"
                    className="w-full rounded-2xl border border-amber-500/30 bg-black/60 py-2.5 pl-10 pr-4 text-sm font-mono text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                  />
                </div>
              </div>
            ) : (
              <>
                {mode === "register" ? (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-cx-muted uppercase tracking-wider">
                      {dict.auth.name}
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
                      <input
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Nome completo"
                        className="w-full rounded-2xl border border-white/10 bg-black/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-[#e50914]/60 focus:ring-1 focus:ring-[#e50914]/40"
                      />
                    </div>
                  </div>
                ) : null}

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-cx-muted uppercase tracking-wider">
                    {dict.auth.email}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
                    <input
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="email@cinemax.ao"
                      className="w-full rounded-2xl border border-white/10 bg-black/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-[#e50914]/60 focus:ring-1 focus:ring-[#e50914]/40"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-cx-muted uppercase tracking-wider">
                      {dict.auth.password}
                    </label>
                    {mode === "login" && (
                      <Link href="/recuperar" className="text-[10px] text-amber-400/90 hover:underline">
                        Esqueceu?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-white/10 bg-black/50 py-2.5 pl-10 pr-10 text-sm text-white placeholder-white/30 outline-none transition focus:border-[#e50914]/60 focus:ring-1 focus:ring-[#e50914]/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-white/40 hover:text-white"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {state?.error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-2.5 text-xs text-red-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                <span>{state.error}</span>
              </div>
            ) : null}

            <button
              disabled={pending}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#e50914] to-red-700 py-3 font-bold text-white shadow-[0_0_20px_rgba(229,9,20,0.35)] transition-all duration-300 hover:scale-[1.01] hover:from-red-600 hover:to-red-800 disabled:opacity-50 mt-2"
            >
              <div className="flex items-center justify-center gap-2 text-xs">
                <span>
                  {pending
                    ? dict.auth.processing
                    : needs2fa
                      ? dict.auth.confirmOtp
                      : mode === "login"
                        ? dict.actions.login
                        : dict.actions.register}
                </span>
                {!pending && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />}
              </div>
            </button>
          </form>

          {/* Quick Demo Fill Credentials */}
          {mode === "login" && !needs2fa && (
            <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
              <p className="text-[10px] font-semibold text-cx-muted tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" /> Acesso Rápido Demo:
              </p>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleQuickFill("admin@cinemax.ao", "Cinemax@2026")}
                  className="flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-amber-300 hover:bg-amber-500/20 transition"
                >
                  <ShieldCheck className="h-3 w-3 text-amber-400" /> Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("wendy.h@example.net", "Cinemax@2026")}
                  className="flex items-center gap-1 rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-0.5 text-blue-300 hover:bg-blue-500/20 transition"
                >
                  <CheckCircle2 className="h-3 w-3 text-blue-400" /> Wendy Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("cliente1@cinemax.ao", "Cinemax@2026")}
                  className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-emerald-300 hover:bg-emerald-500/20 transition"
                >
                  <UserIcon className="h-3 w-3 text-emerald-400" /> Cliente
                </button>
              </div>
            </div>
          )}

          {/* Footer Mode Switch Link */}
          <div className="mt-4 pt-3 border-t border-white/10 text-center text-xs text-cx-muted">
            {mode === "login" ? (
              <p>
                {dict.auth.newHere}{" "}
                <Link href="/registar" className="font-semibold text-[#e50914] hover:underline">
                  {dict.actions.register}
                </Link>
              </p>
            ) : (
              <p>
                {dict.auth.already}{" "}
                <Link href="/entrar" className="font-semibold text-[#e50914] hover:underline">
                  {dict.actions.login}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
