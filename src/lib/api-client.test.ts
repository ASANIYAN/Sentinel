import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiFetch,
  isLoggedOut,
  onForcedLogout,
  resetApiClient,
} from "./api-client";

type Call = { url: string; init?: RequestInit };

function res(status: number): Response {
  return new Response(status === 204 ? null : "{}", { status });
}

let calls: Call[];

function urlOf(input: RequestInfo | URL): string {
  return typeof input === "string" ? input : input.toString();
}

beforeEach(() => {
  resetApiClient();
  calls = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch single-flight refresh mutex", () => {
  it("three concurrent 401s trigger exactly one refresh and three retries", async () => {
    let refreshed = false;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = urlOf(input);
        calls.push({ url, init });
        if (url === "/api/auth/refresh") {
          refreshed = true;
          return res(200);
        }
        return refreshed ? res(200) : res(401);
      }),
    );

    const results = await Promise.all([
      apiFetch("/api/a"),
      apiFetch("/api/b"),
      apiFetch("/api/c"),
    ]);

    expect(results.map((r) => r.status)).toEqual([200, 200, 200]);
    const refreshCalls = calls.filter((c) => c.url === "/api/auth/refresh");
    expect(refreshCalls).toHaveLength(1);
    for (const url of ["/api/a", "/api/b", "/api/c"]) {
      expect(calls.filter((c) => c.url === url)).toHaveLength(2); // original + one retry
    }
  });

  it("passes non-401 responses through untouched", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => res(200)));
    const r = await apiFetch("/api/a");
    expect(r.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("apiFetch forced logout", () => {
  function stubFailingRefresh() {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = urlOf(input);
        calls.push({ url });
        if (url === "/api/auth/refresh") return res(401);
        if (url === "/api/auth/logout") return res(200);
        return res(401);
      }),
    );
  }

  it("a failed refresh calls logout, notifies listeners, and rejects with AbortError", async () => {
    stubFailingRefresh();
    const listener = vi.fn();
    onForcedLogout(listener);

    await expect(apiFetch("/api/a")).rejects.toMatchObject({
      name: "AbortError",
    });
    expect(calls.some((c) => c.url === "/api/auth/logout")).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(isLoggedOut()).toBe(true);
  });

  it("blocks new requests after logout until the client resets", async () => {
    stubFailingRefresh();
    await expect(apiFetch("/api/a")).rejects.toMatchObject({
      name: "AbortError",
    });

    calls = [];
    await expect(apiFetch("/api/b")).rejects.toMatchObject({
      name: "AbortError",
    });
    expect(calls).toHaveLength(0); // refused before any network call

    resetApiClient();
    vi.stubGlobal("fetch", vi.fn(async () => res(200)));
    const r = await apiFetch("/api/b");
    expect(r.status).toBe(200);
  });
});
