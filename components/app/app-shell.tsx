"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Plus, X } from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppNavigation } from "@/components/app/app-navigation";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions";
import { MAX_OWNED_TEAMS } from "@/lib/constants";
import { getDisplayName, getRoleLabel, getTeamAccentColor } from "@/lib/utils";
import type { Profile, TeamWithMembership } from "@/lib/types";

type AppShellProps = {
  profile: Profile;
  teams: TeamWithMembership[];
  children: React.ReactNode;
};

export function AppShell({ profile, teams, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const ownedTeamsCount = teams.filter((team) => team.membership.role === "owner").length;
  const canCreateTeam = ownedTeamsCount < MAX_OWNED_TEAMS;

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-red-950/10 bg-[linear-gradient(135deg,#7f1d1d,#e11d48_52%,#fb7185)] text-white shadow-[0_22px_52px_-38px_rgba(127,29,29,0.75)] dark:border-white/10">
        <div className="content-wrap py-3">
          <div className="relative overflow-hidden rounded-[28px] border border-white/35 bg-white/94 px-4 py-4 text-foreground shadow-[0_24px_70px_-44px_rgba(127,29,29,0.65)] backdrop-blur-xl dark:border-white/10 dark:bg-card/88 sm:px-6">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            <div className="flex items-center justify-between gap-4">
              <Logo href="/dashboard" />
              <div className="hidden items-center gap-3 lg:flex">
                <AppNavigation />
              </div>
              <div className="flex items-center gap-2">
                {canCreateTeam ? (
                  <Button asChild size="sm" className="hidden sm:inline-flex">
                    <Link href="/teams/new">
                      <Plus className="h-4 w-4" />
                      Team erstellen
                    </Link>
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" className="hidden sm:inline-flex" disabled>
                    {ownedTeamsCount}/{MAX_OWNED_TEAMS} Teams
                  </Button>
                )}
                <div className="hidden lg:block">
                  <ThemeToggle />
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground transition-colors hover:bg-muted lg:hidden"
                  aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
                  aria-expanded={mobileOpen}
                  onClick={() => setMobileOpen((current) => !current)}
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="mt-4 hidden flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4 lg:flex">
              <div className="flex flex-wrap items-center gap-2">
                {teams.length > 0 ? (
                  teams.map((team) => {
                    const teamAccent = getTeamAccentColor(team.theme_color);

                    return (
                      <Link
                        key={team.id}
                        href={`/teams/${team.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-card-foreground transition-transform hover:-translate-y-0.5"
                        style={{
                          boxShadow: `inset 0 0 0 1px ${teamAccent}25`
                        }}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: teamAccent
                          }}
                        />
                        {team.name}
                      </Link>
                    );
                  })
                ) : (
                  <span className="rounded-full border border-dashed border-border px-4 py-2 text-sm text-muted-foreground">
                    Noch kein Team angelegt
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full border border-border bg-background px-4 py-2 text-sm text-card-foreground">
                  {getDisplayName(profile.full_name, profile.email)}
                </div>
                <form action={signOutAction}>
                  <Button size="sm" variant="secondary" type="submit">
                    Abmelden
                  </Button>
                </form>
              </div>
            </div>
          </div>
          <div
            className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 lg:hidden ${
              mobileOpen ? "mt-4 max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="glass-panel space-y-4 px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{getDisplayName(profile.full_name, profile.email)}</p>
                  <p className="text-xs text-muted-foreground">{profile.email ?? "Teamkonto"}</p>
                </div>
                <ThemeToggle />
              </div>

              <AppNavigation direction="column" onNavigate={() => setMobileOpen(false)} />

              <div className="space-y-3 border-t border-border/70 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Deine Teams</p>
                  {canCreateTeam ? (
                    <Button asChild size="sm">
                      <Link href="/teams/new">
                        <Plus className="h-4 w-4" />
                        Neues Team
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-xs font-semibold text-muted-foreground">
                      Limit {ownedTeamsCount}/{MAX_OWNED_TEAMS}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {teams.length > 0 ? (
                    teams.map((team) => {
                      const teamAccent = getTeamAccentColor(team.theme_color);

                      return (
                        <Link
                          key={team.id}
                          href={`/teams/${team.id}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between rounded-3xl border border-border bg-background/80 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: teamAccent }}
                            />
                            <div>
                              <p className="font-medium">{team.name}</p>
                              <p className="text-xs text-muted-foreground">{team.sport}</p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {getRoleLabel(team.membership.role)}
                          </span>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="rounded-3xl border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
                      Erstelle dein erstes Team und beginne direkt mit Einladungen und Trainings.
                    </div>
                  )}
                </div>
              </div>

              <form action={signOutAction}>
                <Button size="sm" variant="secondary" type="submit" className="w-full">
                  Abmelden
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <main className="content-wrap py-6 lg:py-8">{children}</main>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 px-2 py-2 shadow-[0_-18px_36px_-30px_rgba(15,23,42,0.5)] backdrop-blur lg:hidden">
        <div className="mx-auto max-w-xl">
          <AppNavigation compact />
        </div>
      </div>
    </div>
  );
}
