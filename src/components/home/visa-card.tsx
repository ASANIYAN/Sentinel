// Pure CSS card art (DESIGN.md §3) — no image assets.

type Props = {
  cardLast4: string;
  validThru: string;
  balance: string;
  name: string;
};

export function VisaCard({ cardLast4, validThru, balance, name }: Props) {
  return (
    <div
      className="relative flex h-44 flex-1 flex-col justify-between overflow-hidden rounded-2xl p-5 text-white"
      style={{
        background:
          "linear-gradient(135deg, #FF9A56 0%, #FF6813 55%, #C24A05 100%)",
      }}
    >
      {/* Diagonal translucent overlay shapes. */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-4 top-0 h-full w-20 -skew-x-12 bg-white/10" />
        <div className="absolute -right-16 top-0 h-full w-14 -skew-x-12 bg-white/10" />
      </div>

      <div className="relative flex items-start justify-between">
        <div className="flex flex-col gap-3">
          <span className="text-xs opacity-90">Prepaid card</span>
          <span className="h-5 w-7 rounded-[4px] bg-gradient-to-br from-yellow-100 to-yellow-300" />
        </div>
        <span className="font-display text-lg font-bold italic">VISA</span>
      </div>

      <div className="relative flex items-end justify-between">
        <div>
          <p className="font-mono text-sm tracking-widest">•••• {cardLast4}</p>
          <p className="mt-1 text-[9px] font-medium uppercase leading-tight opacity-80">
            Valid
            <br />
            Thru
            <br />
            {validThru}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-bold">{balance}</p>
          <p className="text-xs opacity-90">{name}</p>
        </div>
      </div>
    </div>
  );
}
