import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "cinemax-dev-secret");
const STAFF = new Set(["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "FINANCE", "MARKETING", "CONTENT_MANAGER"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("cinemax_session")?.value;
  let role = "";
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      role = String(payload.role || "");
    } catch {
      role = "";
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!STAFF.has(role)) {
      const url = req.nextUrl.clone();
      url.pathname = "/entrar";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if ((pathname.startsWith("/conta") || pathname.startsWith("/checkout")) && !role) {
    const url = req.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/conta/:path*", "/checkout/:path*"],
};
