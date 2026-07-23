# Sentinel — SohCahToa Holdings Assessment

A Next.js (App Router) secure transaction monitoring dashboard, built for the SohCahToa Holdings frontend assessment. Two deliverables in one repo:

- **Task 1** — a faithful conversion of the Figma "Screens 1" home dashboard, at `/dashboard/home`
- **Task 2** — a secure transaction monitoring admin dashboard, at `/login` and `/dashboard/transactions`

There is no real backend. Route Handlers simulate the entire API against an in-memory mock database.

## Run it

```bash
npm install
cp .env.example .env.local   # set AUTH_SECRET to any long random string
npm run dev
```

Open `http://localhost:3000` and sign in with one of the demo accounts below.

## Test it

```bash
npm test
```

Runs the Vitest suite (30 tests): the refresh-mutex "money test", pagination/sort/date-range query logic, JWT sign/verify, cookie flags, and the RBAC 403 check.

## Demo credentials

| Role    | Email                      | Password      |
| ------- | -------------------------- | ------------- |
| Admin   | `admin@sohcahtoa.test`     | `password123` |
| Analyst | `analyst@sohcahtoa.test`   | `password123` |

Both are shown as a hint on the login page. Admin can flag transactions; analyst can only add notes — enforced server-side, not just hidden client-side.

## Task 1 ↔ Task 2 route mapping

| Task   | Route                     | What it answers                                                                 |
| ------ | -------------------------- | -------------------------------------------------------------------------------- |
| —      | `/login`                   | Auth entry point (no Figma screen; built to the design tokens)                  |
| Task 1 | `/dashboard/home`          | FX summary card (two chip/dropdown states), FX transaction list, cards column   |
| Task 2 | `/dashboard/transactions`  | Server-rendered, URL-driven table with live updates and the admin detail sheet  |

The Sidebar/Topbar shell is shared by both tasks.

## Architecture decisions

Each decision below states what was chosen, the alternative considered, and why.

### AD-1: Tokens in httpOnly cookies

**Chosen:** the login Route Handler sets three cookies — `access_token` (httpOnly, `SameSite=Lax`, `Secure` in production, ~15 min), `refresh_token` (httpOnly, same flags, ~7 days, scoped to `path=/api/auth`), and `token_expiry` (readable, holds a timestamp only — not a secret — so the client can schedule a proactive refresh). The login response body still returns the spec's exact JSON shape (`{ accessToken, refreshToken, expiresIn, user }`); this is informational only, client JS never stores or reads the token values.

**Alternative considered:** `localStorage`/`sessionStorage` tokens, read and attached by client JS.

**Why:** httpOnly cookies are inaccessible to JS, which closes the main XSS token-theft vector outright. `localStorage` tokens are just JS variables; anything that ever gets an XSS foothold reads them.

### AD-2: Real JWTs via jose

**Chosen:** HS256, signed with a secret from `AUTH_SECRET`. Payload: `sub` (user id), `role` (`admin` | `analyst`), `exp`. Middleware verifies signature and expiry with `jose`, which is Edge-runtime compatible. The `role` claim is the single source of truth for RBAC in both the middleware and the mutation handler.

**Alternative considered:** an opaque session id looked up server-side per request.

**Why:** the assessment specifically wants a JWT implementation graded; `jose` is Edge-compatible unlike most Node-only JWT libraries, which matters because the middleware runs on the Edge runtime.

### AD-3: Middleware is a dumb gate

**Chosen:** `middleware.ts` matches `/dashboard/:path*`. It verifies the access cookie and redirects to `/login?from=<path>` if missing, invalid, or expired. It does **not** refresh tokens, and it never matches `/login`, so a redirect loop is structurally impossible.

**Alternative considered:** heavier middleware that also attempts a refresh before redirecting.

**Why — and the limitation:** the middleware only protects the routes it matches. Every API Route Handler re-verifies auth independently in-handler; middleware is not a substitute for handler-level checks. The Edge runtime also can't run Node-only crypto or hold server-side state, which is part of why refresh logic doesn't belong here.

