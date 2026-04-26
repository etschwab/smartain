"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#workflow", label: "Workflow" },
  { href: "/#pricing", label: "Start" }
];

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="content-wrap py-4">
        <div className="glass-panel px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <Logo />
            <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="hidden items-center gap-2 md:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Einloggen</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Kostenlos starten</Link>
              </Button>
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground"
                aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((current) => !current)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div
            className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 md:hidden ${
              mobileOpen ? "mt-4 max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="space-y-3 border-t border-border/70 pt-4">
              <div className="flex flex-col gap-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex gap-2">
                <Button asChild variant="secondary" size="sm" className="flex-1">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Einloggen
                  </Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    Starten
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
