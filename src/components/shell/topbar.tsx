import Image from "next/image";
import { NotificationIcon, SearchIcon } from "@/components/shell/icons";

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
    <header className="flex items-center justify-between gap-4 rounded-(--radius-card) border border-border bg-surface p-4 shadow-(--shadow-card)">
      <div className="flex min-w-0 items-center gap-3">
        <Image
          src="/avatar.svg"
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-full"
        />
        <div className="min-w-0">
          <p className="truncate text-sm text-text-secondary">
            {text} {emoji}
          </p>
          <p className="truncate text-base font-semibold text-text-primary">{name}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden w-40 items-center gap-2 rounded-(--radius-pill) border border-border bg-canvas px-4 py-2.5 text-text-secondary sm:flex md:w-56 lg:w-72">
          <SearchIcon size={16} className="shrink-0" />
          <span className="flex-1 truncate text-sm">Search</span>
          <span className="hidden rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] md:block">
            ⌘K
          </span>
        </div>

        <button
          type="button"
          aria-label="Search"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-canvas text-text-secondary sm:hidden"
        >
          <SearchIcon size={18} />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-10 items-center justify-center rounded-full border border-border bg-canvas text-text-primary"
        >
          <NotificationIcon size={18} />
          {/* Static mock count — no notifications feature is in scope. */}
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-(--radius-pill) bg-accent text-[10px] font-semibold text-white">
            9
          </span>
        </button>
      </div>
    </header>
  );
}
