"use client";

import { useActionState } from "react";
import { changePasswordAction, updateProfileAction } from "@/features/auth/actions";
import type { Dictionary } from "@/shared/lib/i18n";

export function ProfileForm({
  dict,
  name,
  phone,
  dateOfBirth,
  preferredCinemaId,
  locale,
  cinemas,
  avatarUrl,
}: {
  dict: Dictionary;
  name: string;
  phone: string;
  dateOfBirth: string;
  preferredCinemaId: string;
  locale: string;
  cinemas: { id: string; name: string; city: string }[];
  avatarUrl: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, null);
  return (
    <form action={formAction} className="mt-8 max-w-xl space-y-4 rounded-3xl border border-white/10 p-6">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
      ) : null}
      <label className="block text-sm">
        {dict.account.avatar}
        <input name="avatarUrl" defaultValue={avatarUrl} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 outline-none" />
      </label>
      <label className="block text-sm">
        {dict.account.fullName}
        <input name="name" defaultValue={name} required className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 outline-none" />
      </label>
      <label className="block text-sm">
        {dict.account.phone}
        <input name="phone" defaultValue={phone} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 outline-none" />
      </label>
      <label className="block text-sm">
        {dict.account.birth}
        <input name="dateOfBirth" type="date" defaultValue={dateOfBirth} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 outline-none" />
      </label>
      <label className="block text-sm">
        {dict.account.cinema}
        <select name="preferredCinemaId" defaultValue={preferredCinemaId} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3">
          <option value="">—</option>
          {cinemas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.city}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        {dict.account.language}
        <select name="locale" defaultValue={locale} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3">
          <option value="pt">Português</option>
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </label>
      {state?.error ? <p className="text-sm text-cx-red">{state.error}</p> : null}
      <button disabled={pending} className="rounded-full bg-cx-red px-6 py-3 disabled:opacity-60">
        {pending ? dict.auth.processing : dict.account.save}
      </button>
    </form>
  );
}

export function PasswordForm({ dict }: { dict: Dictionary }) {
  const [state, formAction, pending] = useActionState(changePasswordAction, null);
  return (
    <form action={formAction} className="mt-8 max-w-xl space-y-4 rounded-3xl border border-white/10 p-6">
      <h2 className="font-display text-xl">{dict.account.changePassword}</h2>
      <label className="block text-sm">
        {dict.account.currentPassword}
        <input name="current" type="password" required className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 outline-none" />
      </label>
      <label className="block text-sm">
        {dict.auth.newPassword}
        <input name="password" type="password" minLength={8} required className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 outline-none" />
      </label>
      <label className="block text-sm">
        {dict.auth.confirm}
        <input name="confirm" type="password" minLength={8} required className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 outline-none" />
      </label>
      {state?.error ? <p className="text-sm text-cx-red">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-emerald-400">{dict.account.passwordChanged}</p> : null}
      <button disabled={pending} className="rounded-full border border-white/20 px-6 py-3 disabled:opacity-60">
        {pending ? dict.auth.processing : dict.auth.savePassword}
      </button>
    </form>
  );
}
