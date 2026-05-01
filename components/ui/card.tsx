import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-border/80 bg-card text-card-foreground shadow-[0_18px_45px_-34px_rgba(15,23,42,0.42)]",
        className
      )}
      {...props}
    />
  );
}
