// Dev-only reference page for S-002 acceptance: renders every font role and
// palette token. Not linked from the app; remove before submission if desired.

const swatches = [
  ["canvas", "bg-canvas border"],
  ["surface", "bg-surface border"],
  ["border", "bg-border"],
  ["text-primary", "bg-text-primary"],
  ["text-secondary", "bg-text-secondary"],
  ["accent", "bg-accent"],
  ["accent-soft", "bg-accent-soft border"],
  ["positive", "bg-positive"],
  ["positive-soft", "bg-positive-soft border"],
  ["positive-muted", "bg-positive-muted"],
  ["dark-pill", "bg-dark-pill"],
] as const;

export default function DesignTestPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 p-8">
      <section className="flex flex-col gap-3">
        <h1 className="font-display text-2xl font-semibold">Design tokens</h1>
        <p className="text-sm text-text-secondary">
          Every palette color and font role from DESIGN.md, rendered once.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Palette</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {swatches.map(([name, cls]) => (
            <div key={name} className="flex items-center gap-3">
              <div className={`size-10 rounded-(--radius-control) ${cls}`} />
              <span className="font-mono text-xs text-text-secondary">
                {name}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-(--radius-card) border border-border bg-surface p-6 shadow-(--shadow-card)">
        <h2 className="text-base font-semibold">Font roles</h2>
        <p className="font-sans text-sm">
          Inter (font-sans) — body, nav, table content, labels.
        </p>
        <p className="font-display text-[40px] font-bold leading-none tabular-nums">
          67,048<span className="text-2xl font-medium">.00</span>
        </p>
        <p className="font-mono text-sm tabular-nums">
          Geist Mono (font-mono) — TXN-2026-000123 · •••• 7093 · ⌘K
        </p>
        <p className="text-xs text-text-secondary">
          Caption / timestamp — Fri, Apr 18, 2025 • 7:32PM
        </p>
        <p className="text-sm">
          <span className="text-positive tabular-nums">+$1,250.00</span>{" "}
          <span className="text-text-primary tabular-nums">-$980.00</span>{" "}
          <span className="text-text-secondary">
            (credit green, debit near-black — never red)
          </span>
        </p>
      </section>
    </main>
  );
}
