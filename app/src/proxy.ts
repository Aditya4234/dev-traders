import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const WHOLESELLER_PATHS = [
  "/dashboard/wholeseller",
  "/dashboard/admin",
  "/dashboard/invoices",
  "/dashboard/bulk-order",
  "/dashboard/price-list",
  "/dashboard/credit-ledger",
  "/dashboard/outstanding",
  "/dashboard/wallet",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("riya_session")?.value;
  const role = request.cookies.get("riya_role")?.value;

  if (token) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    const isWholesellerPath = WHOLESELLER_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"));

    if (isWholesellerPath || role === "admin" || role === "dealer") {
      const loginUrl = new URL("/wholesale-login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
