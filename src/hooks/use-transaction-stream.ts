"use client";
// SSE connect/teardown, dedup-by-id (via the store), filter-check, and the
// "N new" counter for events that don't match the current view (AD-7).

import { useEffect, useRef, useState } from "react";
import { onForcedLogout } from "@/lib/api-client";
import { useTransactionsStore } from "@/hooks/use-transactions-store";
import type { Transaction } from "@/types/transaction";

type SortKey = "createdAt" | "amount" | "riskScore";
type SortOrder = "asc" | "desc";

type Filters = {
  status?: string;
  from?: string;
  to?: string;
  sort: SortKey;
  order: SortOrder;
};

function matchesFilters(row: Transaction, filters: Filters): boolean {
  if (filters.status && row.status !== filters.status) return false;
  if (filters.from && row.createdAt < filters.from) return false;
  if (filters.to && row.createdAt > filters.to) return false;
  return true;
}

export function useTransactionStream(filters: Filters) {
  const upsert = useTransactionsStore((s) => s.upsert);
  const [connected, setConnected] = useState(false);
  const [newCount, setNewCount] = useState(0);

  // Read inside the handler without re-subscribing the EventSource every
  // time the URL params change.
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    const source = new EventSource("/api/transactions/stream");

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.onmessage = (event) => {
      const row: Transaction = JSON.parse(event.data);
      if (matchesFilters(row, filtersRef.current)) {
        upsert(row, filtersRef.current.sort, filtersRef.current.order);
      } else {
        setNewCount((n) => n + 1);
      }
    };

    const unsubscribeLogout = onForcedLogout(() => source.close());

    return () => {
      source.close();
      unsubscribeLogout();
    };
  }, [upsert]);

  return {
    connected,
    newCount,
    dismissNewCount: () => setNewCount(0),
  };
}
