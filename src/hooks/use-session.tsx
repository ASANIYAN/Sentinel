"use client";
// Client component: React context around the session user + logout.

import { createContext, use, useMemo } from "react";
import { logout as apiLogout } from "@/lib/api-client";
import type { SessionUser } from "@/types/api";

type SessionContextValue = {
  user: SessionUser;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

type Props = {
  user: SessionUser;
  children: React.ReactNode;
};

export function SessionProvider({ user, children }: Props) {
  // apiLogout() clears cookies and does a full-page redirect to /login,
  // so there is no client-side navigation to wire up here.
  const value = useMemo(() => ({ user, logout: apiLogout }), [user]);

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): SessionContextValue {
  const ctx = use(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
