import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/forms/submit-button";
import { TeamTabs } from "@/components/team/team-tabs";
import { InviteCard } from "@/components/team/invite-card";
import { createInviteAction, regenerateInviteAction, toggleInviteAction, updateTeamSettingsAction } from "@/lib/actions";
import { teamRoleOptions } from "@/lib/constants";
import { getTeamById, listTeamInvites } from "@/lib/data";
import { getRequestOrigin } from "@/lib/request";
import { requireTeamManager } from "@/lib/supabase-server";
import { buildJoinPath } from "@/lib/utils";

type TeamSettingsPageProps = {
  params: Promise<{
    teamId: string;
  }>;
};

export default async function TeamSettingsPage({ params }: TeamSettingsPageProps) {
  const { teamId } = await params;
  const { supabase } = await requireTeamManager(teamId, `/teams/${teamId}/settings`);
  const [team, invites, origin] = await Promise.all([getTeamById(supabase, teamId), listTeamInvites(supabase, teamId), getRequestOrigin()]);

  if (!team) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Card className="p-8">
        <p className="section-kicker">Einstellungen</p>
        <h1 className="mt-2 text-4xl font-semibold">{team.name}</h1>
        <p className="mt-3 text-muted-foreground">Pflege Teamdaten, Farben und Invite-Links fuer neue Mitglieder.</p>
        <div className="mt-6">
          <TeamTabs teamId={team.id} />
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1fr,1.05fr]">
        <Card className="p-6">
          <p className="section-kicker">Teamdaten</p>
          <h2 className="mt-2 text-2xl font-semibold">Teamprofil aktualisieren</h2>
          <form action={updateTeamSettingsAction.bind(null, team.id)} className="mt-5 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="name" defaultValue={team.name} required />
              <Input name="sport" defaultValue={team.sport} required />
              <Input name="season" defaultValue={team.season} required />
              <Input name="logo_url" defaultValue={team.logo_url ?? ""} placeholder="Optional: Logo-URL" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Teamfarbe</label>
              <Input name="theme_color" type="color" defaultValue={team.theme_color} className="h-14 w-20 p-2" />
            </div>
            <div className="flex justify-end">
              <SubmitButton pendingLabel="Team wird gespeichert...">Speichern</SubmitButton>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <p className="section-kicker">Neuer Invite</p>
          <h2 className="mt-2 text-2xl font-semibold">Join-Link anlegen</h2>
          <form action={createInviteAction.bind(null, team.id)} className="mt-5 grid gap-4">
            <Select name="role" defaultValue="player">
              {teamRoleOptions
                .filter((role) => role.value !== "owner")
                .map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
            </Select>
            <Input name="expires_at" type="datetime-local" />
            <div className="flex justify-end">
              <SubmitButton pendingLabel="Link wird erstellt...">Invite-Link erstellen</SubmitButton>
            </div>
          </form>
        </Card>
      </section>

      <section className="space-y-4">
        {invites.length > 0 ? (
          invites.map((invite) => (
            <InviteCard
              key={invite.id}
              invite={invite}
              absoluteUrl={`${origin}${buildJoinPath(invite.code)}`}
              regenerateAction={regenerateInviteAction.bind(null, team.id, invite.id)}
              toggleAction={toggleInviteAction.bind(null, team.id, invite.id, !invite.is_active)}
            />
          ))
        ) : (
          <Card className="p-8 text-center text-muted-foreground">Noch keine Invite-Links angelegt.</Card>
        )}
      </section>
    </div>
  );
}
