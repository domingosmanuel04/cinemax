import { getSettings } from "@/server/services/settings";
import { saveSettingsAction, toggleTwoFactorAction } from "@/features/admin/actions";
import { getSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { AdminPageHeader } from "@/features/admin/AdminTable";

export default async function Page() {
  const [s, session] = await Promise.all([getSettings(), getSession()]);
  const user = session ? await prisma.user.findUnique({ where: { id: session.id } }) : null;
  const fields = [
    ["brandName", "Nome"],
    ["tagline", "Tagline"],
    ["currency", "Moeda (AOA/USD/EUR)"],
    ["defaultLocale", "Idioma (pt/en/fr)"],
    ["preloaderEnabled", "Preloader (true/false)"],
    ["heroVideoUrl", "URL do trailer do Hero"],
    ["bookingFee", "Taxa de reserva"],
    ["supportEmail", "Email suporte"],
    ["supportPhone", "Telefone"],
  ];
  return (
    <div className="max-w-xl space-y-10">
      <AdminPageHeader kicker="Sistema" title="CONFIGURAÇÕES" />
      <p className="-mt-6 text-sm text-cx-muted">CMS sem alterar código. Pagamentos e IA usam variáveis de ambiente quando existirem; caso contrário, modo demo.</p>
      <form action={saveSettingsAction} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        {fields.map(([key, label]) => (
          <label key={key} className="block text-sm">
            {label}
            <input name={key} defaultValue={s[key] || ""} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 outline-none" />
          </label>
        ))}
        <button className="rounded-full bg-cx-red px-5 py-2">Guardar</button>
      </form>
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display tracking-[0.15em]">2FA</h2>
        <p className="mt-2 text-sm text-cx-muted">
          Autenticação de dois factores em modo demo. Depois de activar, o próximo login pede o código <span className="font-mono text-white">123456</span>. Estado actual:{" "}
          <span className="text-cx-gold">{user?.twoFactorEnabled ? "ACTIVO" : "DESLIGADO"}</span>
        </p>
        <form action={toggleTwoFactorAction} className="mt-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="enable" defaultChecked={user?.twoFactorEnabled} /> Activar 2FA nesta conta
          </label>
          {user?.twoFactorEnabled ? (
            <p className="mt-3 font-mono text-xs text-white/50">Segredo demo: {user.twoFactorSecret}</p>
          ) : null}
          <button className="mt-4 rounded-full border border-white/20 px-5 py-2 text-sm">Actualizar 2FA</button>
        </form>
      </section>
    </div>
  );
}
