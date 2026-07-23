import Image from "next/image";
import { NavItem } from "@/components/shell/nav-item";
import { UserBlock } from "@/components/shell/user-block";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  CalculatorIcon,
  CardsIcon,
  HomeIcon,
  SupportIcon,
  TransactionsIcon,
} from "@/components/shell/icons";

const ICON_SIZE = 18;

const NAV_ITEMS = [
  {
    href: "/dashboard/home",
    label: "Home",
    icon: <HomeIcon size={ICON_SIZE} />,
  },
  {
    href: "/dashboard/calculator",
    label: "Calculator",
    icon: <CalculatorIcon size={ICON_SIZE} />,
    disabled: true,
  },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    icon: <TransactionsIcon size={ICON_SIZE} />,
  },
  {
    href: "/dashboard/cards",
    label: "Cards",
    icon: <CardsIcon size={ICON_SIZE} />,
    badge: 2,
    disabled: true,
  },
];

type Props = {
  collapsed?: boolean;
};

export function Sidebar({ collapsed = false }: Props) {
  return (
    <TooltipProvider>
      <aside
        className={`flex h-full shrink-0 flex-col overflow-hidden rounded-(--radius-card) border border-border bg-surface shadow-(--shadow-card) transition-[width] duration-200 ease-out ${
          collapsed ? "w-20" : "w-60"
        }`}
      >
        <div className="flex items-center justify-center p-5">
          {collapsed ? (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
              S
            </span>
          ) : (
            <Image src="/logo.svg" alt="SohCahToa Payout BDC" width={108} height={44} priority />
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.href} {...item} collapsed={collapsed} />
          ))}
        </nav>

        <div
          className={`flex flex-col gap-3 border-t border-border p-3 ${
            collapsed ? "items-center" : ""
          }`}
        >
          <div
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-text-secondary ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <span className="flex size-7 shrink-0 items-center justify-center">
              <SupportIcon size={18} />
            </span>
            {!collapsed && "Support"}
          </div>

          <UserBlock collapsed={collapsed} />
        </div>
      </aside>
    </TooltipProvider>
  );
}
