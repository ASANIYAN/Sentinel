import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_TTL_SEC,
  REFRESH_COOKIE,
  refreshedCookies,
  signToken,
  verifyToken,
} from "@/lib/auth";
import { apiError } from "@/lib/http";

// AD-5: the refresh token does not rotate, so concurrent refreshes
// (including multi-tab) stay idempotent.
export async function POST() {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  const payload = refreshToken ? await verifyToken(refreshToken) : null;
  if (!payload) {
    return apiError(401, "INVALID_REFRESH", "Session has expired");
  }

  const accessToken = await signToken(payload, ACCESS_TOKEN_TTL_SEC);
  for (const c of refreshedCookies(accessToken)) {
    store.set(c.name, c.value, c.options);
  }
  return NextResponse.json({ expiresIn: ACCESS_TOKEN_TTL_SEC });
}
