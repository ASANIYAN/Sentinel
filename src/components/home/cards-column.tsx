import { VisaCard } from "@/components/home/visa-card";
import { AddCardSlot } from "@/components/home/add-card-slot";
import { CardTransactionsCard } from "@/components/home/card-transactions-card";
import { FlowBars } from "@/components/home/flow-bars";

export function CardsColumn() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-semibold text-text-primary">Cards</h2>

      <div className="flex gap-3">
        <VisaCard
          cardLast4="7093"
          validThru="08/27"
          balance="$3,048.00"
          name="Emmanuel Israel"
        />
        <AddCardSlot />
      </div>

      <CardTransactionsCard />

      <FlowBars total="+$3,048.00" moneyIn="$4,046.00" moneyOut="$1,046.00" />
    </div>
  );
}
