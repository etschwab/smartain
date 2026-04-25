import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { listUserTeams } from "@/lib/data";
import { requireProfile } from "@/lib/supabase-server";

export default async function TeamsPage() {
  const { supabase, user } = await requireProfile("/teams");
  const teams = await listUserTeams(supabase, user.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Teams</p>
          <h1 className="mt-2 text-4xl font-semibold">Deine Teamraeume</h1>
          <p className="mt-3 text-muted-foreground">Verwalte mehrere Mannschaften, Rollen und Invite-Links in einer sauberen Uebersicht.</p>
        </div>
        <Button asChild>
          <Link href="/teams/new">
            <Plus className="h-4 w-4" />
            Neues Team
          </Link>
        </Button>
      </div>

      {teams.length === 0 ? (
        <EmptyState
          title="Noch kein Team vorhanden"
          description="Erstelle dein erstes Team und starte mit Mitgliedern, Terminen und Aufgaben."
          action={
            <Button asChild>
              <Link href="/teams/new">Erstes Team erstellen</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="p-6 transition-transform hover:-translate-y-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: team.theme_color }}>
                    <Users className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold">{team.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {team.sport} · Saison {team.season}
                  </p>
                </div>
                <Badge variant="outline">{team.membership.role}</Badge>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Farbe {team.theme_color}</span>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/teams/${team.id}`}>Oeffnen</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
