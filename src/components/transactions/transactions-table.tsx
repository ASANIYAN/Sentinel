import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, ShieldAlert } from "lucide-react";
import { StatusPill } from "@/components/transactions/status-pill";
import { EmptyState } from "@/components/transactions/empty-state";
import { formatDateTime, formatSignedAmount } from "@/lib/format";
import type { Channel, Transaction, TransactionType } from "@/types/transaction";

// EPIC 5 (S-502) converts this to a client component to seed the Zustand
// row store from these props. No client state is needed yet, so it stays
// a server component (CLAUDE.md hard rule: no "use client" without a
// stated reason).

const ICON_BY_TYPE: Record<TransactionType, typeof ArrowUpRight> = {
  debit: ArrowUpRight,
  credit: ArrowDownLeft,
  transfer: ArrowLeftRight,
};

const CIRCLE_CLASS_BY_TYPE: Record<TransactionType, string> = {
  debit: "bg-accent-soft text-accent",
  credit: "bg-positive-soft text-positive",
  transfer: "bg-canvas text-text-secondary border border-border",
};

const CHANNEL_LABEL: Record<Channel, string> = {
  card: "Card",
  bank_transfer: "Bank transfer",
  ussd: "USSD",
  pos: "POS",
};

const HIGH_RISK_THRESHOLD = 70;

type Props = {
  data: Transaction[];
};

export function TransactionsTable({ data }: Props) {
  if (data.length === 0) return <EmptyState />;

  return (
    <div className="overflow-x-auto rounded-[--radius-card] border border-border bg-surface shadow-[--shadow-card]">
      <table className="w-full min-w-[860px] border-collapse text-sm">
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
          {data.map((txn) => {
            const Icon = ICON_BY_TYPE[txn.type];
            return (
              <tr key={txn.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full ${CIRCLE_CLASS_BY_TYPE[txn.type]}`}
                    >
                      <Icon size={16} strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {txn.merchant}
                      </p>
                      <p className="font-mono text-xs text-text-secondary">
                        {txn.reference}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {CHANNEL_LABEL[txn.channel]}
                </td>
                <td className="px-4 py-3 font-mono text-text-secondary">
                  •••• {txn.cardLast4}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 tabular-nums text-text-primary">
                    {txn.riskScore}
                    {txn.riskScore >= HIGH_RISK_THRESHOLD && (
                      <ShieldAlert size={14} className="text-accent" />
                    )}
                  </span>
                </td>
                <td
                  className={`px-4 py-3 tabular-nums ${
                    txn.type === "credit" ? "text-positive" : "text-text-primary"
                  }`}
                >
                  {formatSignedAmount(txn.amount, txn.currency, txn.type)}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={txn.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-text-secondary">
                  {formatDateTime(txn.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
