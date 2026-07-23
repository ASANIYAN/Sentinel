import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ACCESS_COOKIE, verifyToken } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { SessionProvider } from "@/hooks/use-session";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { MobileNav } from "@/components/shell/mobile-nav";

// Re-verifies the access cookie and loads the user (AD-3: the middleware
// only gates the route; each layer checks auth independently).
async function requireSessionUser() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;
  const user = payload ? getUserById(payload.sub) : undefined;
  if (!user) redirect("/login");

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSessionUser();

  return (
    <SessionProvider user={user}>
      <div className="relative flex min-h-dvh gap-4 bg-canvas p-4">
        <div className="hidden lg:flex">
          <Sidebar />
        </div>

        {/* Collapse toggle: visual only per S-201 (no collapse behavior wired). */}
        <button
          type="button"
          aria-label="Toggle sidebar"
          className="absolute top-[calc(--spacing(4)+2.75rem)] left-[calc(--spacing(4)+(--spacing(60))-14px)] hidden size-7 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-[--shadow-card] lg:flex"
        >
          <ChevronRight size={16} />
        </button>

        <main className="flex min-w-0 flex-1 flex-col gap-4">
          <MobileNav />
          <Topbar name={user.name} />
          <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
        </main>
      </div>
    </SessionProvider>
  );
}
