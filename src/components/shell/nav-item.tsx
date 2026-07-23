"use client";
// Client component: usePathname is a hook, needed to derive active state.

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  disabled?: boolean;
  collapsed?: boolean;
};

export function NavItem({
  href,
  label,
  icon,
  badge,
  disabled,
  collapsed,
}: Props) {
  const pathname = usePathname();
  const active =
    !disabled && (pathname === href || pathname?.startsWith(`${href}/`));

  const content = (
    <>
      <span className="relative flex size-7 shrink-0 items-center justify-center">
        {icon}
        {collapsed && badge !== undefined && (
          <span
            className={`absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-[100px]! text-[9px] font-semibold ${
              disabled ? "bg-accent text-white" : "bg-accent text-white"
            }`}
          >
            {badge}
          </span>
        )}
      </span>
      {!collapsed && <span className="flex-1">{label}</span>}
      {!collapsed && badge !== undefined && (
        <span
          className={`flex size-5 items-center justify-center text-[11px] font-semibold rounded-[100px]! ${
            disabled ? "bg-accent text-white" : "bg-accent text-white"
          }`}
        >
          {badge}
        </span>
      )}
    </>
  );

  const itemClassName = `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
    collapsed ? "justify-center" : ""
  } ${
    disabled
      ? "cursor-not-allowed text-text-secondary/50"
      : active
        ? "bg-accent-soft text-accent font-medium"
        : "text-text-secondary hover:bg-canvas"
  }`;

  const item = disabled ? (
    <span aria-disabled="true" className={itemClassName}>
      {content}
    </span>
  ) : (
    <Link
      href={href}
      aria-label={collapsed ? label : undefined}
      className={itemClassName}
    >
      {content}
    </Link>
  );

  if (!collapsed) return item;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{item}</TooltipTrigger>
      <TooltipContent side="right">
        {label}
        {disabled && " (not part of this build)"}
      </TooltipContent>
    </Tooltip>
  );
}