### AD-4: Refresh = client fetch wrapper, single-flight mutex

**Chosen:** `lib/api-client.ts` exports `apiFetch()`. On a 401, it checks a module-scope `refreshPromise`; if null, it's set to `doRefresh()` and cleared in `finally`. Every concurrent 401 awaits the same promise, then retries its original request once. If the refresh fails, the wrapper runs a full logout: call `/api/auth/logout`, abort every in-flight request via a module-scope `AbortController`, set a logged-out flag that refuses new requests, notify registered listeners (closing the SSE connection), and redirect to `/login`. The controller is recreated after logout so a fresh login re-arms the wrapper. Callers swallow `AbortError` silently.

**Alternative considered:** letting each caller detect and handle its own 401/refresh independently.

**Why:** without a shared mutex, N concurrent requests that all 401 at once would each trigger their own refresh call — a real race condition. The single-flight pattern collapses that to exactly one refresh call no matter how many requests are in flight; this is unit-tested directly (`src/lib/api-client.test.ts`) as "the money test."

### AD-5: Refresh tokens do not rotate

**Chosen:** a deliberate scope decision. Refreshing does not rotate the refresh token.

**Alternative considered:** rotation with reuse detection.

**Why:** non-rotating tokens make concurrent refreshes — including multiple browser tabs refreshing independently — idempotent with zero cross-tab coordination. **In production** this would need rotation, reuse detection, and a `BroadcastChannel` (or similar) so multiple tabs agree on which refresh "wins," since a rotated-and-invalidated token used by a second tab would otherwise incorrectly log the user out.

### AD-6: URL search params own query state

**Chosen:** `/dashboard/transactions?page=2&sort=createdAt&order=desc&status=flagged&from=...&to=...`. The server component reads `searchParams`, calls the pure `getTransactions()` query function directly (not over HTTP — see AD-10), and renders. Filter/sort/pagination controls are client components that call `router.push()`; there is no duplicated client-side query state.

**Alternative considered:** client-side state (e.g. a `useState`/context store) for the current filters, fetched via `useEffect`.

**Why:** URL-as-state makes every view shareable and makes browser back/forward work automatically, for free. It also keeps the read path almost entirely server-rendered — the only client components in it are the controls themselves.

### AD-7: Server render seeds a client row store

**Chosen:** the server component passes its page of data as props; the client `TransactionsTable` seeds a Zustand store keyed by transaction id. SSE events are deduped by id (a keyed store makes this free), filtered against the *current* URL params before insertion — a match gets inserted respecting sort order, a non-match only increments an "N new" counter — and existing rows are updated in place. Navigation (a new page/filter) re-seeds the store from fresh server data. The table never calls `router.refresh()` in response to an SSE event.

**Alternative considered:** re-fetching the whole page on every SSE tick.

**Why:** `router.refresh()` on every tick would remount and refetch constantly, defeating the point of a live feed and causing visible flicker. The row store lets exactly one row re-render when it changes (rows are memoized by id), while everything else stays untouched.

### AD-8: Mutations via Route Handlers, not Server Actions

**Chosen:** `PATCH /api/transactions/[id]` — Zod-validated body (`{ flagged?, flagReason?, note? }`), auth read from the cookie in-handler, RBAC enforced server-side (`flagged` requires `role === "admin"`, otherwise 403 — hiding the flag button for an analyst is UX, not security). The client uses a TanStack Query mutation: `onMutate` snapshots the row and applies an optimistic update, `onError` rolls back from the snapshot and surfaces a sonner toast, `onSettled` reconciles with the server's response.

**Alternative considered:** Next.js Server Actions.

**Why:** Route Handlers keep the mutation on the same explicit request/response contract as the rest of the API (shared Zod schemas, the same error shape, the same auth check pattern), and they compose cleanly with the existing `apiFetch` wrapper (mutex, abort, logout) that reads/writes already depend on.

