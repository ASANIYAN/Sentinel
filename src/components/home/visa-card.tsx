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
  const [balanceMajor, balanceMinor] = balance.split(".");

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
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Image
              src="/chip.svg"
              alt=""
              width={44}
              height={32}
              className="h-auto w-auto"
            />
            <span className="text-sm opacity-90 font-medium">Prepaid card</span>
          </div>
          <Image
            src="/Visa_logo_white.svg"
            alt="Visa"
            width={60}
            height={20}
            className="h-auto w-auto"
          />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-base font-semibold tracking-wide">
              •••• {cardLast4}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <span className="flex flex-col text-[8px] font-medium uppercase leading-[1.1] opacity-80">
                <span>Valid</span>
                <span>Thru</span>
              </span>
              <span className="text-xs font-medium opacity-80">
                {validThru}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-bold">
              {balanceMajor}
              <span className="text-sm font-medium opacity-70">
                .{balanceMinor}
              </span>
            </p>
            <p className="text-xs opacity-90">{name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
