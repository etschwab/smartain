import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "muted" | "success" | "danger" | "outline";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        {
          "bg-primary/10 text-primary": variant === "default",
          "bg-muted text-muted-foreground": variant === "muted",
          "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300": variant === "success",
          "bg-rose-500/15 text-rose-600 dark:bg-rose-400/20 dark:text-rose-300": variant === "danger",
          "border border-border bg-transparent text-foreground": variant === "outline"
        },
        className
      )}
      {...props}
    />
  );
}
