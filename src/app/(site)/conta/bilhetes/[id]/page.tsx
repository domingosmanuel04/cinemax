import { getSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary } from "@/shared/lib/i18n";
import { requestRefundAction } from "@/features/checkout/actions";

export default async function TicketDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ refund?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/entrar");
  const { id } = await params;
  const { refund } = await searchParams;
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  const dict = getDictionary(locale);
  const ticket = await prisma.ticket.findFirst({
    where: { id, userId: session.id },
    include: { session: { include: { movie: true, cinema: true, room: true } }, items: { include: { seat: true } } },
  });
  if (!ticket) redirect("/conta");
  const qr = await QRCode.toDataURL(ticket.qrPayload);
  const canRefund = ["PAID", "PENDING"].includes(ticket.status) && !ticket.checkedInAt;
  return (
    <div className="mx-auto max-w-md px-4 pt-28 pb-16 text-center">
      <h1 className="font-display text-3xl">{dict.account.ticket}</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qr} alt="QR Code" className="mx-auto mt-6 h-56 w-56 rounded-xl bg-white p-2" />
      <p className="mt-4 font-mono text-xl">{ticket.code}</p>
      <p className="mt-2 text-sm text-cx-gold">
        {ticket.status === "REFUND_REQUESTED"
          ? dict.account.refundPending
          : ticket.status === "REFUNDED"
            ? dict.account.refunded
            : ticket.status}
      </p>
      {refund === "1" ? <p className="mt-2 text-sm text-emerald-400">{dict.account.refundRequested}</p> : null}
      {refund && refund !== "1" ? <p className="mt-2 text-sm text-cx-red">{dict.account.refundError}</p> : null}
      <p className="mt-2">{ticket.session.movie.title}</p>
      <p className="text-sm text-cx-muted">
        {ticket.session.cinema.name} · {ticket.session.room.name}
        <br />
        {ticket.session.startsAt.toLocaleString("pt-PT")}
        <br />
        {dict.checkout.seats} {ticket.items.map((i) => `${i.seat.row}${i.seat.number}`).join(", ")}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <a href={qr} download={`${ticket.code}.png`} className="rounded-full bg-cx-red px-4 py-2 text-sm">
          {dict.account.downloadTicket}
        </a>
        <Link href={`/api/tickets/${ticket.code}/ics`} className="rounded-full border border-white/20 px-4 py-2 text-sm">
          {dict.account.calendar}
        </Link>
      </div>
      {canRefund ? (
        <form action={requestRefundAction} className="mt-6">
          <input type="hidden" name="ticketId" value={ticket.id} />
          <button className="text-sm text-cx-gold underline">{dict.account.refund}</button>
        </form>
      ) : null}
    </div>
  );
}
