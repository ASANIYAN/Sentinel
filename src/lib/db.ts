import { ulid } from "ulid";
import type {
  Channel,
  Currency,
  Note,
  Role,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/types/transaction";
import type { TransactionsQuery } from "@/lib/validators";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  // Plain text is a mock simplification — production stores a hash.
  password: string;
};

type Db = {
  transactions: Transaction[];
  users: User[];
};

declare global {
  var __db: Db | undefined;
}

// Deterministic PRNG so the seed is stable across reloads and tests.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MERCHANTS = [
  "Shoprite Lekki",
  "Jumia NG",
  "MTN Airtime",
  "Uber Lagos",
  "Chicken Republic",
  "Netflix",
  "Total Energies",
  "Spar Ikeja",
  "PiggyVest",
  "Bolt Food",
  "Amazon UK",
  "Eko Hotel",
  "GIGM Transport",
  "Filmhouse Cinemas",
  "Konga",
];

const CURRENCIES: Currency[] = ["NGN", "NGN", "NGN", "NGN", "USD", "GBP"];
const TYPES: TransactionType[] = ["debit", "credit", "transfer"];
const STATUSES: TransactionStatus[] = [
  "completed",
  "completed",
  "completed",
  "pending",
  "failed",
  "flagged",
];
const CHANNELS: Channel[] = ["card", "bank_transfer", "ussd", "pos"];

const SEED_COUNT = 80;
const NOW = Date.parse("2026-07-23T12:00:00Z");
const DAY = 86_400_000;

function seedTransactions(): Transaction[] {
  const rand = mulberry32(20260723);
  const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

  const txns: Transaction[] = [];
  for (let i = 0; i < SEED_COUNT; i++) {
    // Newest first: index i is the i-th newest, spread over ~90 days.
    const createdMs = NOW - Math.floor(rand() * 90 * DAY);
    const status = pick(STATUSES);
    // Log-distributed minor units: ~1_000 to ~10_000_000 (₦10 to ₦100k).
    const amount = Math.round(10 ** (3 + rand() * 4));
    // Mostly 5–40, rare 80+ spikes.
    const riskScore =
      rand() < 0.07 ? 80 + Math.floor(rand() * 20) : 5 + Math.floor(rand() * 36);
    const flagged = status === "flagged";
    const createdAt = new Date(createdMs).toISOString();

    txns.push({
      id: ulid(createdMs),
      reference: `TXN-2026-${String(i + 1).padStart(6, "0")}`,
      amount,
      currency: pick(CURRENCIES),
      type: pick(TYPES),
      status,
      merchant: pick(MERCHANTS),
      cardLast4: String(1000 + Math.floor(rand() * 9000)),
      senderAccountMasked: `0${Math.floor(rand() * 900) + 100}••••${
        Math.floor(rand() * 90) + 10
      }`,
      channel: pick(CHANNELS),
      riskScore,
      flagged,
      flagReason: flagged ? "Unusual amount for this merchant" : null,
      notes: [],
      createdAt,
      updatedAt: createdAt,
    });
  }

  txns.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  // Third-newest row — visible on page 1 unfiltered — is the XSS demo.
  txns[2].merchant = '<script>alert("xss")</script>';
  return txns;
}

function seedUsers(): User[] {
  return [
    {
      id: "usr_admin",
      email: "admin@sohcahtoa.test",
      name: "Ade Admin",
      role: "admin",
      password: "password123",
    },
    {
      id: "usr_analyst",
      email: "analyst@sohcahtoa.test",
      name: "Ada Analyst",
      role: "analyst",
      password: "password123",
    },
  ];
}

function db(): Db {
  globalThis.__db ??= { transactions: seedTransactions(), users: seedUsers() };
  return globalThis.__db;
}

export function getTransactions(params: TransactionsQuery): {
  data: Transaction[];
  total: number;
} {
  const { page, pageSize, sort, order, status, from, to } = params;

  let rows = db().transactions;
  if (status) rows = rows.filter((t) => t.status === status);
  // ISO 8601 strings compare correctly as strings.
  if (from) rows = rows.filter((t) => t.createdAt >= from);
  if (to) rows = rows.filter((t) => t.createdAt <= to);

  const dir = order === "asc" ? 1 : -1;
  rows = [...rows].sort((a, b) => {
    const av = a[sort];
    const bv = b[sort];
    return av < bv ? -dir : av > bv ? dir : 0;
  });

  const start = (page - 1) * pageSize;
  return { data: rows.slice(start, start + pageSize), total: rows.length };
}

export function getTransaction(id: string): Transaction | undefined {
  return db().transactions.find((t) => t.id === id);
}

export function updateTransaction(
  id: string,
  patch: { flagged?: boolean; flagReason?: string | null },
): Transaction | undefined {
  const txn = getTransaction(id);
  if (!txn) return undefined;

  if (patch.flagged !== undefined) {
    txn.flagged = patch.flagged;
    txn.flagReason = patch.flagged ? (patch.flagReason ?? null) : null;
    // Denormalized on purpose: the boolean drives the mutation, the status
    // drives the filter chip. Flagging sets both.
    txn.status = patch.flagged ? "flagged" : "completed";
  }
  txn.updatedAt = new Date().toISOString();
  return txn;
}

export function addNote(
  id: string,
  note: { authorId: string; authorRole: Role; body: string },
): Transaction | undefined {
  const txn = getTransaction(id);
  if (!txn) return undefined;

  const created: Note = {
    id: ulid(),
    ...note,
    createdAt: new Date().toISOString(),
  };
  txn.notes = [...txn.notes, created];
  txn.updatedAt = created.createdAt;
  return txn;
}

export function addTransaction(txn: Transaction): void {
  db().transactions.unshift(txn);
}

/** One realistic transaction for the SSE stream (AD-9) — genuinely random,
 * unlike the deterministic seed. */
export function generateTransaction(): Transaction {
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  const now = new Date().toISOString();
  const amount = Math.round(10 ** (3 + Math.random() * 4));
  const riskScore =
    Math.random() < 0.07
      ? 80 + Math.floor(Math.random() * 20)
      : 5 + Math.floor(Math.random() * 36);
  const status = pick(STATUSES);
  const flagged = status === "flagged";

  return {
    id: ulid(),
    reference: `TXN-2026-${String(Math.floor(Math.random() * 999_999)).padStart(6, "0")}`,
    amount,
    currency: pick(CURRENCIES),
    type: pick(TYPES),
    status,
    merchant: pick(MERCHANTS),
    cardLast4: String(1000 + Math.floor(Math.random() * 9000)),
    senderAccountMasked: `0${Math.floor(Math.random() * 900) + 100}••••${
      Math.floor(Math.random() * 90) + 10
    }`,
    channel: pick(CHANNELS),
    riskScore,
    flagged,
    flagReason: flagged ? "Unusual amount for this merchant" : null,
    notes: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function getUserByEmail(email: string): User | undefined {
  return db().users.find((u) => u.email === email);
}

export function getUserById(id: string): User | undefined {
  return db().users.find((u) => u.id === id);
}

/** Test-only: drop the store so the next access re-seeds. */
export function resetDb(): void {
  globalThis.__db = undefined;
}
