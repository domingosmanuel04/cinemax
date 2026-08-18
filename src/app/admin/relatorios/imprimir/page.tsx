import { prisma } from "@/server/db/prisma";
import { formatCurrency } from "@/shared/lib/utils";
import { Logo } from "@/shared/components/Logo";
import { PrintButton } from "@/features/admin/PrintButton";

export default async function PrintReport() {
  const [orders, tickets, sessions] = await Promise.all([
    prisma.order.findMany({ where: { status: "PAID" }, include: { user: true }, take: 80, orderBy: { createdAt: "desc" } }),
    prisma.ticket.count({ where: { status: { in: ["PAID", "USED"] } } }),
    prisma.session.findMany({ include: { movie: true, room: true, tickets: true, cinema: true }, take: 40 }),
  ]);
  const total = orders.reduce((s, o) => s + o.total, 0);
  return (
    <div className="mx-auto max-w-3xl bg-white p-10 text-black print:p-0">
      <div className="flex items-center justify-between border-b border-black/10 pb-6">
        <Logo />
        <div className="text-right text-sm">
          <p>Relatório operacional</p>
          <p>{new Date().toLocaleString("pt-PT")}</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
        <div>Receita {formatCurrency(total)}</div>
        <div>{tickets} bilhetes</div>
        <div>{orders.length} pedidos</div>
      </div>
      <h2 className="mt-8 text-lg font-semibold">Pedidos recentes</h2>
      <table className="mt-3 w-full text-left text-xs">
        <thead>
          <tr>
            <th className="py-2">Código</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-black/10">
              <td className="py-2 font-mono">{o.code}</td>
              <td>{o.user.email}</td>
              <td>{formatCurrency(o.total)}</td>
              <td>{o.createdAt.toLocaleDateString("pt-PT")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="mt-8 text-lg font-semibold">Ocupação</h2>
      <table className="mt-3 w-full text-left text-xs">
        <thead>
          <tr>
            <th className="py-2">Filme</th>
            <th>Cinema</th>
            <th>Vendidos</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id} className="border-t border-black/10">
              <td className="py-2">{s.movie.title}</td>
              <td>{s.cinema.name}</td>
              <td>
                {s.tickets.length}/{s.room.capacity}
              </td>
              <td>{Math.round((s.tickets.length / Math.max(1, s.room.capacity)) * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <PrintButton />
    </div>
  );
}
