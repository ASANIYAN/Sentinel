"use client";
// Client component (AD-7): seeds the Zustand store from server props and
// subscribes to the SSE stream. Converted from a server component in
// S-502, once the store existed to justify it.

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/transactions/empty-state";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { LiveIndicator } from "@/components/transactions/live-indicator";
import { DetailSheet } from "@/components/transactions/detail-sheet";
import { useTransactionsStore } from "@/hooks/use-transactions-store";
import { useTransactionStream } from "@/hooks/use-transaction-stream";
import { useTableParams } from "@/hooks/use-table-params";
import type { Transaction } from "@/types/transaction";

type Props = {
  data: Transaction[];
};

export function TransactionsTable({ data }: Props) {
  const rows = useTransactionsStore((s) => s.rows);
  const seedFromServer = useTransactionsStore((s) => s.seedFromServer);
  const { status, sort, order, from, to } = useTableParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Re-seeds on every navigation: `data` is a new array reference each
  // time the server page re-renders for new searchParams.
  useEffect(() => {
    seedFromServer(data);
  }, [data, seedFromServer]);

  const { connected, newCount, dismissNewCount } = useTransactionStream({
    status,
    from,
    to,
    sort: sort as "createdAt" | "amount" | "riskScore",
    order: order as "asc" | "desc",
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <LiveIndicator connected={connected} />
        {newCount > 0 && (
          <button
            type="button"
            onClick={dismissNewCount}
            className="rounded-(--radius-pill) bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"
          >
            {newCount} new
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto rounded-(--radius-card) border border-border bg-surface shadow-(--shadow-card)">
          <table className="w-full min-w-215 border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-secondary">
                <th className="px-4 py-3 font-medium">Transaction</th>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Card</th>
                <th className="px-4 py-3 font-medium">Risk</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((txn) => (
                <TransactionRow
                  key={txn.id}
                  txn={txn}
                  onClick={() => setSelectedId(txn.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DetailSheet
        transaction={rows.find((r) => r.id === selectedId) ?? null}
        open={selectedId !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </div>
  );
}
