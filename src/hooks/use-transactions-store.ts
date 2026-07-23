"use client";
// Zustand store (AD-7): keyed by id so dedupe is free. Sort/filter policy
// lives in the caller (the SSE hook); this store just holds rows.

import { create } from "zustand";
import type { Transaction } from "@/types/transaction";

type SortKey = "createdAt" | "amount" | "riskScore";
type SortOrder = "asc" | "desc";

type TransactionsStore = {
  rows: Transaction[];
  seedFromServer: (rows: Transaction[]) => void;
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

  seedFromServer: (rows) => set({ rows }),

  upsert: (row, sort, order) =>
    set((state) => {
      const index = state.rows.findIndex((r) => r.id === row.id);
      const rows =
        index >= 0
          ? state.rows.map((r, i) => (i === index ? row : r))
          : sortRows([...state.rows, row], sort, order);
      return { rows };
    }),

  updateRow: (id, patch) =>
    set((state) => ({
      rows: state.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),
}));
