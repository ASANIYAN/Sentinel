"use client";
// Client component: page links write to the URL via use-table-params.

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTableParams } from "@/hooks/use-table-params";

type Props = {
  total: number;
  page: number;
  pageSize: number;
};

export function Pagination({ total, page, pageSize }: Props) {
  const { setPage } = useTableParams();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  if (pageCount <= 1) return null;

  // Small page count — show every number. Larger sets could ellipsize,
  // but the mock dataset never exceeds a handful of pages.
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-text-secondary">
        Page {page} of {pageCount}
      </p>
      <div className="flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          aria-label="Previous page"
          className="flex size-8 shrink-0 items-center justify-center rounded-(--radius-control) border border-border text-text-secondary disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPage(p)}
            aria-current={p === page ? "page" : undefined}
            className={`flex size-8 shrink-0 items-center justify-center rounded-(--radius-control) text-sm ${
              p === page
                ? "bg-accent-soft font-medium text-accent"
                : "text-text-secondary"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => setPage(page + 1)}
          aria-label="Next page"
          className="flex size-8 shrink-0 items-center justify-center rounded-(--radius-control) border border-border text-text-secondary disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
