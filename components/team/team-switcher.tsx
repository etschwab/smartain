"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import type { TeamWithMembership } from "@/lib/types";

type TeamSwitcherProps = {
  teams: TeamWithMembership[];
  canCreateTeam: boolean;
};

export function TeamSwitcher({ teams, canCreateTeam }: TeamSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const detectedTeamId = pathname.match(/^\/teams\/([^/]+)/)?.[1] ?? "";
  const activeTeamId = teams.some((team) => team.id === detectedTeamId) ? detectedTeamId : "";

  if (teams.length === 0) {
    return canCreateTeam ? (
      <Link href="/teams/new" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
        <Plus className="h-4 w-4" />
        Erstes Team erstellen
      </Link>
    ) : null;
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Users className="h-4 w-4 shrink-0 text-primary" />
      <label htmlFor="team-switcher" className="sr-only">Team wechseln</label>
      <select
        id="team-switcher"
        value={activeTeamId}
        onChange={(event) => {
          if (event.target.value) router.push(`/teams/${event.target.value}`);
          else router.push("/teams");
        }}
        className="h-9 min-w-0 max-w-52 rounded-lg border border-border/80 bg-card/70 px-3 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="">Alle Teams</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>{team.name}</option>
        ))}
      </select>
      {canCreateTeam ? (
        <Link
          href="/teams/new"
          aria-label="Neues Team erstellen"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Plus className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
