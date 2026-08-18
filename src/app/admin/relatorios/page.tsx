import { prisma } from "@/server/db/prisma";
import { formatCurrency } from "@/shared/lib/utils";
import { AdminPageHeader } from "@/features/admin/AdminTable";
import Link from "next/link";

export default async function Page() {
  const [orders, tickets, subs] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, _avg: { total: true }, _count: true, where: { status: "PAID" } }),
    prisma.ticket.count({ where: { status: { in: ["PAID", "USED"] } } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
  ]);
  return (
    <div>
      <AdminPageHeader kicker="Crescimento" title="RELATÓRIOS" />
      <div className="mt-2 grid gap-3 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cx-gold/15 to-transparent p-6">
          Receita {formatCurrency(orders._sum.total || 0)}
        </div>
        <div className="rounded-3xl border border-white/10 p-6">Ticket médio {formatCurrency(Math.round(orders._avg.total || 0))}</div>
        <div className="rounded-3xl border border-white/10 p-6">{tickets} bilhetes · {subs} assinantes</div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href="/api/admin/reports?type=vendas" className="rounded-full bg-cx-red px-4 py-2">CSV vendas</Link>
        <Link href="/api/admin/reports?type=vendas&format=xlsx" className="rounded-full border border-white/20 px-4 py-2">Excel vendas</Link>
        <Link href="/api/admin/reports?type=bilhetes" className="rounded-full border border-white/20 px-4 py-2">CSV bilhetes</Link>
        <Link href="/api/admin/reports?type=ocupacao" className="rounded-full border border-white/20 px-4 py-2">CSV ocupação</Link>
        <Link href="/admin/relatorios/imprimir" className="rounded-full border border-cx-gold/40 px-4 py-2 text-cx-gold">Imprimir / PDF</Link>
      </div>
    </div>
  );
}
