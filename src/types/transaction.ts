export type Currency = "NGN" | "USD" | "GBP";

export type TransactionType = "debit" | "credit" | "transfer";

export type TransactionStatus = "pending" | "completed" | "failed" | "flagged";

export type Channel = "card" | "bank_transfer" | "ussd" | "pos";

export type Role = "admin" | "analyst";

export type Note = {
  id: string;
  authorId: string;
  authorRole: Role;
  body: string; // rendered as text — XSS-safe surface
  createdAt: string; // ISO 8601
};

export type Transaction = {
  id: string; // ULID — sortable by creation time
  reference: string; // "TXN-2026-000123"
  amount: number; // minor units (kobo/cents) — never floats for money
  currency: Currency;
  type: TransactionType;
  status: TransactionStatus;
  merchant: string;
  cardLast4: string; // only the last 4 digits ever exist anywhere
  senderAccountMasked: string; // "0123••••89"
  channel: Channel;
  riskScore: number; // 0–100
  flagged: boolean;
  flagReason: string | null;
  notes: Note[];
  createdAt: string; // ISO 8601 — strings across the RSC boundary
  updatedAt: string;
};
