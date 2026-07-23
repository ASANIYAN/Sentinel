"use client";
// Error boundaries must be client components (Next.js convention).

import { ErrorState } from "@/components/transactions/error-state";

export default function Error({ reset }: { reset: () => void }) {
  return <ErrorState onRetry={reset} />;
}
