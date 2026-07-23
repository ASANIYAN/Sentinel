import { cva, type VariantProps } from "class-variance-authority";
import type { TransactionStatus } from "@/types/transaction";

const statusPillVariants = cva(
  "inline-flex items-center rounded-[--radius-pill] px-2.5 py-1 text-xs font-medium capitalize",
  {
    variants: {
      status: {
        pending: "border border-border text-text-secondary bg-surface",
        completed: "bg-positive-soft text-positive",
        failed: "bg-canvas text-text-secondary",
        flagged: "bg-accent-soft text-accent",
      } satisfies Record<TransactionStatus, string>,
    },
  },
);

type Props = VariantProps<typeof statusPillVariants> & {
  status: TransactionStatus;
};

export function StatusPill({ status }: Props) {
  return <span className={statusPillVariants({ status })}>{status}</span>;
}
