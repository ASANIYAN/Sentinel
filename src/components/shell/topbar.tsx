import Image from "next/image";
import { Bell, Search } from "lucide-react";

// Fixed time zone: matches lib/format.ts, so server-rendered greeting never
// disagrees with a client re-render (no hydration mismatch).
const TIME_ZONE = "Africa/Lagos";

function greeting(): { text: string; emoji: string } {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: TIME_ZONE,
    }).format(new Date()),
  );

  if (hour < 12) return { text: "Good morning", emoji: "🌤️" };
  if (hour < 17) return { text: "Good afternoon", emoji: "⛅" };
  return { text: "Good evening", emoji: "🌙" };
}

type Props = {
  name: string;
};

// Server component: the greeting is computed once at request time.
export function Topbar({ name }: Props) {
  const { text, emoji } = greeting();

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Image
          src="/avatar.svg"
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-full"
        />
        <div>
          <p className="text-sm text-text-secondary">
            {text} {emoji}
          </p>
          <p className="text-base font-semibold text-text-primary">{name}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex w-72 items-center gap-2 rounded-[--radius-pill] border border-border bg-surface px-4 py-2.5 text-text-secondary">
          <Search size={16} />
          <span className="flex-1 text-sm">Search</span>
          <span className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px]">
            ⌘K
          </span>
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary"
        >
          <Bell size={18} />
          {/* Static mock count — no notifications feature is in scope. */}
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-[--radius-pill] bg-accent text-[10px] font-semibold text-white">
            9
          </span>
        </button>
      </div>
    </header>
  );
}
