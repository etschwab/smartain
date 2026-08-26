import Link from "next/link";
import { CalendarDays, LogOut, Plus } from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { AppNavigation } from "@/components/app/app-navigation";
import { TeamSwitcher } from "@/components/team/team-switcher";
import { signOutAction } from "@/lib/actions";
import { MAX_OWNED_TEAMS } from "@/lib/constants";
import { getDisplayName, getInitials } from "@/lib/utils";
import type { Profile, TeamWithMembership } from "@/lib/types";

type AppShellProps = {
  profile: Profile;
  teams: TeamWithMembership[];
  children: React.ReactNode;
};

export function AppShell({ profile, teams, children }: AppShellProps) {
  const ownedTeamsCount = teams.filter((team) => team.membership.role === "owner").length;
  const canCreateTeam = ownedTeamsCount < MAX_OWNED_TEAMS;

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <a className="skip-link" href="#main-content">Zum Inhalt springen</a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17rem] flex-col border-r border-border bg-background/95 lg:flex">
        <div className="border-b border-border/70 px-5 py-5">
          <Logo href="/dashboard" />
          <div className="mt-5 flex items-center gap-2 border-l-2 border-primary px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-muted-foreground">Team Workspace</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-3 px-3 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">Navigation</p>
          <AppNavigation />
        </div>

        <div className="border-t border-border/70 p-4">
          {canCreateTeam ? (
            <Link
              href="/teams/new"
              className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-ring"
            >
              <Plus className="h-4 w-4" />
              Neues Team
            </Link>
          ) : (
            <p className="mb-3 rounded-xl border border-border px-3 py-2 text-center text-xs text-muted-foreground">
              {ownedTeamsCount}/{MAX_OWNED_TEAMS} eigene Teams
            </p>
          )}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
            <Link href="/profile" className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 hover:bg-muted/60">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-muted text-xs font-black text-foreground">
                {getInitials(getDisplayName(profile.full_name, profile.email))}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{getDisplayName(profile.full_name, profile.email)}</span>
                <span className="block text-[0.68rem] text-muted-foreground">Profil öffnen</span>
              </span>
            </Link>
            <form action={signOutAction}>
              <button type="submit" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Abmelden">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[17rem]">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95">
          <div className="content-wrap flex min-h-16 items-center justify-between gap-3 py-2">
            <Logo href="/dashboard" compact className="lg:hidden" />
            <div className="hidden min-w-0 lg:block">
              <TeamSwitcher teams={teams} canCreateTeam={false} />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/calendar"
                className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
              >
                <CalendarDays className="h-4 w-4" />
                Kalender
              </Link>
              {canCreateTeam ? (
                <Link
                  href="/teams/new"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-ring lg:hidden"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Team</span>
                </Link>
              ) : null}
              <Link
                href="/profile"
                aria-label="Profil öffnen"
                className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-xs font-black text-foreground transition-colors hover:bg-muted lg:hidden"
              >
                {getInitials(getDisplayName(profile.full_name, profile.email))}
              </Link>
            </div>
          </div>
          {teams.length > 0 ? (
            <div className="content-wrap border-t border-border/60 py-2.5 lg:hidden">
              <TeamSwitcher teams={teams} canCreateTeam={false} />
            </div>
          ) : null}
        </header>

        <main id="main-content" className="content-wrap py-8 lg:py-10">
          {children}
        </main>
      </div>

      <div className="fixed inset-x-3 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-50 h-[4.35rem] rounded-2xl border border-border bg-background/95 p-1.5 shadow-[0_0.75rem_2rem_rgb(0_0_0/0.24)] lg:hidden">
        <AppNavigation variant="mobile" />
      </div>
    </div>
  );
}
