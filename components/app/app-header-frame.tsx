"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

export function AppHeaderFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const header = document.querySelector<HTMLElement>(".smart-app-site-header");
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
    <header className="smart-site-header smart-app-site-header">
      <div className="smart-header-inner smart-app-header-inner">{children}</div>
    </header>
  );
}
