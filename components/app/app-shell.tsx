import Link from "next/link";
import { Plus } from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppNavigation } from "@/components/app/app-navigation";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions";
import { getDisplayName } from "@/lib/utils";
import type { Profile, TeamWithMembership } from "@/lib/types";

type AppShellProps = {
  profile: Profile;
  teams: TeamWithMembership[];
  children: React.ReactNode;
};

export function AppShell({ profile, teams, children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/92 backdrop-blur-xl">
        <div className="content-wrap flex min-h-20 flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Logo href="/dashboard" />
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 lg:items-center lg:justify-between xl:flex-row">
            <AppNavigation />
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <Button asChild size="sm" variant="secondary">
                <Link href="/teams/new">
                  <Plus className="h-4 w-4" />
                  Team erstellen
                </Link>
              </Button>
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>
              <div className="rounded-full border border-border bg-card px-4 py-2 text-sm text-card-foreground">
                {getDisplayName(profile.full_name, profile.email)}
              </div>
              <form action={signOutAction}>
                <Button size="sm" variant="ghost" type="submit">
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
        {teams.length > 0 ? (
          <div className="content-wrap pb-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-transform hover:-translate-y-0.5"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${team.theme_color}20`
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: team.theme_color
                    }}
                  />
                  {team.name}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </header>
      <main className="content-wrap py-8">{children}</main>
    </div>
  );
}