### AD-9: SSE via a streaming Route Handler

**Chosen:** `GET /api/transactions/stream` verifies the auth cookie in-handler (401 without one), then returns a `ReadableStream` over `text/event-stream`. A `setInterval` (3–5s) generates one realistic transaction, writes it into the mock db (so pagination numbers stay consistent with what the stream produces), and enqueues it as `data: {json}\n\n`. On `request.signal` abort — the client disconnecting — the interval is cleared and the controller closed, with a log line confirming the cleanup (no zombie intervals).

**Alternative considered:** polling the transactions endpoint on an interval.

**Why:** SSE is a natural fit for a one-way server-to-client feed and needs far less client bookkeeping than polling (no need to diff against the last poll, no risk of overlapping in-flight polls).

### AD-10: Caching = `no-store`, chosen for reasons, not by default

**Chosen:** where a fetch call happens, `cache: 'no-store'` is used, framed as an explicit choice rather than an omission. In practice, though, the transactions page reads data by calling the `getTransactions()` query function directly (AD-6) — there is no `fetch()` involved in the page's own render path, so there is no fetch cache to opt out of. The relevant dynamic-rendering guarantee actually comes from the dashboard layout: it reads cookies (`cookies()`) to resolve the session on every request, which already forces the entire route segment to render dynamically.

**Alternative considered:** static generation with `revalidate` for the transactions page.

**Why:** monitoring data is per-session and must never be stale, so opting out of caching is correct regardless of mechanism. `revalidate` **would** make sense for genuinely static reference content (e.g. a help/FAQ page) — nothing in this app currently needs that, which is itself informative: it shows the no-caching choice here was deliberate, not just the path of least resistance.

### AD-11: Mock data in `lib/db.ts` with `globalThis`

**Chosen:** `globalThis.__db ??= { transactions: seed(), users: [...] }`, which survives Next's dev-mode hot reload (a fresh module instance would otherwise reset the mock db on every save). Query functions (`getTransactions`, `getTransaction`, `updateTransaction`, `addNote`, `generateTransaction`, `getUserById`/`getUserByEmail`) are pure and exported separately from any Route Handler, so they're directly unit-testable without spinning up a server. ~80 seeded transactions span the last 90 days, mostly NGN with some USD/GBP, log-distributed amounts, risk scores mostly 5–40 with rare spikes above 80. The third-newest transaction (visible on page 1 unfiltered) has `merchant` set to `<script>alert("xss")</script>` — a deliberate XSS canary.

**Alternative considered:** a real embedded database (SQLite) for the mock layer.

**Why:** the assessment doesn't need real persistence — `globalThis` plus pure functions gets hot-reload stability and unit-testability with none of the setup or migration overhead a real db would add for a throwaway mock layer.

## Security

- **XSS:** React's default JSX escaping is the only defense needed, and it's sufficient — the codebase contains zero uses of `dangerouslySetInnerHTML` (verified by grep across `src/`). The seeded transaction with merchant `<script>alert("xss")</script>` renders as inert text everywhere it's displayed (verified in a real browser: the text is visible, no `alert()` dialog ever fires). API responses are JSON, never HTML, so there's no server-side HTML-injection surface either.
- **Session teardown:** verified end-to-end by clearing all cookies mid-session and then triggering an authenticated mutation. The sequence observed: the request 401s → refresh is attempted → refresh also fails (no refresh cookie) → the wrapper calls logout, aborts in-flight requests, closes the SSE connection via a registered listener, and redirects to `/login`. The browser's cookie jar was confirmed empty afterward.
- **CSRF:** every auth cookie is `SameSite=Lax`. A cross-site `<form>` POST (the classic CSRF vector) does not attach `SameSite=Lax` cookies on a cross-site simple request, so a forged form on another origin can't ride the victim's session to mutate data. Lax still allows the cookie on top-level navigations (e.g. following a link), which is why login/logout/refresh — all same-site, first-party requests — work normally.
- **Sensitive data:** only the last 4 card digits ever exist anywhere in the schema (`cardLast4`) — there's no field that could hold a full PAN even by mistake. Amounts are minor-unit integers, never floats, formatted at the display edge via `Intl.NumberFormat`. No token or cookie value is ever passed to `console.*` — verified by grep; the codebase's only `console.log` call announces SSE cleanup, nothing sensitive.
- **Cookie flags, verified via `Set-Cookie` headers on `/api/auth/login`:** `access_token` and `refresh_token` are `HttpOnly; SameSite=Lax` (`Secure` is added automatically in production, via `NODE_ENV`); `token_expiry` is the only cookie without `HttpOnly`, since the client needs to read it to schedule a proactive refresh — it holds a plain timestamp, not a secret.

