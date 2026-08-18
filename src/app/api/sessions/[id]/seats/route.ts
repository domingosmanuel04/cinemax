import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const occupied = await prisma.ticketItem.findMany({
    where: { ticket: { sessionId: id, status: { in: ["PAID", "PENDING"] } } },
    select: { seatId: true },
  });
  const held = await prisma.seatHold.findMany({
    where: { sessionId: id, status: "HOLD", expiresAt: { gt: new Date() } },
    select: { seatId: true },
  });
  return NextResponse.json({ occupied: [...occupied.map((o) => o.seatId), ...held.map((h) => h.seatId)] });
}
