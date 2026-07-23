import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, verifyToken } from "@/lib/auth";
import { addNote, getTransaction, updateTransaction } from "@/lib/db";
import { apiError } from "@/lib/http";
import { patchTransactionSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return apiError(401, "UNAUTHORIZED", "Sign in to update transactions");
  }

  const body = await request.json().catch(() => null);
  const parsed = patchTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "INVALID_INPUT", "Check the request body and try again");
  }

  const { flagged, flagReason, note } = parsed.data;

  if (flagged !== undefined && payload.role !== "admin") {
    return apiError(403, "FORBIDDEN", "Only an admin can flag a transaction");
  }

  // Demo failure path (S-603): lets the walkthrough show optimistic
  // rollback live, on demand.
  if (flagged && flagReason === "FAIL") {
    return apiError(400, "SIMULATED_FAILURE", "This flag reason was rejected");
  }

  const { id } = await params;
  if (!getTransaction(id)) {
    return apiError(404, "NOT_FOUND", "Transaction not found");
  }

  if (flagged !== undefined) {
    updateTransaction(id, { flagged, flagReason: flagged ? (flagReason ?? null) : null });
  }
  if (note !== undefined) {
    addNote(id, { authorId: payload.sub, authorRole: payload.role, body: note });
  }

  return NextResponse.json(getTransaction(id));
}
