import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[30px] border border-border/80 bg-card/95 text-card-foreground shadow-[0_30px_80px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}
