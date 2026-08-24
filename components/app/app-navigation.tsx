"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Start", icon: LayoutDashboard },
  { href: "/calendar", label: "Termine", icon: CalendarDays },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/inbox", label: "Inbox", icon: Bell },
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
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
              direction === "column" && "justify-between px-5 py-3",
              compact && "h-full min-w-0 flex-col justify-center gap-0.5 rounded-full px-1 py-1 text-[clamp(0.5rem,2.1vw,0.62rem)] leading-none",
              isActive && !compact && "border-white/10 bg-white/[0.07] text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_8px_24px_rgb(0_0_0/0.16)]",
              isActive && compact && "border-transparent bg-primary/[0.12] text-primary shadow-[inset_0_0_0_1px_rgb(243_63_85/0.08)]",
              !isActive && "border-transparent text-muted-foreground hover:-translate-y-px hover:bg-white/[0.06] hover:text-foreground"
            )}
          >
            <Icon className={cn("h-4 w-4 transition-transform duration-200 group-hover:scale-110", compact && "h-5 w-5")} />
            {item.label}
            {isActive && !compact ? <span aria-hidden="true" className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
