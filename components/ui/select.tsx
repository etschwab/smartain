import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-xl border border-border/80 bg-background/55 px-3.5 text-sm text-foreground outline-none transition-[border-color,background-color,box-shadow] hover:bg-background/75 focus:border-primary/70 focus:bg-background focus:ring-4 focus:ring-primary/10",
        className
      )}
      {...props}
    />
  );
}
