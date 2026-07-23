import { headers, cookies } from "next/headers";
import { transactionsQuerySchema, type TransactionsQuery } from "@/lib/validators";
import { FilterBar } from "@/components/transactions/filter-bar";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { Pagination } from "@/components/transactions/pagination";
import type { Paginated } from "@/types/api";
import type { Transaction } from "@/types/transaction";

// AD-10: cache: "no-store" is explicit here — cookie-reading already forces
// dynamic rendering for every route under the dashboard layout, but
// monitoring data must never be served stale, so we opt out in writing too.
async function fetchTransactions(query: TransactionsQuery): Promise<Paginated<Transaction>> {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookieHeader = (await cookies()).toString();

  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sort: query.sort,
    order: query.order,
  });
  if (query.status) params.set("status", query.status);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);

  const res = await fetch(`${proto}://${host}/api/transactions?${params}`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to load transactions");
  }
  return res.json();
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  // .parse (not safeParse) throws on bad input — error.tsx renders the
  // required error state (S-402 AC).
  const query = transactionsQuerySchema.parse(raw);
  const { data, total } = await fetchTransactions(query);

  return (
    <div className="flex flex-col gap-5">
      <FilterBar />
      <TransactionsTable data={data} pageSize={query.pageSize} />
      <Pagination total={total} page={query.page} pageSize={query.pageSize} />
    </div>
  );
}
