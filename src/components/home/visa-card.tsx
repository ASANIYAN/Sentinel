// Card art uses the exported Figma background (card_bg.png) and the
// official Visa wordmark (Visa_logo_white.svg) instead of CSS gradients.

import Image from "next/image";

type Props = {
  cardLast4: string;
  validThru: string;
  balance: string;
  name: string;
};

export function VisaCard({ cardLast4, validThru, balance, name }: Props) {
  return (
    <div className="relative aspect-1451/623 max-w-102.5 flex-1 self-start overflow-hidden rounded-2xl text-white">
      {/* aspect-ratio matches card_bg.jpg's native 1451x623 px so the box
          scales as one unit. self-start opts out of the row's default
          align-items: stretch — otherwise flex would force this card's
          height to match AddCardSlot's height regardless of aspect-ratio,
          breaking the ratio whenever available width drifted from max-w.
          AddCardSlot now stretches to match this card's height instead. */}
      <Image
        src="/card_bg.jpg"
        alt=""
        fill
        sizes="410px"
        className="object-cover"
        priority
      />

      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-3">
            <span className="text-xs opacity-90">Prepaid card</span>
            <Image src="/chip.svg" alt="" width={28} height={20} className="h-auto w-auto" />
          </div>
          <Image src="/Visa_logo_white.svg" alt="Visa" width={56} height={19} className="h-auto w-auto" />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-sm tracking-widest">
              •••• {cardLast4}
            </p>
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
    </div>
  );
}
