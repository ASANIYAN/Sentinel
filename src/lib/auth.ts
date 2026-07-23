import { jwtVerify, SignJWT } from "jose";
import type { Role } from "@/types/transaction";

// Edge-compatible (middleware runs on the Edge runtime): jose only, no
// Node crypto.

export const ACCESS_TOKEN_TTL_SEC = 15 * 60; // ~15 min
export const REFRESH_TOKEN_TTL_SEC = 7 * 24 * 60 * 60; // ~7 days

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";
export const EXPIRY_COOKIE = "token_expiry";

export type TokenPayload = {
  sub: string;
  role: Role;
};

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(value);
}

export async function signToken(
  payload: TokenPayload,
  ttlSec: number,
): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSec)
    .sign(secret());
}

/** Returns the payload, or null for an invalid/expired/tampered token. */
export async function verifyToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), {
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string") return null;
    if (payload.role !== "admin" && payload.role !== "analyst") return null;
    return { sub: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export type CookieDef = {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    sameSite: "lax";
    secure: boolean;
    path: string;
    maxAge: number;
  };
};

const SECURE = process.env.NODE_ENV === "production";

/**
 * The three auth cookies (AD-1). `token_expiry` is deliberately not
 * httpOnly: the client reads it to schedule a proactive refresh. It holds
 * a timestamp, not a secret.
 */
export function authCookies(
  accessToken: string,
  refreshToken: string,
): CookieDef[] {
  const expiresAtMs = Date.now() + ACCESS_TOKEN_TTL_SEC * 1000;
  return [
    {
      name: ACCESS_COOKIE,
      value: accessToken,
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: SECURE,
        path: "/",
        maxAge: ACCESS_TOKEN_TTL_SEC,
      },
    },
    {
      name: REFRESH_COOKIE,
      value: refreshToken,
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: SECURE,
        path: "/api/auth",
        maxAge: REFRESH_TOKEN_TTL_SEC,
      },
    },
    {
      name: EXPIRY_COOKIE,
      value: String(expiresAtMs),
      options: {
        httpOnly: false,
        sameSite: "lax",
        secure: SECURE,
        path: "/",
        maxAge: ACCESS_TOKEN_TTL_SEC,
      },
    },
  ];
}

/** Refresh only re-issues the access token and its readable expiry. */
export function refreshedCookies(accessToken: string): CookieDef[] {
  const [access, , expiry] = authCookies(accessToken, "");
  return [access, expiry];
}

export function clearedAuthCookies(): CookieDef[] {
  return authCookies("", "").map((c) => ({
    ...c,
    value: "",
    options: { ...c.options, maxAge: 0 },
  }));
}
