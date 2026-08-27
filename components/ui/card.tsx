import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card/72 text-card-foreground shadow-[0_1rem_3rem_-2.2rem_rgb(0_0_0/0.7)] backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}