## Middleware limitations

- `middleware.ts` only matches `/dashboard/:path*`. It does not protect API routes — every Route Handler re-verifies the access cookie independently.
- It runs on the Edge runtime: no Node-only crypto, no persistent server-side state. `jose` was chosen specifically because it works here.
- It never refreshes tokens; an expired access token always redirects to `/login`, even if a valid refresh token exists. The client-side `apiFetch` wrapper is what performs refreshes, and only for API calls, not page navigations.

## Testing

Six categories, 30 tests total:

1. **Refresh mutex** (`lib/api-client.test.ts`) — three concurrent 401s trigger exactly one refresh call and all three original requests are retried; a failed refresh forces logout and blocks further requests until a new login resets the client.
2. **Query logic** (`lib/db.test.ts`) — pagination math, sort correctness (both directions), status filter, date-range filter, mutation behavior, and the XSS seed row's position.
3. **RBAC** (`app/api/transactions/[id]/route.test.ts`) — an analyst's flag attempt gets 403; an admin's flag persists both the boolean and the status; an analyst's note succeeds.
4. **Auth utilities** (`lib/auth.test.ts`) — JWT sign/verify round-trips, an expired token is rejected, a tampered token is rejected, and every cookie carries its spec'd flags.
5. **Validators** (`lib/validators.test.ts`) — bad input is rejected: invalid status, `page=0`, malformed dates, an empty PATCH body, a flag without a reason.
6. **Smoke** (`lib/smoke.test.ts`) — the suite itself runs.

Skipped deliberately: component/E2E tests. In production this project would add Playwright specifically for the auth-redirect flows (unauthenticated → `/login?from=`, successful login → intended destination), since those depend on real browser navigation in a way unit tests can't exercise.

## Deliberate package absences

| Not used | Why |
| --- | --- |
| **TanStack Table** | the table is server-driven via URL params + a Route Handler; adding client table-state machinery would blur the graded server/client separation |
| **axios** | native `fetch` plus `lib/api-client.ts` *is* the refresh-mutex deliverable (AD-4) — a wrapper library would just hide the part being graded |
| **react-hook-form** | the login form is two fields; `useState` + a Zod `.safeParse()` on submit is simpler than pulling in a form library for that |
| **next-auth or any auth library** | the auth implementation (AD-1–AD-5) is itself what's being graded |
| **date-fns / dayjs** | `Intl.DateTimeFormat` covers every display need, and date-range filtering is plain ISO-string comparison — both need no library |

TanStack Query is scoped to mutations only in this codebase; reads come from Server Components, and SSE feeds the Zustand store directly. There is intentionally no `useQuery` anywhere in the transaction list's read path.

## Known limitation

The dashboard shell uses a fixed 240px sidebar with no mobile nav pattern (no hamburger menu, no collapse-to-icons breakpoint) — there's no ticket for one in the build plan, and no mobile Figma screens were provided. The responsive grid on `/dashboard/home` correctly stacks to one column with no horizontal overflow down to ~900px (tablet); below roughly 640px the fixed sidebar itself causes horizontal overflow. Production would need a dedicated mobile nav ticket to close this gap.
