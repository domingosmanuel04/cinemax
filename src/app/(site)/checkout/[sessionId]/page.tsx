import { notFound } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { CheckoutWizard } from "@/features/checkout/CheckoutWizard";
import { getSetting } from "@/server/services/settings";
import { cookies } from "next/headers";
import { getDictionary } from "@/shared/lib/i18n";

export default async function CheckoutPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { movie: true, cinema: true, room: { include: { seats: true } } },
  });
  if (!session) notFound();
  const occupied = await prisma.ticketItem.findMany({
    where: { ticket: { sessionId, status: { in: ["PAID", "PENDING"] } } },
    select: { seatId: true },
  });
  const held = await prisma.seatHold.findMany({
    where: { sessionId, status: "HOLD", expiresAt: { gt: new Date() } },
    select: { seatId: true },
  });
  const products = await prisma.product.findMany({ where: { status: "ACTIVE" }, include: { category: true } });
  const fee = Number((await getSetting("bookingFee")) || 250);
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";

  return (
    <CheckoutWizard
      session={{
        id: session.id,
        price: session.price,
        format: session.format,
        startsAt: session.startsAt.toISOString(),
        movie: { title: session.movie.title, posterUrl: session.movie.posterUrl },
        cinema: { name: session.cinema.name },
        room: { name: session.room.name },
      }}
      seats={session.room.seats}
      occupied={[...occupied.map((o) => o.seatId), ...held.map((h) => h.seatId)]}
      products={products}
      fee={fee}
      dict={getDictionary(locale)}
    />
  );
}
