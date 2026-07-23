// Server component: no chip row here (unlike the FX transactions card), so
// no client state is needed.

import { TransactionListRow, type RowData } from "@/components/home/transaction-list-row";

// Static mock rows (CLAUDE.md: Task 1 mock data is acceptable).
const ROWS: RowData[] = [
  {
    id: "c1",
    title: "Transfer to Ruth",
    timestamp: "Fri, Apr 18, 2025 • 7:32PM",
    amount: "-$7.64",
    kind: "debit",
  },
  {
    id: "c2",
    title: "Wallet to wallet",
    timestamp: "Sat, Mar 2, 2025 • 8:12AM",
    amount: "-$14",
    kind: "wallet",
  },
  {
    id: "c3",
    title: "Transfer from Tochukwu",
    timestamp: "Tue, Feb 7, 2025 • 11:50PM",
    amount: "$850.89",
    kind: "credit",
  },
];

export function CardTransactionsCard() {
  return (
    <section className="flex flex-col gap-4 rounded-[--radius-card] border border-border bg-surface p-6 shadow-[--shadow-card]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">
          Card transactions
        </h2>
        <button
          type="button"
          className="rounded-[--radius-pill] border border-border bg-surface px-3.5 py-1.5 text-sm text-text-secondary"
        >
          See all
        </button>
      </div>

      <div className="divide-y divide-border">
        {ROWS.map((row) => (
          <TransactionListRow key={row.id} {...row} />
        ))}
      </div>
    </section>
  );
}
