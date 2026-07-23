import { ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/shell/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh bg-canvas">
      <Sidebar />

      {/* Collapse toggle: visual only per S-201 (no collapse behavior wired). */}
      <button
        type="button"
        aria-label="Toggle sidebar"
        className="absolute top-8 left-[calc(theme(spacing.60)-14px)] flex size-7 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-[--shadow-card]"
      >
        <ChevronRight size={16} />
      </button>

      {/* Topbar is added here in S-202. */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
