import { NextResponse } from "next/server";
import type { ApiError } from "@/types/api";

/** Normalized error shape for every handler: { error: { code, message } }. */
export function apiError(
  status: number,
  code: string,
  message: string,
): NextResponse<ApiError> {
  return NextResponse.json({ error: { code, message } }, { status });
}
