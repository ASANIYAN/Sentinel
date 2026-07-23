"use client";
// Client component: Sheet open state for the small-screen nav drawer.

import { useState } from "react";
import { Menu } from "lucide-react";
import Image from "next/image";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/shell/sidebar";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between rounded-(--radius-card) border border-border bg-surface p-3 shadow-(--shadow-card) lg:hidden">
      <Image src="/logo.svg" alt="SohCahToa Payout BDC" width={92} height={38} priority className="h-auto w-auto" />

      <Sheet open={open} onOpenChange={setOpen}>
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
          className="flex size-9 items-center justify-center rounded-full border border-border text-text-secondary"
        >
          <Menu size={18} />
        </button>
        <SheetContent side="left" className="w-72 border-none bg-transparent p-2 shadow-none">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>
    </div>
  );
}
