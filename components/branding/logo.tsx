import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  href?: string;
  compact?: boolean;
};

export function Logo({ className, href = "/", compact = false }: LogoProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)} aria-label="Smartrain Startseite">
      <span className="grid h-10 min-w-[5.45rem] place-items-center rounded-full bg-primary px-4 text-sm font-black tracking-[-0.04em] text-primary-foreground transition-transform duration-200 hover:scale-[1.03]">
        ST
      </span>
      {!compact ? (
        <span className="flex flex-col leading-tight">
          <span className="text-xs font-bold tracking-[0.12em] text-primary">SMARTRAIN</span>
          <span className="text-sm font-semibold text-foreground">Team Management</span>
        </span>
      ) : null}
    </Link>
  );
}
