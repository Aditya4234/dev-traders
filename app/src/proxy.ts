import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

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

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get("riya_session")?.value;
  let decoded: { id: string; role?: string } | null = null;
  if (tokenCookie) {
    try {
      decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET!) as { id: string; role?: string };
    } catch {
      // invalid token
    }
  }

  if (decoded) {
    return NextResponse.next();
  }

  const isWholesellerPath = WHOLESELLER_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"));
  const loginUrl = new URL(isWholesellerPath ? "/wholesale-login" : "/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
