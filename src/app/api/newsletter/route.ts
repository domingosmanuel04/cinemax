import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const email = form?.get("email") || (await req.json().catch(() => ({}))).email;
  if (!email) return NextResponse.json({ error: "email" }, { status: 400 });
  return NextResponse.redirect(new URL("/?newsletter=ok", req.url), 303);
}
