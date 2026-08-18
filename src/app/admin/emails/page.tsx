import { AdminPageHeader } from "@/features/admin/AdminTable";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";

const TEMPLATES = [
  {
    id: "ticket",
    name: "Confirmação de bilhete",
    subject: "O seu momento CINEMAX está reservado",
    preview: "QR, sessão, lugares e extras. Enviado após pagamento confirmado.",
  },
  {
    id: "pending",
    name: "Referência Multicaixa",
    subject: "Pague a sua reserva CINEMAX",
    preview: "Entidade, referência e prazo de 30 minutos para o hold de lugares.",
  },
  {
    id: "newsletter",
    name: "Newsletter semanal",
    subject: "Estreias, IMAX e combos da semana",
    preview: "Cartaz, countdown e CTA para comprar bilhete.",
  },
  {
    id: "campaign",
    name: "Campanha de estreia",
    subject: "Noite Vermelha — 20% em 3D",
    preview: "Gerado pela CINEMAX AI a partir do CMS de campanhas.",
  },
  {
    id: "reset",
    name: "Recuperar palavra-passe",
    subject: "Redefinir acesso à sua conta",
    preview: "Ligação de 15 minutos. Nunca inclui a palavra-passe.",
  },
];

export default function EmailsPage() {
  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-3xl">
        <Cover src={AMBIENCE.lobby} alt="" className="h-36 w-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-black" />
        <div className="absolute inset-0 flex items-end p-6">
          <AdminPageHeader kicker="Sistema" title="EMAILS" />
        </div>
      </div>
      <p className="mb-6 max-w-2xl text-sm text-cx-muted">
        Modelos transaccionais em modo demo. Em produção ligam-se a SMTP / Resend via variáveis de ambiente — o conteúdo é gerido aqui, sem alterar código.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {TEMPLATES.map((t) => (
          <article key={t.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[11px] tracking-[0.25em] text-cx-gold uppercase">{t.id}</p>
            <h2 className="mt-2 text-lg">{t.name}</h2>
            <p className="mt-1 text-sm text-white/80">{t.subject}</p>
            <p className="mt-3 text-sm text-cx-muted">{t.preview}</p>
            <div className="mt-4 rounded-2xl bg-black p-4 text-xs leading-relaxed text-white/70">
              <p className="font-display tracking-[0.2em] text-cx-red">CINEMAX</p>
              <p className="mt-2">Olá {'{{nome}}'},</p>
              <p className="mt-2">{t.preview}</p>
              <p className="mt-3 text-cx-gold">Your Movie. Your Moment.</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
