import { Inbox } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[--radius-card] border border-border bg-surface p-12 text-center shadow-[--shadow-card]">
      <span className="flex size-12 items-center justify-center rounded-full bg-canvas text-text-secondary">
        <Inbox size={22} />
      </span>
      <p className="text-sm font-medium text-text-primary">
        No transactions match these filters
      </p>
      <p className="text-sm text-text-secondary">
        Try widening the date range or clearing a filter.
      </p>
    </div>
  );
}
