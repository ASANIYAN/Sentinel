import { memo } from "react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, ShieldAlert } from "lucide-react";
import { StatusPill } from "@/components/transactions/status-pill";
import { formatDateTime, formatSignedAmount } from "@/lib/format";
import type { Channel, Transaction, TransactionType } from "@/types/transaction";

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
  txn: Transaction;
  onClick: () => void;
};

// Memoized so an SSE update to one row (a new upsert/updateRow in the
// store) does not re-render every other row (AD-7).
export const TransactionRow = memo(function TransactionRow({ txn, onClick }: Props) {
  const Icon = ICON_BY_TYPE[txn.type];

  return (
    <tr
      onClick={onClick}
      className="cursor-pointer hover:bg-canvas"
    >
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
});
