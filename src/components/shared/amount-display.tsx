// The hero-figure pattern (DESIGN.md §2): bold integer, lighter decimal.
// Reused by the FX summary card, FlowBars totals, and the DetailSheet.

type Props = {
  value: number;
  className?: string;
};

export function AmountDisplay({ value, className }: Props) {
  const [integer, decimal] = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
    .split(".");

  return (
    <span
      className={`font-display tabular-nums text-text-primary ${className ?? ""}`}
    >
      <span className="text-[40px] font-bold leading-none">{integer}</span>
      <span className="text-2xl font-medium text-text-secondary">
        .{decimal}
      </span>
    </span>
  );
}
