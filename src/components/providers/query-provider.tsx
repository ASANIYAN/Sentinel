"use client";
// Client component: holds the QueryClient instance. TanStack Query scope
// is mutations only (CLAUDE.md) — reads come from Server Components.

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
