import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/branding/logo";

export function AuthBrand({ central = false }: { central?: boolean }) {
  if (!central) {
    return <Logo className="flex-col gap-2" href="/" />;
  }

  return (
    <Link href="/account" className="inline-flex flex-col items-center gap-2" aria-label="Etienne Account">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Etienne Account</span>
    </Link>
  );
}

