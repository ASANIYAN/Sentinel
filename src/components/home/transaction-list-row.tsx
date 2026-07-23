import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";

export type RowKind = "debit" | "credit" | "wallet";

export type RowData = {
  id: string;
  title: string;
  timestamp: string;
  amount: string; // pre-formatted display string (Task 1 uses mock data)
  kind: RowKind;
};

const ICON_BY_KIND = {
  debit: ArrowUpRight,
  credit: ArrowDownLeft,
  wallet: ArrowLeftRight,
} as const;

// DESIGN.md §3 row icon treatment: soft tint per semantic color, neutral
// wallet-to-wallet gets a bordered canvas circle instead.
const CIRCLE_CLASS_BY_KIND = {
  debit: "bg-accent-soft text-accent",
  credit: "bg-positive-soft text-positive",
  wallet: "bg-canvas text-text-secondary border border-border",
} as const;

export function TransactionListRow({ title, timestamp, amount, kind }: RowData) {
  const Icon = ICON_BY_KIND[kind];

  return (
    <div className="flex items-center gap-3 py-4">
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${CIRCLE_CLASS_BY_KIND[kind]}`}
      >
        <Icon size={18} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {title}
        </p>
        <p className="text-xs text-text-secondary">{timestamp}</p>
      </div>
      {/* Debits are near-black, never red (DESIGN.md §1) — only credits get
          the green treatment. */}
      <span
        className={`text-sm tabular-nums ${
          kind === "credit" ? "text-positive" : "text-text-primary"
        }`}
      >
        {amount}
      </span>
    </div>
  );
}
