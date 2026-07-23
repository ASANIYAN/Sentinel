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
    <div className="relative h-44 max-w-102.5 flex-1 overflow-hidden rounded-2xl text-white">
      {/* max-w keeps the container at the artwork's own aspect ratio
          (cropped to the card edges, ~2.33:1) — without it, flex-1 could
          stretch this far wider than the source image on large screens,
          cropping the design out of view and pushing the overlay text to
          the very edge. */}
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
            <Image src="/chip.svg" alt="" width={28} height={20} />
          </div>
          <Image src="/Visa_logo_white.svg" alt="Visa" width={56} height={19} />
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
