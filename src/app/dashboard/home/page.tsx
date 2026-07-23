import { FxSummaryCard } from "@/components/home/fx-summary-card";
import { TransactionListCard } from "@/components/home/transaction-list-card";

// Full grid assembly (cards column) lands in S-304.
export default function HomePage() {
  return (
    <div className="flex max-w-xl flex-col gap-5">
      <FxSummaryCard />
      <TransactionListCard title="FX transactions" />
    </div>
  );
}
