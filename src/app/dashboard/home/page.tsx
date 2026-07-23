import { FxSummaryCard } from "@/components/home/fx-summary-card";

// Full grid assembly (transactions list, cards column) lands in S-304.
export default function HomePage() {
  return (
    <div className="max-w-xl">
      <FxSummaryCard />
    </div>
  );
}
