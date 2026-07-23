import { TriangleAlert } from "lucide-react";

type Props = {
  onRetry?: () => void;
};

export function ErrorState({ onRetry }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-(--radius-card) border border-border bg-surface p-12 text-center shadow-(--shadow-card)">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <TriangleAlert size={22} />
      </span>
      <p className="text-sm font-medium text-text-primary">
        Something went wrong loading transactions
      </p>
      <p className="text-sm text-text-secondary">
        Check the filters in the URL, or try again.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-(--radius-control) border border-border px-3.5 py-1.5 text-sm font-medium text-text-primary"
        >
          Try again
        </button>
      )}
    </div>
  );
}
