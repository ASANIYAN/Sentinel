import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearedAuthCookies } from "@/lib/auth";

export async function POST() {
  const store = await cookies();
  for (const c of clearedAuthCookies()) {
    store.set(c.name, c.value, c.options);
  }
  return NextResponse.json({ success: true });
}
