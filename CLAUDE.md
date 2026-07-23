# CLAUDE.md — SohCahToa Frontend Assessment

Context file for building the SohCahToa Holdings assessment: a Next.js (App Router) secure transaction monitoring dashboard. Read `DESIGN.md` for all UI/visual decisions. This file covers architecture, rules, and build order.

## Project summary

Two deliverables, one repo:

1. **Task 1** — Faithful conversion of Figma "Screens 1" (BDC home dashboard with two interactive states) → lives at `/dashboard/home`
2. **Task 2** — Secure transaction monitoring admin dashboard → `/login` + `/dashboard/transactions`

No real backend. Route Handlers simulate the entire API. Assessment evaluates App Router fluency, auth architecture, RSC/client boundaries, security awareness.

## Mandatory stack

- Next.js latest stable, **App Router only** (no Pages Router)
- TypeScript strict
- Route Handlers for all API
- middleware.ts for route protection
- Server Components by default; `"use client"` only where justified (state, events, browser APIs) — this is explicitly graded (§6.1 of the brief)
- Tailwind v4, tokens in `@theme` (see DESIGN.md)
- Zustand (row store), TanStack Query (mutations), Zod (validation), jose (JWT), lucide-react (icons)
- shadcn: ONLY sheet, dropdown-menu, popover, calendar, sonner, tooltip, skeleton — restyled to our tokens. Buttons/inputs/badges/cards are bespoke.
- Vitest for tests

## Packages (final — do not add without reason)

```
Dependencies: next, react, react-dom, jose, zod, zustand, @tanstack/react-query,
  lucide-react, ulid, react-day-picker, sonner, clsx, tailwind-merge,
  class-variance-authority, geist
Dev: typescript, tailwindcss (v4), vitest, @testing-library/react, @types/*
```

Deliberately absent (defensible in walkthrough):

- **TanStack Table** — table is server-driven via URL params + Route Handler; client table state machinery would blur the graded server/client separation
- **axios** — native fetch + our wrapper IS the assessment's refresh-mutex deliverable (AD-4)
- **react-hook-form** — login is two fields; useState + Zod parse on submit
- **next-auth or any auth lib** — the auth implementation is what's being graded
- **date-fns/dayjs** — Intl.DateTimeFormat covers display; date-range compare is ISO string comparison

TanStack Query scope: **mutations only** (optimistic/rollback). Reads come from server components; SSE feeds the Zustand store. Never introduce useQuery for the transaction list.

shadcn scope (restated): ONLY sheet, dropdown-menu, popover, calendar, sonner, tooltip, skeleton — installed where accessibility (focus traps, keyboard nav, positioning) is expensive to hand-roll. Button/input/badge/card/table are bespoke: the design is distinctive and these are trivial to build to spec.

## Code layering: lib → hooks → components

Strict three-layer rule:

1. **`lib/`** — pure logic, no React. Refresh mutex, query/filter/pagination functions, formatters, Zod schemas, jose utils. Unit-testable without rendering.
2. **`hooks/`** — React-coupled logic only (state, effects, subscriptions, context). Components never contain multi-step logic, lifecycles, or data orchestration.
3. **`components/`** — rendering only: receive data + callbacks, return markup, wire events to callbacks.

Test for placement: "could I test this without rendering?" → lib. "Does it need React state/effects?" → hooks. Otherwise → component.

Planned hooks:

- `use-transaction-stream` — SSE connect/teardown, dedup by id, filter-check, store insert, "N new" counter
- `use-transactions-store` — Zustand store + selectors (seedFromServer, upsert, updateRow)
- `use-flag-transaction` / `use-add-note` — TanStack mutations with optimistic snapshot/rollback/toast
- `use-table-params` — read searchParams, push updates (setStatus, setPage, setSort, setDateRange)
- `use-session` — user/role from context, logout()

