"use client";
// TanStack mutation (AD-8): optimistic flag update, rollback on error.

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { useTransactionsStore } from "@/hooks/use-transactions-store";
import type { Transaction } from "@/types/transaction";

type FlagInput = {
  id: string;
  flagged: boolean;
  flagReason?: string;
};

type Context = {
  snapshot?: Transaction;
};

export function useFlagTransaction() {
  const updateRow = useTransactionsStore((s) => s.updateRow);

  return useMutation<Transaction, Error, FlagInput, Context>({
    mutationFn: async ({ id, flagged, flagReason }) => {
      const res = await apiFetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ flagged, flagReason }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Failed to update the transaction");
      }
      return res.json();
    },
    onMutate: ({ id, flagged, flagReason }) => {
      const snapshot = useTransactionsStore.getState().rows.find((r) => r.id === id);
      updateRow(id, {
        flagged,
        flagReason: flagged ? (flagReason ?? null) : null,
        status: flagged ? "flagged" : "completed",
      });
      return { snapshot };
    },
    onError: (error, _vars, context) => {
      if (context?.snapshot) updateRow(context.snapshot.id, context.snapshot);
      toast.error(error.message);
    },
    onSettled: (data) => {
      if (data) updateRow(data.id, data);
    },
  });
}
