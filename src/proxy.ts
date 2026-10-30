import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session-token";

/**
 * Proxy (called "middleware" in older Next.js versions).
 * It runs before the page and only does a quick check to redirect visitors.
 * The real permission checks happen in the Data Access Layer (src/lib/dal.ts),
 * as the Next.js authentication guide recommends.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminPath && session.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
}

// Only run on pages that need a login.
export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/checkout/:path*"],
};
