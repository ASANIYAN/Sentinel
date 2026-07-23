"use client";
// Client component: form state, submit handler, and router navigation.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginSchema } from "@/lib/validators";

type Props = {
  from?: string;
};

export function LoginForm({ from }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError("Enter a valid email and a password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error?.message ?? "Sign-in failed. Try again.");
        return;
      }
      router.push(from ?? "/dashboard/home");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-(--radius-control) border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

  return (
    <form
      onSubmit={onSubmit}
      method="post"
      action="/api/auth/login"
      noValidate
      className="mt-6 flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Email
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@sohcahtoa.test"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 rounded-(--radius-control) bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
