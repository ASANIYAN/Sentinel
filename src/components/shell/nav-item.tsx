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
  disabled?: boolean;
};

export function NavItem({ href, label, icon, badge, disabled }: Props) {
  const pathname = usePathname();
  const active =
    !disabled && (pathname === href || pathname?.startsWith(`${href}/`));

  const content = (
    <>
      <span className="flex size-7 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span
          className={`flex size-5 items-center justify-center rounded-[100px] text-[11px] font-semibold ${
            disabled ? "bg-border text-text-secondary" : "bg-accent text-white"
          }`}
        >
          {badge}
        </span>
      )}
    </>
  );

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        title="Not part of this build"
        className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm text-text-secondary/50"
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-accent-soft text-accent font-medium"
          : "text-text-secondary hover:bg-canvas"
      }`}
    >
      {content}
    </Link>
  );
}
