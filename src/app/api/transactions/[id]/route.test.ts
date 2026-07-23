import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_TTL_SEC, signToken } from "@/lib/auth";
import { getTransactions, resetDb } from "@/lib/db";
import { transactionsQuerySchema } from "@/lib/validators";

let cookieValue: string | undefined;

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "access_token" && cookieValue ? { value: cookieValue } : undefined,
  }),
}));

async function patch(id: string, body: unknown) {
  const { PATCH } = await import("./route");
  const request = new Request(`http://localhost/api/transactions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return PATCH(request as unknown as NextRequest, { params: Promise.resolve({ id }) });
}

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret";
});

beforeEach(() => {
  resetDb();
  cookieValue = undefined;
});

describe("PATCH /api/transactions/[id] RBAC", () => {
  it("rejects an analyst's flag attempt with 403", async () => {
    cookieValue = await signToken(
      { sub: "usr_analyst", role: "analyst" },
      ACCESS_TOKEN_TTL_SEC,
    );
    const { id } = getTransactions(transactionsQuerySchema.parse({})).data[0];

    const res = await patch(id, { flagged: true, flagReason: "Suspicious" });

    expect(res.status).toBe(403);
  });

  it("persists an admin's flag", async () => {
    cookieValue = await signToken(
      { sub: "usr_admin", role: "admin" },
      ACCESS_TOKEN_TTL_SEC,
    );
    const { id } = getTransactions(transactionsQuerySchema.parse({})).data[0];

    const res = await patch(id, { flagged: true, flagReason: "Suspicious" });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.flagged).toBe(true);
    expect(body.status).toBe("flagged");
  });

  it("lets an analyst add a note", async () => {
    cookieValue = await signToken(
      { sub: "usr_analyst", role: "analyst" },
      ACCESS_TOKEN_TTL_SEC,
    );
    const { id } = getTransactions(transactionsQuerySchema.parse({})).data[0];

    const res = await patch(id, { note: "Checked with merchant" });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.notes).toHaveLength(1);
    expect(body.notes[0].authorRole).toBe("analyst");
  });
});