Anti-overreach: trivial single-use state (a dropdown's open boolean) may live in its component. Extract when logic is multi-step, shared, or test-worthy — not ceremonially.

## Architecture decisions (settled — do not relitigate)

### AD-1: Tokens in httpOnly cookies

Login Route Handler sets three cookies:

- `access_token` — httpOnly, SameSite=Lax, Secure, ~15 min
- `refresh_token` — httpOnly, SameSite=Lax, Secure, ~7 days, path=/api/auth
- `token_expiry` — NOT httpOnly (readable expiry timestamp; not secret), used by client to schedule proactive refresh

Response body still returns the spec's exact JSON shape ({ accessToken, refreshToken, expiresIn, user }) — informational only; client JS never stores tokens.

### AD-2: Real JWTs via jose

HS256, secret from env. Payload: `sub`, `role` ("admin" | "analyst"), `exp`. Middleware verifies signature + expiry with jose (Edge-compatible). The role claim is the single source of truth for RBAC in both middleware and mutation handlers.

### AD-3: Middleware is a dumb gate

`middleware.ts` matches `/dashboard/:path*`: verify access token cookie → redirect to `/login` if missing/invalid/expired. It does NOT refresh tokens. API routes verify auth independently in-handler (middleware only protects what it matches — this limitation goes in the README).
Redirect safety: never redirect `/login` → `/login`; preserve intended destination via `?from=` param.

### AD-4: Refresh = client fetch wrapper, single-flight mutex

`lib/api-client.ts` exports `apiFetch()`:

- On 401: check module-scope `refreshPromise`. If null, set it to `doRefresh()` and clear in `finally`. All concurrent 401s await the same promise, then retry original request ONCE.
- Refresh failure → logout flow: call `/api/auth/logout` (clears cookies), abort in-flight requests, set logged-out flag (wrapper refuses new requests), close SSE, `router.push('/login')`.
- Module-scope `AbortController` passed to every fetch; recreated after logout so re-login works.
- Swallow `AbortError` silently in callers.

### AD-5: Refresh tokens do NOT rotate

Deliberate scope decision: non-rotating refresh tokens make concurrent refreshes (incl. multi-tab) idempotent with no cross-tab coordination. README must state: production would add rotation + reuse detection + BroadcastChannel/grace-window coordination.

### AD-6: URL search params own query state

`/dashboard/transactions?page=2&sort=createdAt&order=desc&status=flagged&from=...&to=...`
Server component reads `searchParams`, fetches via the `GET /api/transactions` Route Handler (same-origin `fetch` with the request's `cookie` header forwarded, `cache: 'no-store'`), renders. Filter/sort/pagination controls are client components calling `router.push()`. No client-side query state duplication.

### AD-7: Server render seeds a client row store

Server component passes initial page data as props → client `TransactionsTable` seeds a Zustand store keyed by transaction id (Map/record). SSE events:

- dedupe by id (keyed store makes this free)
- apply CURRENT filters before insert; non-matching events → increment a "N new" toast/counter, do not inject
- update existing rows in place (stable keys + memoized rows = only changed row re-renders)
  Navigation (page/filter change) re-seeds the store from fresh server data. NEVER `router.refresh()` on SSE events.

### AD-8: Mutations via Route Handlers (not Server Actions)

`PATCH /api/transactions/[id]` — Zod-validated body ({ flagged?, flagReason?, note? }), auth from cookie in-handler, RBAC: flag requires role === "admin" → 403 otherwise (server-enforced; hiding the button client-side is UX, not security). Client: TanStack Query mutation with onMutate optimistic update / onError rollback from snapshot / onSettled invalidate. Rollback error surfaced via sonner toast.

### AD-9: SSE via streaming Route Handler

`GET /api/transactions/stream` — verifies auth cookie in-handler (401 if invalid). ReadableStream, `text/event-stream`, setInterval 3–5s generating a fake transaction, `data: {json}\n\n`. On `request.signal` abort: clear interval, close controller (no zombie streams). Client connects in `useEffect` only (no SSR involvement → no hydration mismatch).

### AD-10: Caching = no-store, framed as understanding

Transaction fetches: `cache: 'no-store'`. README point: cookie-reading already forces dynamic rendering — we make it explicit because monitoring data must never be stale and is per-session. Note where revalidate WOULD apply (static reference pages) to show the choice was informed.

### AD-11: Mock data in lib/db.ts with globalThis

`globalThis.__db ??= { transactions: seed(), users: [...] }` — survives dev hot reload. Export pure query functions: `getTransactions({ page, pageSize, sort, order, status, from, to })` (returns { data, total }), `getTransaction(id)`, `updateTransaction(id, patch)`, `addNote(id, note)`. Route Handlers stay thin; query logic is unit-testable.
Seed ~80 transactions, varied dates (last 90 days), statuses, currencies (mostly NGN, some USD/GBP), log-distributed amounts. Transaction #3 (visible on page 1 unfiltered) has merchant = `<script>alert("xss")</script>`.
Two demo users: admin@sohcahtoa.test / analyst@sohcahtoa.test (password "password123"), roles per name. Show credentials as a hint on the login page.

## Transaction schema

```typescript
type Transaction = {
  id: string; // ULID — sortable by creation time
  reference: string; // "TXN-2026-000123"
  amount: number; // minor units (kobo/cents) — NEVER floats for money
  currency: "NGN" | "USD" | "GBP";
  type: "debit" | "credit" | "transfer";
  status: "pending" | "completed" | "failed" | "flagged";
  merchant: string;
  cardLast4: string; // only last 4 ever exists anywhere — strongest masking story
  senderAccountMasked: string; // "0123••••89"
  channel: "card" | "bank_transfer" | "ussd" | "pos";
  riskScore: number; // 0–100; generator mostly 5–40, rare 80+ spikes
  flagged: boolean;
  flagReason: string | null;
  notes: Note[];
  createdAt: string; // ISO 8601 — strings across RSC boundary
  updatedAt: string;
};

type Note = {
  id: string;
  authorId: string;
  authorRole: "admin" | "analyst";
  body: string; // rendered as text — XSS-safe surface #2
  createdAt: string;
};
```

Note: `status: "flagged"` AND boolean `flagged` is deliberate denormalization — status drives the filter chip, boolean+reason is the mutation target; flagging sets both. Mentioned in README as a mock simplification.

## Security requirements checklist (§5 of brief — all mandatory)

- [ ] XSS: React default escaping; NO dangerouslySetInnerHTML anywhere; demo row seeded; README explanation (React escapes text + API returns JSON not HTML)
- [ ] Session: refresh failure → clear cookies, redirect, block further API calls (logged-out flag), abort in-flight (AbortController), close SSE
- [ ] CSRF: SameSite=Lax on all auth cookies; README explains why this mitigates cross-site POST
- [ ] Sensitive data: only cardLast4 exists; amounts/cards masked in UI; NEVER log tokens (no console.log of auth material anywhere); tokens httpOnly

## API conventions

- Typed request/response for every handler; shared types in `types/`
- Zod-validate ALL input (body, searchParams) → 400 with normalized error shape on failure
- Error shape: `{ error: { code: string, message: string } }` everywhere
- Honest status codes: 400 bad input, 401 expired/missing auth, 403 wrong role, 404 unknown id
- No token values in logs or error messages

## Testing (Vitest, ~6 tests)

1. **Refresh mutex** (the money test): mock fetch, 3 concurrent 401s → refresh endpoint called exactly once, all 3 originals retried
2. Query logic: pagination math, sort correctness, date-range filter (2–3 tests on pure db functions)
3. RBAC: PATCH with analyst token → 403

Skip component/E2E tests. README notes Playwright would cover auth redirects in production.

## Build order

1. Scaffold + fonts + tokens (globals.css @theme) + lib/db.ts seed
2. Auth: jose utils → login/refresh/logout handlers → middleware
3. Login page (bespoke, DESIGN.md §4)
4. Shell: Sidebar/Topbar/layout (server components)
5. Task 1 home screen (two states wired)
6. Transactions Route Handler (pagination/sort/filter via query fns)
7. Server transactions page + client table seeded from props
8. Client controls: FilterBar/Pagination → URL params
9. SSE: stream handler + use-transaction-stream hook + LiveIndicator
10. DetailSheet + PATCH mutation + optimistic/rollback + RBAC
11. api-client wrapper (mutex/abort/logout flag) wired through
12. Tests
13. README (see below)

## README requirements (evaluated deliverable — walkthrough will probe it)

Structure as decision records: AD-1 through AD-11 above, each with chosen approach / alternative considered / why. Must explicitly cover (brief demands these):

- Refresh race condition prevention (single-flight mutex) + multi-tab note (AD-5)
- XSS mitigation approach
- CSRF strategy (SameSite=Lax)
- Caching choice rationale (AD-10)
- Middleware limitations (Edge runtime, only protects matched routes, no heavy crypto/state)
- Task 1 vs Task 2 page mapping (which routes answer which task)
- Demo credentials + how to run

## Hard rules

- No `"use client"` without a stated reason (comment or obvious interactivity)
- No red in the UI (see DESIGN.md — debits are near-black, palette has no red)
- No floats for money; format at display edge with Intl.NumberFormat
- No date formatting that differs between server and client render (hydration)
- No dangerouslySetInnerHTML
- No console.log of tokens/cookies
- No Pages Router APIs (getServerSideProps etc.)
