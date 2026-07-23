"use client";
// Client component: usePathname is a hook, needed to derive active state.

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
};

export function NavItem({ href, label, icon, badge }: Props) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-accent-soft text-accent font-medium"
          : "text-text-secondary hover:bg-canvas"
      }`}
    >
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
          active ? "bg-accent text-white" : "text-text-secondary"
        }`}
      >
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span className="flex size-5 items-center justify-center rounded-[--radius-pill] bg-accent text-[11px] font-semibold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}
