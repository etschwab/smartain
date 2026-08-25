"use client";

import Link from "next/link";
import { ArrowRight, House, LayoutDashboard, ListChecks, LogIn, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { Logo } from "@/components/branding/logo";

const desktopItems = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Funktionen" },
  { href: "/#workflow", label: "Ablauf" }
];

export function PublicNavbar({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const pathname = usePathname();
  const accountHref = isAuthenticated ? "/dashboard" : "/login";
  const accountLabel = isAuthenticated ? "Dashboard" : "Einloggen";
  const mobileItems = [
    { href: "/", label: "Home", icon: House },
    { href: "/#features", label: "Features", icon: Sparkles },
    { href: "/#workflow", label: "Ablauf", icon: ListChecks },
    { href: accountHref, label: isAuthenticated ? "Dashboard" : "Login", icon: isAuthenticated ? LayoutDashboard : LogIn }
  ];

  useLayoutEffect(() => {
    const header = document.querySelector<HTMLElement>(".smart-site-header");
    if (!header) return;

    let frame = 0;
    const updateHeader = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => header.classList.toggle("is-compact", window.scrollY > 96));
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateHeader);
    };
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main-content">Zum Inhalt springen</a>
      <header className="smart-site-header">
        <div className="smart-header-inner">
          <Logo compact className="smart-wordmark" />

          <nav className="smart-main-nav" aria-label="Hauptnavigation">
            <ul className="smart-nav-list smart-nav-list-desktop">
              {desktopItems.map((item) => {
                const isActive = item.href === "/" && pathname === "/";
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={`smart-nav-link${isActive ? " is-active" : ""}`} aria-current={isActive ? "page" : undefined}>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Link href={accountHref} className={`smart-nav-action${pathname === accountHref ? " is-active" : ""}`}>
              <span>{accountLabel}</span>
              <ArrowRight aria-hidden="true" size={17} strokeWidth={2.4} />
            </Link>

            <ul className="smart-nav-list smart-nav-list-mobile">
              {mobileItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={`smart-nav-link${isActive ? " is-active" : ""}`} aria-current={isActive ? "page" : undefined}>
                      <Icon aria-hidden="true" size={18} strokeWidth={1.9} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
