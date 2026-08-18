import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  const body = await req.json();
  const movieId = String(body.movieId || "");
  const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
  const text = String(body.body || "").slice(0, 1000);
  if (!movieId || text.length < 8) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const spamScore = /(http|viagra|crypto|xxx)/i.test(text) ? 0.9 : 0.05;
  await prisma.review.create({
    data: {
      userId: session.id,
      movieId,
      rating,
      body: text,
      status: spamScore > 0.7 ? "PENDING" : "PUBLISHED",
      spamScore,
    },
  });
  const agg = await prisma.review.aggregate({ where: { movieId, status: "PUBLISHED" }, _avg: { rating: true }, _count: true });
  await prisma.movie.update({
    where: { id: movieId },
    data: { avgRating: agg._avg.rating || 0, voteCount: agg._count },
  });
  return NextResponse.json({ ok: true, moderation: spamScore > 0.7 ? "held" : "published" });
}
