import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const res = NextResponse.json({ ok: true });
  if (body.locale && ["pt", "en", "fr"].includes(body.locale)) {
    res.cookies.set("cinemax-locale", body.locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  if (body.currency && ["AOA", "USD", "EUR"].includes(body.currency)) {
    res.cookies.set("cinemax-currency", body.currency, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  if (body.profileId) {
    res.cookies.set("cinemax-profile", String(body.profileId), { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  if (typeof body.kids === "boolean") {
    res.cookies.set("cinemax-kids", body.kids ? "1" : "0", { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return res;
}
