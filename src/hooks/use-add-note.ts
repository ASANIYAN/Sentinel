"use client";
// TanStack mutation (AD-8): optimistic note append, rollback on error.

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { useSession } from "@/hooks/use-session";
import { useTransactionsStore } from "@/hooks/use-transactions-store";
import type { Note, Transaction } from "@/types/transaction";

type NoteInput = {
  id: string;
  note: string;
};

type Context = {
  snapshot?: Transaction;
};

export function useAddNote() {
  const { user } = useSession();
  const updateRow = useTransactionsStore((s) => s.updateRow);

  return useMutation<Transaction, Error, NoteInput, Context>({
    mutationFn: async ({ id, note }) => {
      const res = await apiFetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Failed to add the note");
      }
      return res.json();
    },
    onMutate: ({ id, note }) => {
      const snapshot = useTransactionsStore.getState().rows.find((r) => r.id === id);
      if (snapshot) {
        const optimisticNote: Note = {
          id: `optimistic-${Date.now()}`,
          authorId: user.id,
          authorRole: user.role,
          body: note,
          createdAt: new Date().toISOString(),
        };
        updateRow(id, { notes: [...snapshot.notes, optimisticNote] });
      }
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
