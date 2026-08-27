"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Übersicht", getHref: (teamId: string) => `/teams/${teamId}` },
  { label: "Trainings & Events", getHref: (teamId: string) => `/teams/${teamId}/events` },
  { label: "Mitglieder", getHref: (teamId: string) => `/teams/${teamId}/members` }
];

type TeamTabsProps = {
  teamId: string;
};

export function TeamTabs({ teamId }: TeamTabsProps) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-border/70 bg-background/40 p-1">
      {tabs.map((tab) => {
        const href = tab.getHref(teamId);
        const isOverview = href === `/teams/${teamId}`;
        const isActive = isOverview
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex whitespace-nowrap rounded-lg border px-3.5 py-2 text-sm font-semibold transition-all",
              isActive
                ? "border-primary/10 bg-primary/12 text-primary"
                : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
