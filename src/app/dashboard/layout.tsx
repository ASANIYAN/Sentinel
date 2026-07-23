import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, verifyToken } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { SessionProvider } from "@/hooks/use-session";
import { DashboardShell } from "@/components/shell/dashboard-shell";
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
      <DashboardShell>
        <MobileNav />
        <Topbar name={user.name} />
        <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
      </DashboardShell>
    </SessionProvider>
  );
}
