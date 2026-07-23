"use client";
// Client hook: reads/writes the URL search params that own the
// transactions table's query state (AD-6).

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useTableParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const push = useCallback(
    (updates: Record<string, string | undefined>, resetPage: boolean) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined) next.delete(key);
        else next.set(key, value);
      }
      if (resetPage) next.set("page", "1");
      router.push(`${pathname}?${next.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return useMemo(
    () => ({
      status: searchParams.get("status") ?? undefined,
      sort: searchParams.get("sort") ?? "createdAt",
      order: searchParams.get("order") ?? "desc",
      page: Number(searchParams.get("page") ?? "1"),
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,

      setStatus: (status?: string) => push({ status }, true),
      setSort: (sort: string, order: string) => push({ sort, order }, true),
      setDateRange: (from?: string, to?: string) => push({ from, to }, true),
      setPage: (page: number) => push({ page: String(page) }, false),
    }),
    [searchParams, push],
  );
}
