"use client";
// Client component: controlled open state, owned by UserBlock so the
// dropdown menu and this dialog never fight over focus.

import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
};

export function LogoutConfirmDialog({ open, onOpenChange, onConfirm }: Props) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleConfirm() {
    setLoggingOut(true);
    // onConfirm() clears cookies and redirects the page — no need to
    // reset loggingOut or close the dialog after it resolves.
    await onConfirm();
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-[overlay-in_200ms_ease-out_forwards]" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm rounded-(--radius-card) border border-border bg-surface p-6 shadow-(--shadow-card) outline-none data-[state=open]:animate-[dialog-in_200ms_cubic-bezier(0.23,1,0.32,1)_forwards]">
          <DialogPrimitive.Title className="text-base font-semibold text-text-primary">
            Log out?
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1.5 text-sm text-text-secondary">
            You will need to sign in again to access the dashboard.
          </DialogPrimitive.Description>

          <div className="mt-6 flex justify-end gap-2">
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                disabled={loggingOut}
                className="rounded-(--radius-control) border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-60"
              >
                Cancel
              </button>
            </DialogPrimitive.Close>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loggingOut}
              className="rounded-(--radius-control) bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-60"
            >
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
