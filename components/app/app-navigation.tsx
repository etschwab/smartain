"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/dashboard#notifications", label: "Inbox", icon: Bell },
  { href: "/dashboard#calendar", label: "Kalender", icon: CalendarDays },
  { href: "/dashboard#profile", label: "Profil", icon: ShieldCheck }
];

type AppNavigationProps = {
  direction?: "row" | "column";
  onNavigate?: () => void;
};

export function AppNavigation({ direction = "row", onNavigate }: AppNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex gap-2",
        direction === "row" ? "flex-wrap items-center" : "flex-col items-stretch"
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.href.startsWith("/dashboard#")
          ? pathname === "/dashboard"
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
              direction === "column" && "justify-between px-5 py-3",
              isActive
                ? "bg-primary text-primary-foreground shadow-[0_12px_28px_-18px_hsl(var(--primary)/0.85)]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
