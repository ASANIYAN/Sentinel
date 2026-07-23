import { transactionsQuerySchema } from "@/lib/validators";
import { getTransactions } from "@/lib/db";
import { FilterBar } from "@/components/transactions/filter-bar";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { Pagination } from "@/components/transactions/pagination";

// AD-10: the dashboard layout already reads cookies for auth, which forces
// dynamic rendering for every route under it — there is no separate fetch
// cache to opt out of here, since the query function is called directly
// (AD-6), not over HTTP.
export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  // .parse (not safeParse) throws on bad input — error.tsx renders the
  // required error state (S-402 AC).
  const query = transactionsQuerySchema.parse(raw);
  const { data, total } = getTransactions(query);

  return (
    <div className="flex flex-col gap-5">
      <FilterBar />
      <TransactionsTable data={data} />
      <Pagination total={total} page={query.page} pageSize={query.pageSize} />
    </div>
  );
}
