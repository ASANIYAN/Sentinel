import Image from "next/image";

export type RowKind = "debit" | "credit" | "wallet";

export type RowData = {
  id: string;
  title: string;
  timestamp: string;
  amount: string; // pre-formatted display string (Task 1 uses mock data)
  kind: RowKind;
};

// Exported Figma badges (already colored per semantic use — no currentColor
// needed): export.svg = accent, frame.svg = positive, repeat.svg = neutral.
const ICON_BY_KIND = {
  debit: "/export.svg",
  credit: "/frame.svg",
  wallet: "/repeat.svg",
} as const;

// DESIGN.md §3 row icon treatment: soft tint per semantic color, neutral
// wallet-to-wallet gets a bordered canvas circle instead.
const CIRCLE_CLASS_BY_KIND = {
  debit: "bg-accent-soft",
  credit: "bg-positive-soft",
  wallet: "bg-canvas border border-border",
} as const;

export function TransactionListRow({ title, timestamp, amount, kind }: RowData) {
  return (
    <div className="flex items-center gap-3 py-4">
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${CIRCLE_CLASS_BY_KIND[kind]}`}
      >
        <Image src={ICON_BY_KIND[kind]} alt="" width={18} height={18} />
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
