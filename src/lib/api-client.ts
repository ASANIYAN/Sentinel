// AD-4: client fetch wrapper with a single-flight refresh mutex. Pure
// module logic — no React — so the mutex is unit-testable.

type LogoutListener = () => void;

// Module scope: one mutex, one abort controller, one logged-out flag per
// browser tab.
let refreshPromise: Promise<boolean> | null = null;
let controller = new AbortController();
let loggedOut = false;
const logoutListeners = new Set<LogoutListener>();

/** Register cleanup to run on forced logout (close SSE, redirect, …). */
export function onForcedLogout(listener: LogoutListener): () => void {
  logoutListeners.add(listener);
  return () => logoutListeners.delete(listener);
}

/** Call after a successful login so the wrapper accepts requests again. */
export function resetApiClient(): void {
  loggedOut = false;
  refreshPromise = null;
  controller = new AbortController();
}

export function isLoggedOut(): boolean {
  return loggedOut;
}

function abortError(): DOMException {
  // Callers swallow AbortError silently, so a refused request after
  // logout surfaces the same way as an aborted one.
  return new DOMException("Client is logged out", "AbortError");
}

async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function forceLogout(): Promise<void> {
  if (loggedOut) return;
  loggedOut = true;

  // Clear the cookies first; the abort below must not cancel this call.
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Cookies expire on their own if the request fails.
  }

  controller.abort(); // cancel in-flight requests
  for (const listener of logoutListeners) listener();

  if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  if (loggedOut) throw abortError();

  const withSignal = (): RequestInit => ({
    ...init,
    signal: init.signal ?? controller.signal,
  });

  const res = await fetch(input, withSignal());
  if (res.status !== 401) return res;

  // Single flight: the first 401 starts the refresh; every concurrent 401
  // awaits the same promise.
  refreshPromise ??= doRefresh().finally(() => {
    refreshPromise = null;
  });
  const refreshed = await refreshPromise;

  if (!refreshed) {
    await forceLogout();
    throw abortError();
  }

  // Retry the original request exactly once.
  if (loggedOut) throw abortError();
  return fetch(input, withSignal());
}
