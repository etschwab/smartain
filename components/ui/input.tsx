import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border/80 bg-background/55 px-3.5 text-sm text-foreground outline-none transition-[border-color,background-color,box-shadow] placeholder:text-muted-foreground/75 hover:bg-background/75 focus:border-primary/70 focus:bg-background focus:ring-4 focus:ring-primary/10",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
