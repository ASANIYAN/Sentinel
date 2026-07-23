"use client";
// Client component: every control here writes to the URL via
// use-table-params — the only client components in the read path (AD-6).

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { FilterChips, type FilterChip } from "@/components/shared/filter-chips";
import { useTableParams } from "@/hooks/use-table-params";

type StatusValue = "all" | "pending" | "completed" | "failed" | "flagged";

const STATUS_CHIPS: FilterChip<StatusValue>[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "flagged", label: "Flagged" },
];

const SORT_OPTIONS = [
  { label: "Newest first", sort: "createdAt", order: "desc" },
  { label: "Oldest first", sort: "createdAt", order: "asc" },
  { label: "Amount: high to low", sort: "amount", order: "desc" },
  { label: "Amount: low to high", sort: "amount", order: "asc" },
  { label: "Highest risk", sort: "riskScore", order: "desc" },
] as const;

function formatDate(iso?: string) {
  if (!iso) return undefined;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function FilterBar() {
  const { status, sort, order, from, to, setStatus, setSort, setDateRange } =
    useTableParams();
  const [range, setRange] = useState<DateRange | undefined>({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });

  const activeSort =
    SORT_OPTIONS.find((o) => o.sort === sort && o.order === order) ??
    SORT_OPTIONS[0];

  const dateLabel =
    from && to ? `${formatDate(from)} – ${formatDate(to)}` : "Date range";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <FilterChips
        chips={STATUS_CHIPS}
        value={(status as StatusValue) ?? "all"}
        onChange={(value) => setStatus(value === "all" ? undefined : value)}
      />

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger className="flex items-center gap-1.5 rounded-[--radius-pill] border border-border bg-surface px-3.5 py-1.5 text-sm text-text-secondary outline-none">
            <CalendarIcon size={14} />
            {dateLabel}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <Calendar
              mode="range"
              selected={range}
              onSelect={(next) => {
                setRange(next);
                if (next?.from && next?.to) {
                  setDateRange(next.from.toISOString(), next.to.toISOString());
                }
              }}
            />
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-[--radius-pill] border border-border bg-surface px-3.5 py-1.5 text-sm text-text-secondary outline-none">
            {activeSort.label}
            <ChevronDown size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.label}
                onSelect={() => setSort(option.sort, option.order)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
