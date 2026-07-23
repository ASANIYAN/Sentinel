import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in — Sentinel",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  // Internal paths only — never redirect to another origin.
  const safeFrom = from?.startsWith("/") ? from : undefined;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-canvas p-6">
      <Image src="/logo.svg" alt="SohCahToa Holdings" width={120} height={49} priority className="h-auto w-auto" />

      <section className="w-full max-w-sm rounded-(--radius-card) border border-border bg-surface p-6 shadow-(--shadow-card)">
        <h1 className="font-display text-xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Sign in to the transaction monitoring dashboard.
        </p>
        <LoginForm from={safeFrom} />
      </section>

      <aside className="w-full max-w-sm rounded-(--radius-control) border border-border bg-accent-soft p-4 text-xs text-text-secondary">
        <p className="font-medium text-text-primary">Demo credentials</p>
        <p className="mt-1 font-mono">admin@sohcahtoa.test · password123</p>
        <p className="font-mono">analyst@sohcahtoa.test · password123</p>
      </aside>
    </main>
  );
}
