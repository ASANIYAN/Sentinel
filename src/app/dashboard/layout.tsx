import { ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

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
        className="absolute top-11 left-[calc(--spacing(60)-14px)] flex size-7 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-[--shadow-card]"
      >
        <ChevronRight size={16} />
      </button>

      <main className="flex min-w-0 flex-1 flex-col gap-6 p-6">
        {/* Placeholder name — wired to the real session in S-203. */}
        <Topbar name="Emmanuel Israel" />
        {children}
      </main>
    </div>
  );
}
