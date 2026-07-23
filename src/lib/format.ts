import type { Currency } from "@/types/transaction";

// Fixed locale + time zone everywhere: server and client must render the
// same string or hydration fails.
const LOCALE = "en-US";
const TIME_ZONE = "Africa/Lagos";

const moneyFormatters = new Map<Currency, Intl.NumberFormat>();

/** Minor units (kobo/cents) → "₦1,234.56". Never floats for money. */
export function formatAmount(minor: number, currency: Currency): string {
  let fmt = moneyFormatters.get(currency);
  if (!fmt) {
    fmt = new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    });
    moneyFormatters.set(currency, fmt);
  }
  return fmt.format(minor / 100);
}

/** Signed display for rows: credits "+₦1,000.00", debits "-₦1,000.00". */
export function formatSignedAmount(
  minor: number,
  currency: Currency,
  type: "debit" | "credit" | "transfer",
): string {
  const sign = type === "credit" ? "+" : type === "debit" ? "-" : "";
  return sign + formatAmount(minor, currency);
}

const dateFmt = new Intl.DateTimeFormat(LOCALE, {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const timeFmt = new Intl.DateTimeFormat(LOCALE, {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: TIME_ZONE,
});

/** ISO string → "Fri, Apr 18, 2025 • 7:32PM" (DESIGN.md row format). */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${dateFmt.format(d)} • ${timeFmt.format(d).replace(" ", "")}`;
}
