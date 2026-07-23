"use client";
// Client component: opens a dropdown and calls logout() on click.

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSession } from "@/hooks/use-session";

const ROLE_LABEL = {
  admin: "Admin",
  analyst: "Analyst",
} as const;

type Props = {
  collapsed?: boolean;
};

export function UserBlock({ collapsed }: Props) {
  const { user, logout } = useSession();

  const trigger = (
    <DropdownMenuTrigger
      aria-label={collapsed ? user.name : undefined}
      className={`flex items-center gap-3 rounded-xl border border-transparent py-2 text-left outline-none transition-colors hover:border-border hover:bg-canvas data-[state=open]:border-border data-[state=open]:bg-canvas ${
        collapsed ? "w-fit px-1" : "w-full px-3"
      }`}
    >
      <Image
        src="/avatar.svg"
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0 rounded-full"
      />
      {!collapsed && (
        <>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">
              {user.name}
            </p>
            <p className="truncate text-xs text-text-secondary">{user.email}</p>
          </div>
          <ChevronDown size={16} className="shrink-0 text-text-secondary" />
        </>
      )}
    </DropdownMenuTrigger>
  );

  return (
    <DropdownMenu>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="right">{user.name}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuLabel className="text-xs text-text-secondary">
          Signed in as {ROLE_LABEL[user.role]}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void logout()}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
