import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { code },
    include: { session: { include: { movie: true, cinema: true } } },
  });
  if (!ticket) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const start = ticket.session.startsAt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const end = ticket.session.endsAt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CINEMAX//PT
BEGIN:VEVENT
UID:${ticket.code}@cinemax
DTSTAMP:${start}
DTSTART:${start}
DTEND:${end}
SUMMARY:CINEMAX — ${ticket.session.movie.title}
LOCATION:${ticket.session.cinema.name}
DESCRIPTION:Bilhete ${ticket.code}
END:VEVENT
END:VCALENDAR`;
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${ticket.code}.ics"`,
    },
  });
}
