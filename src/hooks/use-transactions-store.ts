"use client";
// Zustand store (AD-7): keyed by id so dedupe is free. Sort/filter policy
// lives in the caller (the SSE hook); this store just holds rows.

import { create } from "zustand";
import type { Transaction } from "@/types/transaction";

type SortKey = "createdAt" | "amount" | "riskScore";
type SortOrder = "asc" | "desc";

type TransactionsStore = {
  rows: Transaction[];
  pageSize: number;
  seedFromServer: (rows: Transaction[], pageSize: number) => void;
  upsert: (row: Transaction, sort: SortKey, order: SortOrder) => void;
  updateRow: (id: string, patch: Partial<Transaction>) => void;
};

function sortRows(rows: Transaction[], sort: SortKey, order: SortOrder) {
  const dir = order === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[sort];
    const bv = b[sort];
    return av < bv ? -dir : av > bv ? dir : 0;
  });
}

export const useTransactionsStore = create<TransactionsStore>((set) => ({
  rows: [],
  pageSize: 10,

  seedFromServer: (rows, pageSize) => set({ rows, pageSize }),

  upsert: (row, sort, order) =>
    set((state) => {
      const index = state.rows.findIndex((r) => r.id === row.id);
      if (index >= 0) {
        return { rows: state.rows.map((r, i) => (i === index ? row : r)) };
      }
      // A genuinely new row: insert in sort order, then cap at the current
      // page size so a live event never grows the view past the page the
      // user asked for (PDF §3: "preserve pagination + filters").
      const rows = sortRows([...state.rows, row], sort, order).slice(
        0,
        state.pageSize,
      );
      return { rows };
    }),

  updateRow: (id, patch) =>
    set((state) => ({
      rows: state.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),
}));
