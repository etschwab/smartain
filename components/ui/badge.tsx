import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "muted" | "success" | "danger" | "outline";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        {
          "bg-primary/10 text-primary": variant === "default",
          "bg-muted/90 text-muted-foreground": variant === "muted",
          "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200": variant === "success",
          "bg-rose-500/10 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200": variant === "danger",
          "border border-border bg-transparent text-foreground": variant === "outline"
        },
        className
      )}
      {...props}
    />
  );
}
