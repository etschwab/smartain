"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains("dark");

    root.classList.toggle("dark", nextIsDark);
    root.style.colorScheme = nextIsDark ? "dark" : "light";
    localStorage.setItem("smartrain-theme", nextIsDark ? "dark" : "light");
  }

  return (
    <Button
      aria-label="Theme umschalten"
      size="icon"
      variant="ghost"
      onClick={toggleTheme}
    >
      <SunMedium className="hidden h-4 w-4 dark:block" />
      <MoonStar className="h-4 w-4 dark:hidden" />
    </Button>
  );
}
