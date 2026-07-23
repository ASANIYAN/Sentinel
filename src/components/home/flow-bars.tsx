type FlowRowProps = {
  label: string;
  amount: string;
  percent: number;
  barClassName: string;
  trackClassName: string;
};

function FlowRow({ label, amount, percent, barClassName, trackClassName }: FlowRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="tabular-nums text-text-primary">{amount}</span>
      </div>
      <div className={`h-1.5 w-full overflow-hidden rounded-(--radius-pill) ${trackClassName}`}>
        <div
          className={`h-full rounded-(--radius-pill) ${barClassName}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

type Props = {
  total: string;
  moneyIn: string;
  moneyOut: string;
};

// Static mock fill ratios matching the Figma proportions — Task 1 uses
// mock data (CLAUDE.md).
const MONEY_IN_PERCENT = 92;
const MONEY_OUT_PERCENT = 72;

export function FlowBars({ total, moneyIn, moneyOut }: Props) {
  return (
    <section className="flex flex-col gap-5 rounded-(--radius-card) border border-border bg-surface p-6 shadow-(--shadow-card)">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">
          Card transaction flows
        </h2>
        <span className="font-display text-lg font-bold text-text-primary">
          {total}
        </span>
      </div>

      <FlowRow
        label="Money in"
        amount={moneyIn}
        percent={MONEY_IN_PERCENT}
        barClassName="bg-positive"
        trackClassName="bg-positive-muted"
      />
      <FlowRow
        label="Money out"
        amount={moneyOut}
        percent={MONEY_OUT_PERCENT}
        barClassName="bg-accent"
        trackClassName="bg-border"
      />
    </section>
  );
}
