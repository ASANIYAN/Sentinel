// Generic, controlled chip row — Task 2's FilterBar reuses this for status
// filters (DESIGN.md §4). Presentational only; the parent owns state.

export type FilterChip<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  chips: FilterChip<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function FilterChips<T extends string>({
  chips,
  value,
  onChange,
  className,
}: Props<T>) {
  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ""}`}>
      {chips.map((chip) => {
        const active = chip.value === value;
        return (
          <button
            key={chip.value}
            type="button"
            onClick={() => onChange(chip.value)}
            className={`rounded-[--radius-pill] border px-3.5 py-1.5 text-sm transition-colors ${
              active
                ? "border-accent bg-accent-soft font-medium text-accent"
                : "border-border bg-surface text-text-secondary"
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
