import Link from "next/link";
import { LogOut, Plus } from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { AppNavigation } from "@/components/app/app-navigation";
import { AppHeaderFrame } from "@/components/app/app-header-frame";
import { TeamSwitcher } from "@/components/team/team-switcher";
import { signOutAction } from "@/lib/actions";
import { MAX_OWNED_TEAMS } from "@/lib/constants";
import { getDisplayName } from "@/lib/utils";
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
      <AppHeaderFrame>
          <Logo href="/dashboard" compact className="smart-wordmark" />
          <div className="smart-app-desktop-nav">
            <AppNavigation />
          </div>
          <div className="smart-app-actions">
            {canCreateTeam ? (
              <Link href="/teams/new" className="smart-app-primary-action">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Team erstellen</span>
              </Link>
            ) : (
              <span className="hidden rounded-full border border-white/10 px-4 py-2 text-xs text-muted-foreground sm:inline">{ownedTeamsCount}/{MAX_OWNED_TEAMS} Teams</span>
            )}
            <Link href="/profile" className="hidden rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground xl:inline-flex">
              {getDisplayName(profile.full_name, profile.email)}
            </Link>
            <form action={signOutAction} className="hidden sm:block">
              <button type="submit" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-primary" aria-label="Abmelden">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
      </AppHeaderFrame>

      <main id="main-content" className="content-wrap pb-10 pt-28">
        <div className="mb-6 flex items-center justify-between gap-3 border-y border-white/10 py-2.5">
          <TeamSwitcher teams={teams} canCreateTeam={canCreateTeam} />
          <Link href="/calendar" className="shrink-0 text-sm font-semibold text-primary hover:underline">
            Nächstes Training
          </Link>
        </div>
        {children}
      </main>

      <div className="smart-app-mobile-shell">
        <AppNavigation compact />
      </div>
    </div>
  );
}
