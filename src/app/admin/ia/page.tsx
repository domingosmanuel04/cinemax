import { AdminPageHeader } from "@/features/admin/AdminTable";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";

export default function Page() {
  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-3xl">
        <Cover src={AMBIENCE.projector} alt="" className="h-40 w-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-black" />
        <div className="absolute inset-0 flex items-end p-6">
          <AdminPageHeader kicker="Crescimento" title="CINEMAX AI" />
        </div>
      </div>
      <p className="max-w-2xl text-sm text-cx-muted">
        Pergunte: filme mais lucrativo, ocupação, sessão que vendeu mais, margem de produtos, campanha de estreia, previsão de fim-de-semana.
        A IA consulta dados reais do sistema. Clientes não acedem a este âmbito.
      </p>
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <p className="text-sm">Use o botão «Pergunte aos seus dados» no canto inferior direito — a IA devolve ligações para o catálogo e campanhas.</p>
      </div>
    </div>
  );
}
