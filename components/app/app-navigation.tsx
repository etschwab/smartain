"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/inbox", label: "Inbox", icon: Bell },
  { href: "/calendar", label: "Kalender", icon: CalendarDays },
  { href: "/profile", label: "Profil", icon: ShieldCheck }
];

type AppNavigationProps = {
  direction?: "row" | "column";
  compact?: boolean;
  onNavigate?: () => void;
};

export function AppNavigation({ direction = "row", compact = false, onNavigate }: AppNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="App-Navigation"
      className={cn(
        compact ? "grid h-full grid-cols-5 gap-0" : "flex gap-1",
        !compact && (direction === "row" ? "flex-wrap items-center" : "flex-col items-stretch")
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              direction === "column" && "justify-between px-5 py-3",
              compact && "h-full min-w-0 flex-col justify-center gap-0.5 rounded-full px-1 py-1 text-[clamp(0.5rem,2.1vw,0.62rem)] leading-none",
              isActive && !compact && "border-white/15 text-foreground",
              isActive && compact && "border-transparent bg-primary/10 text-primary",
              !isActive && "border-transparent text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
            )}
          >
            <Icon className={cn("h-4 w-4", compact && "h-5 w-5")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
