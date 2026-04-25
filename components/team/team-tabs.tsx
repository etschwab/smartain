"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Uebersicht", getHref: (teamId: string) => `/teams/${teamId}` },
  { label: "Mitglieder", getHref: (teamId: string) => `/teams/${teamId}/members` },
  { label: "Termine", getHref: (teamId: string) => `/teams/${teamId}/events` },
  { label: "Aufgaben", getHref: (teamId: string) => `/teams/${teamId}/tasks` },
  { label: "Einstellungen", getHref: (teamId: string) => `/teams/${teamId}/settings` }
];

type TeamTabsProps = {
  teamId: string;
};

export function TeamTabs({ teamId }: TeamTabsProps) {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const href = tab.getHref(teamId);
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex rounded-full px-4 py-2 text-sm font-semibold transition-all",
              isActive ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground hover:text-primary"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
