import { FxSummaryCard } from "@/components/home/fx-summary-card";
import { TransactionListCard } from "@/components/home/transaction-list-card";
import { CardsColumn } from "@/components/home/cards-column";

// DESIGN.md §5: 2fr/1fr grid, stacking to one column below `lg`.
export default function HomePage() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
      <div className="flex min-w-0 flex-col gap-5">
        <FxSummaryCard />
        <TransactionListCard title="FX transactions" />
      </div>
      <CardsColumn />
    </div>
  );
}
