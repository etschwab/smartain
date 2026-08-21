import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-12 w-full rounded-none border border-border bg-background/80 px-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30",
        className
      )}
      {...props}
    />
  );
}
