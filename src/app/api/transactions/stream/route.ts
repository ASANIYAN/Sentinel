import { cookies } from "next/headers";
import { ACCESS_COOKIE, verifyToken } from "@/lib/auth";
import { addTransaction, generateTransaction } from "@/lib/db";
import { apiError } from "@/lib/http";

export const dynamic = "force-dynamic";

// AD-9: streaming Route Handler. Auth is checked in-handler (middleware
// only protects /dashboard/*, not this API route).
export async function GET(request: Request) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return apiError(401, "UNAUTHORIZED", "Sign in to stream transactions");
  }

  const encoder = new TextEncoder();
  const intervalMs = 3000 + Math.random() * 2000;

  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        const txn = generateTransaction();
        addTransaction(txn);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(txn)}\n\n`));
      }, intervalMs);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
        console.log("SSE transactions stream closed");
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
