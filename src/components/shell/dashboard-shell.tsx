"use client";
// Client component: holds the sidebar collapsed/expanded boolean (S-201/S-204).

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/shell/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-dvh gap-4 bg-canvas p-4">
      <div className="hidden lg:flex">
        <Sidebar collapsed={collapsed} />
      </div>

      <button
        type="button"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((value) => !value)}
        className={`absolute top-[calc(--spacing(4)+2.75rem)] hidden size-7 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-[--shadow-card] transition-[left] duration-200 ease-out lg:flex ${
          collapsed
            ? "left-[calc(--spacing(4)+(--spacing(20))-14px)]"
            : "left-[calc(--spacing(4)+(--spacing(60))-14px)]"
        }`}
      >
        <ChevronRight
          size={16}
          className={`transition-transform duration-200 ease-out ${collapsed ? "" : "rotate-180"}`}
        />
      </button>

      <main className="flex min-w-0 flex-1 flex-col gap-4">{children}</main>
    </div>
  );
}
