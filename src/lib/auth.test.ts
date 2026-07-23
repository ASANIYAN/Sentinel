import { beforeAll, describe, expect, it } from "vitest";
import {
  ACCESS_TOKEN_TTL_SEC,
  authCookies,
  clearedAuthCookies,
  signToken,
  verifyToken,
} from "./auth";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret";
});

describe("JWT sign and verify", () => {
  it("round-trips sub and role", async () => {
    const token = await signToken(
      { sub: "usr_admin", role: "admin" },
      ACCESS_TOKEN_TTL_SEC,
    );
    const payload = await verifyToken(token);
    expect(payload).toEqual({ sub: "usr_admin", role: "admin" });
  });

  it("rejects an expired token", async () => {
    const token = await signToken({ sub: "usr_admin", role: "admin" }, -60);
    expect(await verifyToken(token)).toBeNull();
  });

  it("rejects a tampered token", async () => {
    const token = await signToken(
      { sub: "usr_admin", role: "admin" },
      ACCESS_TOKEN_TTL_SEC,
    );
    expect(await verifyToken(token.slice(0, -2) + "xx")).toBeNull();
  });
});

describe("auth cookies", () => {
  it("sets the AD-1 flags on each cookie", () => {
    const [access, refresh, expiry] = authCookies("a-token", "r-token");

    expect(access.name).toBe("access_token");
    expect(access.options).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_TTL_SEC,
    });

    expect(refresh.options).toMatchObject({
      httpOnly: true,
      path: "/api/auth",
    });

    expect(expiry.options.httpOnly).toBe(false);
    expect(Number(expiry.value)).toBeGreaterThan(Date.now());
  });

  it("clears every cookie with maxAge 0 and an empty value", () => {
    for (const c of clearedAuthCookies()) {
      expect(c.value).toBe("");
      expect(c.options.maxAge).toBe(0);
    }
  });
});
