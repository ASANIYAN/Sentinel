"use client";
// Client component: chip selection and the dropdown are local UI state —
// this reproduces the two Figma states (FX bought/USD, Others/Medicals).

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterChips, type FilterChip } from "@/components/shared/filter-chips";
import { AmountDisplay } from "@/components/shared/amount-display";

type Chip = "fx-bought" | "fx-sold" | "others";

const CHIPS: FilterChip<Chip>[] = [
  { value: "fx-bought", label: "FX bought" },
  { value: "fx-sold", label: "FX sold" },
  { value: "others", label: "Others" },
];

const CURRENCIES = [
  { value: "USD", label: "USD", flag: "🇺🇸" },
  { value: "NGN", label: "NGN", flag: "🇳🇬" },
  { value: "GBP", label: "GBP", flag: "🇬🇧" },
] as const;

const CATEGORIES = [
  { value: "medicals", label: "Medicals" },
  { value: "pta", label: "PTA" },
  { value: "bta", label: "BTA" },
] as const;

const ACTIONS = [
  { label: "Buy FX", icon: "/wallet-minus.svg" },
  { label: "Sell FX", icon: "/wallet-add.svg" },
  { label: "Receive money", icon: "/money.svg" },
];

// Mock total — Task 1 uses static data (CLAUDE.md); it does not vary with
// the chip or dropdown selection in the source screens.
const TOTAL_FX_UNITS = 67_048;

export function FxSummaryCard() {
  const [chip, setChip] = useState<Chip>("fx-bought");
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>(
    CURRENCIES[0],
  );
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>(
    CATEGORIES[0],
  );

  const isFx = chip !== "others";

  return (
    <section className="flex flex-col gap-5 rounded-[--radius-card] border border-border bg-surface p-6 shadow-[--shadow-card]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterChips chips={CHIPS} value={chip} onChange={setChip} />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-[--radius-pill] bg-dark-pill px-3 py-1.5 text-sm text-white outline-none">
            {isFx ? (
              <>
                <span>{currency.flag}</span>
                {currency.label}
              </>
            ) : (
              category.label
            )}
            <ChevronDown size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isFx
              ? CURRENCIES.map((c) => (
                  <DropdownMenuItem key={c.value} onSelect={() => setCurrency(c)}>
                    {c.flag} {c.label}
                  </DropdownMenuItem>
                ))
              : CATEGORIES.map((c) => (
                  <DropdownMenuItem key={c.value} onSelect={() => setCategory(c)}>
                    {c.label}
                  </DropdownMenuItem>
                ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <p className="flex items-center gap-1.5 text-sm text-text-secondary">
          Total FX units
          <Image src="/eye.svg" alt="" width={16} height={16} />
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-canvas text-sm text-text-secondary">
            $
          </span>
          <AmountDisplay value={TOTAL_FX_UNITS} />
        </div>
      </div>

      <div className="flex gap-3">
        {ACTIONS.map(({ label, icon }) => (
          <button
            key={label}
            type="button"
            className="flex flex-1 flex-col items-center gap-2 rounded-[--radius-control] border border-border px-4 py-3 text-xs font-medium text-text-primary transition-[transform,background-color] duration-150 ease-out hover:bg-canvas active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            <Image src={icon} alt="" width={20} height={20} />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
