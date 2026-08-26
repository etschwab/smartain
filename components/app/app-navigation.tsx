"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, ChevronRight, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Start", hint: "Dein Überblick", icon: LayoutDashboard },
  { href: "/calendar", label: "Termine", hint: "Plan & Spiel", icon: CalendarDays },
  { href: "/teams", label: "Teams", hint: "Deine Kabinen", icon: Users },
  { href: "/inbox", label: "Inbox", hint: "Offene Aktionen", icon: Bell },
  { href: "/profile", label: "Profil", hint: "Konto & Status", icon: ShieldCheck }
];

type AppNavigationProps = {
  variant?: "sidebar" | "mobile";
  onNavigate?: () => void;
};

export function AppNavigation({ variant = "sidebar", onNavigate }: AppNavigationProps) {
  const pathname = usePathname();
  const isMobile = variant === "mobile";

  return (
    <nav
      aria-label="App-Navigation"
      className={cn(isMobile ? "grid h-full grid-cols-5 gap-1" : "flex flex-col gap-1.5")}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative min-w-0 transition-all duration-200",
              isMobile
                ? "flex h-full flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[0.62rem] font-semibold leading-none"
                : "flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5",
              isActive && !isMobile &&
                "border-primary/15 bg-[linear-gradient(90deg,hsl(var(--primary)/0.13),hsl(var(--primary)/0.03))] text-foreground shadow-[inset_3px_0_0_hsl(var(--primary))]",
              isActive && isMobile && "bg-primary/[0.13] text-primary",
              !isActive && "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "grid shrink-0 place-items-center transition-all duration-200",
                isMobile ? "h-6 w-6" : "h-9 w-9 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.07]",
                isActive && !isMobile && "bg-primary/15 text-primary"
              )}
            >
              <Icon className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
            </span>
            {isMobile ? (
              item.label
            ) : (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-0.5 block text-[0.68rem] text-muted-foreground">{item.hint}</span>
                </span>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-60",
                    isActive && "translate-x-0 text-primary opacity-80"
                  )}
                />
              </>
            )}
            {isActive && isMobile ? (
              <span aria-hidden="true" className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-primary" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
