import { describe, expect, it } from "vitest";
import {
  loginSchema,
  parseTransactionsQuery,
  patchTransactionSchema,
  transactionsQuerySchema,
} from "./validators";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const r = loginSchema.safeParse({
      email: "admin@sohcahtoa.test",
      password: "password123",
    });
    expect(r.success).toBe(true);
  });

  it("rejects a malformed email and an empty password", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(
      false,
    );
    expect(
      loginSchema.safeParse({ email: "a@b.test", password: "" }).success,
    ).toBe(false);
  });
});

describe("transactionsQuerySchema", () => {
  it("applies defaults to an empty query", () => {
    const r = transactionsQuerySchema.parse({});
    expect(r).toMatchObject({
      page: 1,
      pageSize: 10,
      sort: "createdAt",
      order: "desc",
    });
  });

  it("coerces numeric strings from search params", () => {
    const r = parseTransactionsQuery(
      new URLSearchParams("page=2&pageSize=25&order=asc"),
    );
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.pageSize).toBe(25);
      expect(r.data.order).toBe("asc");
    }
  });

  it("rejects page=0, an invalid status, and malformed dates", () => {
    expect(transactionsQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(
      transactionsQuerySchema.safeParse({ status: "unknown" }).success,
    ).toBe(false);
    expect(
      transactionsQuerySchema.safeParse({ from: "not-a-date" }).success,
    ).toBe(false);
  });

  it("rejects a range where from is after to", () => {
    const r = transactionsQuerySchema.safeParse({
      from: "2026-02-01T00:00:00Z",
      to: "2026-01-01T00:00:00Z",
    });
    expect(r.success).toBe(false);
  });
});

describe("patchTransactionSchema", () => {
  it("accepts a flag with a reason and accepts a note", () => {
    expect(
      patchTransactionSchema.safeParse({
        flagged: true,
        flagReason: "High risk score",
      }).success,
    ).toBe(true);
    expect(patchTransactionSchema.safeParse({ note: "Reviewed" }).success).toBe(
      true,
    );
  });

  it("rejects an empty body, a flag without a reason, and unknown keys", () => {
    expect(patchTransactionSchema.safeParse({}).success).toBe(false);
    expect(patchTransactionSchema.safeParse({ flagged: true }).success).toBe(
      false,
    );
    expect(
      patchTransactionSchema.safeParse({ note: "x", admin: true }).success,
    ).toBe(false);
  });
});
