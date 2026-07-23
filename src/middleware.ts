import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, verifyToken } from "@/lib/auth";

// AD-3: a dumb gate. Verify the access cookie; redirect to /login when it
// is missing, invalid, or expired. No refresh logic here — API routes
// verify auth independently in-handler, because the middleware only
// protects the routes it matches.
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (payload) return NextResponse.next();

  // The matcher never includes /login, so this cannot loop.
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "from",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/dashboard/:path*",
};
