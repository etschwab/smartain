import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-none border border-border/80 bg-card/85 text-card-foreground shadow-none backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}
