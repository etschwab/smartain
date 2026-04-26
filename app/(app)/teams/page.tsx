import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MAX_OWNED_TEAMS } from "@/lib/constants";
import { listUserTeams } from "@/lib/data";
import { requireProfile } from "@/lib/supabase-server";
import { getRoleLabel } from "@/lib/utils";

export default async function TeamsPage() {
  const { supabase, user } = await requireProfile("/teams");
  const teams = await listUserTeams(supabase, user.id);
  const ownedTeams = teams.filter((team) => team.membership.role === "owner");
  const canCreateTeam = ownedTeams.length < MAX_OWNED_TEAMS;

  return (
    <div className="page-stack">
      <Card className="overflow-hidden p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker">Teams</p>
            <h1 className="mt-2 text-4xl font-semibold">Deine Teamräume</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Verwalte mehrere Mannschaften, Rollen, Einladungen und Trainings in einer klaren Übersicht.
            </p>
          </div>
          {canCreateTeam ? (
            <Button asChild>
              <Link href="/teams/new">
                <Plus className="h-4 w-4" />
                Neues Team
              </Link>
            </Button>
          ) : (
            <Button variant="secondary" disabled>
              {ownedTeams.length}/{MAX_OWNED_TEAMS} Teams erreicht
            </Button>
          )}
        </div>
      </Card>

      {teams.length === 0 ? (
        <EmptyState
          title="Noch kein Team vorhanden"
          description="Erstelle dein erstes Team und starte direkt mit Mitgliedern, Einladungen und Trainings."
          action={
            <Button asChild>
              <Link href="/teams/new">Erstes Team erstellen</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="overflow-hidden p-6 transition-transform hover:-translate-y-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] text-white" style={{ backgroundColor: team.theme_color }}>
                    <Users className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-semibold">{team.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {team.sport} - Saison {team.season}
                  </p>
                </div>
                <Badge variant="outline">{getRoleLabel(team.membership.role)}</Badge>
              </div>
              <div className="mt-6 rounded-[24px] border border-border bg-background/70 p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Teamfarbe</span>
                  <span className="font-semibold" style={{ color: team.theme_color }}>
                    {team.theme_color}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rolle im Team: {getRoleLabel(team.membership.role)}</span>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/teams/${team.id}`}>Öffnen</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
