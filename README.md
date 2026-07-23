# Sentinel

Sentinel is a secure transaction monitoring dashboard. It is the submission for the SohCahToa Holdings frontend assessment. The application uses Next.js with the App Router.

---

## 1. Purpose

This document tells you:

- How to install and start the application
- How to log in with the two demo accounts
- Which route answers each assessment task
- Why the architecture makes each important decision
- How the application obeys each security requirement

---

## 2. Technology

The application uses these technologies:

- Next.js (latest stable, App Router)
- TypeScript
- Route Handlers for all API endpoints
- Middleware for route protection
- React Server Components for the initial page render
- Client Components only where the page needs interaction
- Tailwind CSS v4
- Zustand, TanStack Query, Zod, jose, lucide-react

The application does not use the Pages Router.

---

## 3. Installation

Obey these steps:

1. Clone the repository.
2. Copy `.env.example` to `.env.local`.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:3000` in your browser.

To run the tests, run `npm test`.

---

## 4. Demo accounts

Use one of these accounts on the login page:

| Role    | Email                  | Password    |
| ------- | ---------------------- | ----------- |
| Admin   | admin@sohcahtoa.test   | password123 |
| Analyst | analyst@sohcahtoa.test | password123 |

The admin can flag a transaction. The analyst cannot flag a transaction. Both roles can add a note.

---

## 5. Task map

The assessment has two tasks. This table shows the route for each task:

| Task   | Route                                  | Content                                                        |
| ------ | -------------------------------------- | -------------------------------------------------------------- |
| Task 1 | `/dashboard/home`                      | Conversion of the Figma "Screens 1" layout with its two states |
| Task 2 | `/login` and `/dashboard/transactions` | The secure transaction monitoring dashboard                    |

The two Figma screens show one layout in two states. The chip selection and the dropdown change the state. Task 1 includes this interaction.

---

## 6. Architecture decisions

Each subsection gives the decision, the alternative, and the reason.

### 6.1 Token storage

**Decision:** The login Route Handler sets the tokens in httpOnly cookies. The handler sets three cookies:

- `access_token` — httpOnly, SameSite=Lax, Secure, 15 minutes
- `refresh_token` — httpOnly, SameSite=Lax, Secure, 7 days
- `token_expiry` — readable by the client, contains only the expiry time

**Alternative:** Store the tokens in localStorage.

**Reason:** JavaScript cannot read an httpOnly cookie. Thus a script injection cannot steal the tokens. The expiry time is not a secret. The client reads `token_expiry` to know when the token expires.

The login response body also returns the token fields. The assessment specifies this response shape. The client does not store these values.

### 6.2 Token format

**Decision:** The tokens are signed JWTs. The application signs them with the `jose` library and the HS256 algorithm. The payload contains `sub`, `role`, and `exp`.

**Reason:** The `jose` library operates on the Edge runtime. Thus the middleware can verify the signature and the expiry. The `role` claim is the single source for role checks.

### 6.3 Middleware

**Decision:** The middleware protects the `/dashboard/*` routes. It verifies the access token cookie. If the token is missing, invalid, or expired, the middleware redirects the user to `/login`. The middleware keeps the target path in a `from` parameter.

The middleware does not refresh tokens.

**Middleware limits:**

- The middleware operates on the Edge runtime. Node APIs are not available.
- The middleware protects only the routes that its matcher includes. Each API Route Handler verifies the auth cookie again.
- The middleware must not redirect `/login` to `/login`. The matcher prevents this loop.

### 6.4 Token refresh

**Decision:** A client fetch wrapper refreshes the token. The wrapper is in `lib/api-client.ts`.

The flow:

1. A request receives a 401 response.
2. The wrapper examines a module-scope refresh promise.
3. If no refresh is in progress, the wrapper starts one refresh and stores the promise.
4. All concurrent 401 responses await the same promise.
5. After the refresh, each request retries one time.

**How this prevents a refresh race condition:** Only one refresh promise can exist at one time. Concurrent failures share this promise. Thus the client sends only one refresh request.

**Refresh failure:** If the refresh fails, the wrapper starts the logout flow. See section 7.2.

### 6.5 Refresh token rotation

**Decision:** The refresh token does not rotate in this implementation.

**Reason:** The single-flight promise protects one browser tab. Two tabs do not share this promise. With rotation, a second tab can send a used token. A server with reuse detection then ends the session. Without rotation, concurrent refresh requests are idempotent. Thus multiple tabs stay safe without coordination.

**Production plan:** A production system must add:

- Refresh token rotation
- Reuse detection
- Tab coordination with BroadcastChannel, or a server grace window

### 6.6 Table state

**Decision:** The URL search parameters hold the page, the sort, and the filters. Example: `/dashboard/transactions?page=2&status=flagged`.

The Transactions Server Component reads the parameters, then calls `GET /api/transactions` with a same-origin `fetch`. It forwards the incoming request's cookie header, so the Route Handler can verify the session the same way it does for any other caller. The filter controls are Client Components. They only push a new URL.

**Reason:** This design gives shareable URLs. The back button restores the table state. The server and client concerns stay separate. Routing the initial load through the same Route Handler that any other client uses also keeps one validated, typed API surface for transaction reads, instead of a Server Component–only shortcut.

### 6.7 Live updates

**Decision:** The server sends Server-Sent Events (SSE) from a streaming Route Handler. A client hook receives the events.

The client obeys these rules:

- The client keeps the rows in a store with the transaction ID as the key. A duplicate event cannot make a duplicate row.
- The client applies the current filters to each event. An event that does not match the filters does not enter the table. A counter shows these events.
- The client updates only the changed row. Stable keys and memoized rows limit the render.
- The client connects to the stream only in `useEffect`. Thus the server HTML and the first client render are equal. This prevents a hydration mismatch.

### 6.8 Mutations

**Decision:** Mutations use a PATCH Route Handler, not a Server Action.

**Reason:** The assessment requires typed and validated Route Handlers. One API surface keeps the validation and the error shape consistent. The SameSite cookie protection then covers all mutations.

The client applies an optimistic update. If the server rejects the mutation, the client restores the previous state and shows a toast.

**Role check:** The handler reads the role from the token. Only the admin role can flag a transaction. Other roles receive a 403 response. The server enforces this rule. The hidden button in the analyst view is only a UI convenience.

### 6.9 Caching

**Decision:** The transaction data uses `no-store`. The dashboard routes render dynamically.

**Reason:** The pages read cookies. Cookie access already makes a route dynamic. The `no-store` option makes this decision explicit on the `fetch` call to `GET /api/transactions` as well. Monitoring data must not be stale. The data is also different for each session.

A static page with shared content would use `revalidate` instead. This application has no such page.

---

## 7. Security requirements

This section maps each requirement in assessment section 5 to the implementation.

### 7.1 XSS

One seeded transaction contains `<script>alert("xss")</script>` in the merchant field.

The protection:

- React escapes all text content. The browser shows the payload as text. The script does not run.
- The code does not use `dangerouslySetInnerHTML`.
- The API returns JSON, not HTML. Thus the server has no injection surface.
- The note body is also user content. The application renders it as text.

### 7.2 Session handling

When the token expires and the refresh fails, the client:

1. Calls the logout Route Handler. The handler clears the cookies.
2. Aborts all in-flight requests with an AbortController.
3. Closes the SSE connection.
4. Sets a logged-out flag. The fetch wrapper then refuses new requests.
5. Redirects the user to `/login`.

### 7.3 CSRF

The auth cookies use `SameSite=Lax`. A cross-site POST request does not include these cookies. Thus a hostile site cannot send an authenticated mutation. This is the primary CSRF protection.

### 7.4 Sensitive data

- The database stores only the last four digits of a card number. The full number does not exist in the system. The API cannot leak it.
- The UI shows the card as `•••• 4242`.
- The account numbers are masked.
- The code does not log tokens or cookies.
- JavaScript cannot read the token cookies. Only the `token_expiry` cookie is readable, and it contains no secret.

---

## 8. API conventions

All Route Handlers obey these rules:

- Zod validates all input. Invalid input receives a 400 response.
- All errors use one shape: `{ "error": { "code": "...", "message": "..." } }`.
- The status codes are honest: 400 for bad input, 401 for missing or expired auth, 403 for an insufficient role, 404 for an unknown ID.

---

## 9. Tests

Run `npm test`. The suite contains:

- The refresh mutex test. Three concurrent 401 responses cause exactly one refresh call.
- The query function tests: pagination, sort, and date-range filter.
- The role test. A PATCH request with the analyst role receives a 403 response.

A production system would add Playwright tests for the auth redirect flows.

---

## 10. Known simplifications

These are deliberate scope decisions for a mock backend:

- The refresh token does not rotate.
- The database is in memory. A restart clears the flag and note changes.
- The `status` field and the `flagged` field overlap. The filter uses `status`. The mutation uses `flagged`. The flag action sets both.
