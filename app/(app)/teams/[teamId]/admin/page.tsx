import { notFound } from "next/navigation";
import { ShieldCheck, UserRoundPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/forms/submit-button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { StatsCard } from "@/components/stats-card";
import { TeamTabs } from "@/components/team/team-tabs";
import { InviteCard } from "@/components/team/invite-card";
import { createInviteAction, regenerateInviteAction, removeMemberAction, toggleInviteAction, updateMemberRoleAction, updateTeamSettingsAction } from "@/lib/actions";
import { getRequestOrigin } from "@/lib/request";
import { requireTeamOwner } from "@/lib/supabase-server";
import { teamRoleOptions } from "@/lib/constants";
import { getTeamById, listTeamInvites, listTeamMembersDetailed } from "@/lib/data";
import { buildJoinPath, getMemberStatusLabel, getRoleLabel } from "@/lib/utils";

type TeamAdminPageProps = {
  params: Promise<{
    teamId: string;
  }>;
};

export default async function TeamAdminPage({ params }: TeamAdminPageProps) {
  const { teamId } = await params;
  const { supabase, user } = await requireTeamOwner(teamId, `/teams/${teamId}/admin`);
  const [team, invites, members, origin] = await Promise.all([
    getTeamById(supabase, teamId),
    listTeamInvites(supabase, teamId),
    listTeamMembersDetailed(supabase, teamId),
    getRequestOrigin()
  ]);

  if (!team) {
    notFound();
  }

  const activeInvites = invites.filter((invite) => invite.is_active).length;
  const ownerCount = members.filter((member) => member.role === "owner").length;

  return (
    <div className="page-stack">
      <Card className="p-8">
        <p className="section-kicker">Admin-Bereich</p>
        <h1 className="mt-2 text-4xl font-semibold">{team.name}</h1>
        <p className="mt-3 text-muted-foreground">
          Als Owner steuerst du hier Teamdaten, Einladungen und alle Rollen im Team.
        </p>
        <div className="mt-6">
          <TeamTabs teamId={team.id} showAdmin />
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Owner" value={String(ownerCount)} description="voller Zugriff auf das Team" icon={<ShieldCheck className="h-5 w-5" />} />
        <StatsCard title="Mitglieder" value={String(members.length)} description="im Team vorhanden" icon={<Users className="h-5 w-5" />} />
        <StatsCard title="Invites" value={String(activeInvites)} description="aktuell aktive Join-Links" icon={<UserRoundPlus className="h-5 w-5" />} />
      </section>

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
            <div className="grid gap-4 sm:grid-cols-[auto,1fr] sm:items-center">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Teamfarbe</label>
                <Input name="theme_color" type="color" defaultValue={team.theme_color} className="h-14 w-20 p-2" />
              </div>
              <div className="rounded-[24px] border border-border bg-background/70 p-4 text-sm text-muted-foreground">
                Owner-Rechte gelten für Farben, Namen, Mitgliederrollen und Invite-Verwaltung.
              </div>
            </div>
            <div className="flex justify-end">
              <SubmitButton pendingLabel="Team wird gespeichert...">Speichern</SubmitButton>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <p className="section-kicker">Neue Einladung</p>
          <h2 className="mt-2 text-2xl font-semibold">Link oder Invite anlegen</h2>
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
              <SubmitButton pendingLabel="Invite wird erstellt...">Invite-Link erstellen</SubmitButton>
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

      <section className="space-y-4">
        <Card className="p-6">
          <p className="section-kicker">Rollenverwaltung</p>
          <h2 className="mt-2 text-2xl font-semibold">Mitglieder und Rollen steuern</h2>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          {members.map((member) => (
            <Card key={member.id} className="p-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-semibold">{member.profile?.full_name ?? member.profile?.email ?? "Unbekannt"}</h3>
                  <Badge variant="outline">{getRoleLabel(member.role)}</Badge>
                  <Badge variant={member.status === "active" ? "success" : "muted"}>{getMemberStatusLabel(member.status)}</Badge>
                </div>

                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="rounded-[22px] border border-border bg-background/70 p-3">E-Mail: {member.profile?.email ?? "keine Angabe"}</div>
                  <div className="rounded-[22px] border border-border bg-background/70 p-3">Telefon: {member.profile?.phone ?? "keine Angabe"}</div>
                  <div className="rounded-[22px] border border-border bg-background/70 p-3">Rückennummer: {member.profile?.jersey_number ?? "keine Angabe"}</div>
                  <div className="rounded-[22px] border border-border bg-background/70 p-3">Position: {member.profile?.position ?? "keine Angabe"}</div>
                </div>

                <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-end sm:justify-between">
                  <form action={updateMemberRoleAction.bind(null, team.id, member.id)} className="flex w-full max-w-sm flex-col gap-3">
                    <Select name="role" defaultValue={member.role}>
                      {teamRoleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    <SubmitButton variant="secondary" pendingLabel="Speichert...">
                      Rolle speichern
                    </SubmitButton>
                  </form>
                  {member.user_id !== user.id ? (
                    <form action={removeMemberAction.bind(null, team.id, member.id)}>
                      <ConfirmSubmit
                        type="submit"
                        variant="ghost"
                        confirmMessage="Mitglied wirklich aus dem Team entfernen?"
                      >
                        Mitglied entfernen
                      </ConfirmSubmit>
                    </form>
                  ) : (
                    <div className="text-sm text-muted-foreground">Eigene Owner-Rolle bleibt bestehen.</div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
