"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Übersicht", getHref: (teamId: string) => `/teams/${teamId}` },
  { label: "Mitglieder", getHref: (teamId: string) => `/teams/${teamId}/members` },
  { label: "Termine", getHref: (teamId: string) => `/teams/${teamId}/events` },
  { label: "Aufgaben", getHref: (teamId: string) => `/teams/${teamId}/tasks` }
];

type TeamTabsProps = {
  teamId: string;
  showAdmin?: boolean;
};

export function TeamTabs({ teamId, showAdmin = false }: TeamTabsProps) {
  const pathname = usePathname();
  const allTabs = showAdmin
    ? [...tabs, { label: "Admin", getHref: (currentTeamId: string) => `/teams/${currentTeamId}/admin` }]
    : tabs;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {allTabs.map((tab) => {
        const href = tab.getHref(teamId);
        const isActive = pathname === href || (href.endsWith("/admin") && pathname === `/teams/${teamId}/settings`);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-all",
              isActive
                ? "border-primary/10 bg-primary text-primary-foreground shadow-[0_12px_28px_-18px_hsl(var(--primary)/0.85)]"
                : "border-border bg-background/75 text-card-foreground hover:border-primary/25 hover:text-primary"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
