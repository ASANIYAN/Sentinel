"use client";
// Client component: local form state, mutations, and the sheet's open
// state (owned by TransactionsTable).

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AmountDisplay } from "@/components/shared/amount-display";
import { StatusPill } from "@/components/transactions/status-pill";
import { useSession } from "@/hooks/use-session";
import { useFlagTransaction } from "@/hooks/use-flag-transaction";
import { useAddNote } from "@/hooks/use-add-note";
import { formatDateTime } from "@/lib/format";
import type { Transaction } from "@/types/transaction";

const HIGH_RISK_THRESHOLD = 70;
const ROLE_LABEL = { admin: "Admin", analyst: "Analyst" } as const;

type Props = {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DetailSheet({ transaction, open, onOpenChange }: Props) {
  const { user } = useSession();
  const flagMutation = useFlagTransaction();
  const noteMutation = useAddNote();
  const [showFlagInput, setShowFlagInput] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    setShowFlagInput(false);
    setFlagReason("");
    setNoteText("");
  }, [transaction?.id]);

  if (!transaction) return null;
  const isAdmin = user.role === "admin";

  function handleFlagClick() {
    if (!transaction) return;
    if (transaction.flagged) {
      flagMutation.mutate({ id: transaction.id, flagged: false });
      return;
    }
    if (!showFlagInput) {
      setShowFlagInput(true);
      return;
    }
    flagMutation.mutate(
      { id: transaction.id, flagged: true, flagReason },
      { onSuccess: () => setShowFlagInput(false) },
    );
  }

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!transaction || !noteText.trim()) return;
    noteMutation.mutate(
      { id: transaction.id, note: noteText.trim() },
      { onSuccess: () => setNoteText("") },
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6">
        <SheetHeader className="p-0">
          <SheetTitle className="font-mono text-sm font-normal text-text-secondary">
            {transaction.reference}
          </SheetTitle>
        </SheetHeader>

        <div>
          <p className="text-sm text-text-secondary">{transaction.merchant}</p>
          <div className="mt-1 flex items-center gap-3">
            <AmountDisplay value={transaction.amount / 100} />
            <StatusPill status={transaction.status} />
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-text-secondary">Channel</dt>
            <dd className="mt-0.5 font-medium text-text-primary capitalize">
              {transaction.channel.replace("_", " ")}
            </dd>
          </div>
          <div>
            <dt className="text-text-secondary">Card</dt>
            <dd className="mt-0.5 font-mono text-text-primary">
              •••• {transaction.cardLast4}
            </dd>
          </div>
          <div>
            <dt className="text-text-secondary">Risk score</dt>
            <dd className="mt-0.5 flex items-center gap-1 font-medium text-text-primary">
              {transaction.riskScore}
              {transaction.riskScore >= HIGH_RISK_THRESHOLD && (
                <ShieldAlert size={14} className="text-accent" />
              )}
            </dd>
          </div>
          <div>
            <dt className="text-text-secondary">Account</dt>
            <dd className="mt-0.5 font-mono text-text-primary">
              {transaction.senderAccountMasked}
            </dd>
          </div>
          <div>
            <dt className="text-text-secondary">Created</dt>
            <dd className="mt-0.5 text-text-primary">
              {formatDateTime(transaction.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-text-secondary">Updated</dt>
            <dd className="mt-0.5 text-text-primary">
              {formatDateTime(transaction.updatedAt)}
            </dd>
          </div>
        </dl>

        {/* Admin-only render is UX; the server enforces the RBAC rule. */}
        {isAdmin && (
          <div className="flex flex-col gap-2">
            {showFlagInput && !transaction.flagged && (
              <input
                autoFocus
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Reason (try FAIL to see rollback)"
                className="rounded-[--radius-control] border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
            )}
            <button
              type="button"
              onClick={handleFlagClick}
              disabled={flagMutation.isPending}
              className="rounded-[--radius-control] bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {transaction.flagged
                ? "Unflag transaction"
                : showFlagInput
                  ? "Confirm flag"
                  : "Flag transaction"}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-text-primary">Notes</h3>

          <div className="flex flex-col gap-3">
            {transaction.notes.length === 0 && (
              <p className="text-sm text-text-secondary">No notes yet.</p>
            )}
            {transaction.notes.map((note) => (
              <div key={note.id} className="border-b border-border pb-3 text-sm">
                <p className="font-medium text-text-primary">
                  {ROLE_LABEL[note.authorRole]}
                  <span className="ml-2 text-xs font-normal text-text-secondary">
                    {formatDateTime(note.createdAt)}
                  </span>
                </p>
                <p className="mt-1 text-text-secondary">{note.body}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note"
              className="flex-1 rounded-[--radius-control] border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={noteMutation.isPending}
              className="rounded-[--radius-control] border border-border px-3 py-2 text-sm font-medium text-text-primary disabled:opacity-60"
            >
              Add
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
