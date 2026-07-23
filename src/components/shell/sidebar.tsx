import Image from "next/image";
import { Calculator, CircleHelp, CreditCard, House, ArrowLeftRight } from "lucide-react";
import { NavItem } from "@/components/shell/nav-item";
import { UserBlock } from "@/components/shell/user-block";

const ICON_SIZE = 18;

const NAV_ITEMS = [
  {
    href: "/dashboard/home",
    label: "Home",
    icon: <House size={ICON_SIZE} strokeWidth={2} />,
  },
  {
    href: "/dashboard/calculator",
    label: "Calculator",
    icon: <Calculator size={ICON_SIZE} strokeWidth={2} />,
  },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    icon: <ArrowLeftRight size={ICON_SIZE} strokeWidth={2} />,
  },
  {
    href: "/dashboard/cards",
    label: "Cards",
    icon: <CreditCard size={ICON_SIZE} strokeWidth={2} />,
    badge: 2,
  },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="p-5">
        <Image src="/logo.svg" alt="SohCahToa Payout BDC" width={108} height={44} priority />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      <div className="flex flex-col gap-3 p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-text-secondary">
          <span className="flex size-7 items-center justify-center">
            <CircleHelp size={18} strokeWidth={2} />
          </span>
          Support
        </div>

        <UserBlock />
      </div>
    </aside>
  );
}
