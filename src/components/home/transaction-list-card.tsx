"use client";
// Client component: the category chip row is local UI state.

import { useState } from "react";
import { FilterChips, type FilterChip } from "@/components/shared/filter-chips";
import { TransactionListRow, type RowData } from "@/components/home/transaction-list-row";

type Category = "all" | "fx" | "pta" | "bta" | "medicals";

const CHIPS: FilterChip<Category>[] = [
  { value: "all", label: "All" },
  { value: "fx", label: "FX" },
  { value: "pta", label: "PTA" },
  { value: "bta", label: "BTA" },
  { value: "medicals", label: "Medicals" },
];

// Static mock rows (CLAUDE.md: Task 1 mock data is acceptable).
const ROWS: (RowData & { category: Exclude<Category, "all"> })[] = [
  {
    id: "1",
    title: "Transfer to Ruth",
    timestamp: "Fri, Apr 18, 2025 • 7:32PM",
    amount: "-$7.64",
    kind: "debit",
    category: "fx",
  },
  {
    id: "2",
    title: "Transfer from Tobi",
    timestamp: "Sat, Mar 2, 2025 • 6:59AM",
    amount: "$3.00",
    kind: "credit",
    category: "pta",
  },
  {
    id: "3",
    title: "Transfer to Esrael",
    timestamp: "Sat, Mar 2, 2025 • 10:08AM",
    amount: "-$200",
    kind: "debit",
    category: "fx",
  },
  {
    id: "4",
    title: "Wallet to wallet",
    timestamp: "Mon, Feb 19, 2025 • 4:27PM",
    amount: "-$10.53",
    kind: "wallet",
    category: "bta",
  },
  {
    id: "5",
    title: "Transfer from Tochukwu",
    timestamp: "Tue, Feb 7, 2025 • 11:50PM",
    amount: "$850.89",
    kind: "credit",
    category: "medicals",
  },
];

type Props = {
  title: string;
};

export function TransactionListCard({ title }: Props) {
  const [category, setCategory] = useState<Category>("all");
  const rows =
    category === "all" ? ROWS : ROWS.filter((r) => r.category === category);

  return (
    <section className="flex flex-col gap-4 rounded-[--radius-card] border border-border bg-surface p-6 shadow-[--shadow-card]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        <button
          type="button"
          className="rounded-[--radius-pill] border border-border bg-surface px-3.5 py-1.5 text-sm text-text-secondary"
        >
          See all
        </button>
      </div>

      <FilterChips chips={CHIPS} value={category} onChange={setCategory} />

      <div className="divide-y divide-border">
        {rows.map((row) => (
          <TransactionListRow key={row.id} {...row} />
        ))}
      </div>
    </section>
  );
}
