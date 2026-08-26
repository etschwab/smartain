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
    <div className="flex gap-2 overflow-x-auto pb-1">
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
