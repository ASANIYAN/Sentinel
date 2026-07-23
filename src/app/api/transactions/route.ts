import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, verifyToken } from "@/lib/auth";
import { getTransactions } from "@/lib/db";
import { apiError } from "@/lib/http";
import { transactionsQuerySchema } from "@/lib/validators";
import type { Paginated } from "@/types/api";
import type { Transaction } from "@/types/transaction";

export async function GET(request: NextRequest) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return apiError(401, "UNAUTHORIZED", "Sign in to view transactions");
  }

  const parsed = transactionsQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );
  if (!parsed.success) {
    return apiError(400, "INVALID_QUERY", "Check the query parameters and try again");
  }

  const { data, total } = getTransactions(parsed.data);
  const body: Paginated<Transaction> = {
    data,
    total,
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
  };
  return NextResponse.json(body);
}
