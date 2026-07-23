import { beforeEach, describe, expect, it } from "vitest";
import { addNote, getTransactions, resetDb, updateTransaction } from "./db";
import { transactionsQuerySchema } from "./validators";

const query = (overrides: Record<string, unknown> = {}) =>
  transactionsQuerySchema.parse(overrides);

beforeEach(() => resetDb());

describe("getTransactions pagination", () => {
  it("slices pages without overlap and reports the full total", () => {
    const page1 = getTransactions(query({ pageSize: 10 }));
    const page2 = getTransactions(query({ page: 2, pageSize: 10 }));

    expect(page1.total).toBe(80);
    expect(page1.data).toHaveLength(10);
    expect(page2.data).toHaveLength(10);
    const ids1 = new Set(page1.data.map((t) => t.id));
    expect(page2.data.every((t) => !ids1.has(t.id))).toBe(true);
  });

  it("returns the remainder on the last page", () => {
    const last = getTransactions(query({ page: 3, pageSize: 35 }));
    expect(last.data).toHaveLength(10); // 80 - 2*35
  });
});

describe("getTransactions sorting", () => {
  it("sorts by amount in both directions", () => {
    const asc = getTransactions(query({ sort: "amount", order: "asc" }));
    const desc = getTransactions(query({ sort: "amount", order: "desc" }));

    const amountsAsc = asc.data.map((t) => t.amount);
    expect(amountsAsc).toEqual([...amountsAsc].sort((a, b) => a - b));
    expect(desc.data[0].amount).toBeGreaterThanOrEqual(
      desc.data[1].amount,
    );
  });

  it("defaults to newest first", () => {
    const { data } = getTransactions(query());
    expect(data[0].createdAt >= data[1].createdAt).toBe(true);
  });
});

describe("getTransactions filtering", () => {
  it("filters by status", () => {
    const { data, total } = getTransactions(query({ status: "flagged" }));
    expect(total).toBeGreaterThan(0);
    expect(data.every((t) => t.status === "flagged")).toBe(true);
  });

  it("filters by date range using ISO comparison", () => {
    const from = "2026-06-01T00:00:00.000Z";
    const to = "2026-07-01T00:00:00.000Z";
    const { data, total } = getTransactions(
      query({ from, to, pageSize: 100 }),
    );
    expect(total).toBeGreaterThan(0);
    expect(
      data.every((t) => t.createdAt >= from && t.createdAt <= to),
    ).toBe(true);
  });
});

describe("mutations", () => {
  it("flags a transaction and sets both status and reason", () => {
    const target = getTransactions(query()).data[0];
    const updated = updateTransaction(target.id, {
      flagged: true,
      flagReason: "Manual review",
    });
    expect(updated?.flagged).toBe(true);
    expect(updated?.status).toBe("flagged");
    expect(updated?.flagReason).toBe("Manual review");
  });

  it("appends a note with author metadata", () => {
    const target = getTransactions(query()).data[0];
    const updated = addNote(target.id, {
      authorId: "usr_analyst",
      authorRole: "analyst",
      body: "Checked with merchant",
    });
    expect(updated?.notes).toHaveLength(1);
    expect(updated?.notes[0].authorRole).toBe("analyst");
  });
});

describe("seed", () => {
  it("places the XSS demo merchant on page 1 unfiltered", () => {
    const { data } = getTransactions(query());
    expect(data[2].merchant).toBe('<script>alert("xss")</script>');
  });
});
