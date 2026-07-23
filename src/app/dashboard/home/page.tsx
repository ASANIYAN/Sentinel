import { FxSummaryCard } from "@/components/home/fx-summary-card";
import { TransactionListCard } from "@/components/home/transaction-list-card";
import { CardsColumn } from "@/components/home/cards-column";

// Final 2fr/1fr grid + responsive stacking lands in S-304.
export default function HomePage() {
  return (
    <div className="grid grid-cols-[2fr_1fr] gap-5">
      <div className="flex max-w-xl flex-col gap-5">
        <FxSummaryCard />
        <TransactionListCard title="FX transactions" />
      </div>
      <CardsColumn />
    </div>
  );
}
