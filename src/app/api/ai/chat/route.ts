import { NextRequest, NextResponse } from "next/server";
import { askCinemaxAi } from "@/server/services/ai";
import { getSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

const buckets = new Map<string, { n: number; t: number }>();

function rateLimit(id: string) {
  const now = Date.now();
  const b = buckets.get(id) || { n: 0, t: now };
  if (now - b.t > 60_000) {
    buckets.set(id, { n: 1, t: now });
    return true;
  }
  if (b.n > 30) return false;
  b.n += 1;
  buckets.set(id, b);
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!rateLimit(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const session = await getSession();
  const body = await req.json().catch(() => ({}));
  const question = String(body.question || "").slice(0, 800);
  if (!question) return NextResponse.json({ error: "empty" }, { status: 400 });
  let scope: "ADMIN" | "PUBLIC" = body.scope === "ADMIN" ? "ADMIN" : "PUBLIC";
  if (scope === "ADMIN" && !session) scope = "PUBLIC";
  const result = await askCinemaxAi({ question, scope, userId: session?.id });
  if (session) {
    const conv = await prisma.aiConversation.create({
      data: {
        userId: session.id,
        scope,
        title: question.slice(0, 60),
        messages: {
          create: [
            { role: "user", content: question },
            { role: "assistant", content: result.answer },
          ],
        },
      },
    });
    void conv;
  }
  return NextResponse.json(result);
}
