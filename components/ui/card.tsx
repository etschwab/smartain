import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-border/80 bg-card text-card-foreground shadow-[0_20px_80px_-32px_rgba(15,23,42,0.35)]",
        className
      )}
      {...props}
    />
  );
}
