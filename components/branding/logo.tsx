import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  href?: string;
};

export function Logo({ className, href = "/" }: LogoProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)}>
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-[0_14px_28px_-14px_hsl(var(--primary)/0.8)]">
        ST
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-muted-foreground">SMARTRAIN</span>
        <span className="text-base font-semibold text-foreground">Team Management</span>
      </span>
    </Link>
  );
}
