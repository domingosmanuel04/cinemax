import { NextRequest, NextResponse } from "next/server";
import { getSession, canAccessAdmin } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !canAccessAdmin(session.role)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const type = req.nextUrl.searchParams.get("type") || "vendas";
  let csv = "col1,col2,col3\n";
  if (type === "vendas") {
    const orders = await prisma.order.findMany({ include: { user: true }, take: 500 });
    csv = "code,user,total,status,date\n" + orders.map((o) => `${o.code},${o.user.email},${o.total},${o.status},${o.createdAt.toISOString()}`).join("\n");
  } else if (type === "bilhetes") {
    const tickets = await prisma.ticket.findMany({ include: { user: true, session: { include: { movie: true } } }, take: 500 });
    csv = "code,user,movie,status\n" + tickets.map((t) => `${t.code},${t.user.email},${t.session.movie.title},${t.status}`).join("\n");
  } else {
    const sessions = await prisma.session.findMany({ include: { room: true, tickets: true, movie: true }, take: 200 });
    csv =
      "movie,starts,capacity,sold,occupancy\n" +
      sessions
        .map((s) => `${s.movie.title},${s.startsAt.toISOString()},${s.room.capacity},${s.tickets.length},${(s.tickets.length / s.room.capacity).toFixed(2)}`)
        .join("\n");
  }
  const format = req.nextUrl.searchParams.get("format");
  const excel = format === "xlsx" || format === "xls";
  return new NextResponse(csv, {
    headers: {
      "Content-Type": excel ? "application/vnd.ms-excel; charset=utf-8" : "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=cinemax-${type}.${excel ? "xls" : "csv"}`,
    },
  });
}
