import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_TTL_SEC,
  REFRESH_TOKEN_TTL_SEC,
  authCookies,
  signToken,
} from "@/lib/auth";
import { getUserByEmail } from "@/lib/db";
import { apiError } from "@/lib/http";
import { loginSchema } from "@/lib/validators";
import type { LoginResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "INVALID_INPUT", "Provide a valid email and password");
  }

  const user = getUserByEmail(parsed.data.email);
  if (!user || user.password !== parsed.data.password) {
    // One message for both cases: do not reveal which field is wrong.
    return apiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }

  const payload = { sub: user.id, role: user.role };
  const accessToken = await signToken(payload, ACCESS_TOKEN_TTL_SEC);
  const refreshToken = await signToken(payload, REFRESH_TOKEN_TTL_SEC);

  const store = await cookies();
  for (const c of authCookies(accessToken, refreshToken)) {
    store.set(c.name, c.value, c.options);
  }

  // Spec-exact body (informational only — the client never stores tokens;
  // the httpOnly cookies above are the real session).
  const response: LoginResponse = {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_TTL_SEC,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
  return NextResponse.json(response);
}
