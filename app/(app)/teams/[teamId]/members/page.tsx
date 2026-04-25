import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { SubmitButton } from "@/components/forms/submit-button";
import { TeamTabs } from "@/components/team/team-tabs";
import { removeMemberAction, updateMemberRoleAction } from "@/lib/actions";
import { teamRoleOptions, managerRoles } from "@/lib/constants";
import { listTeamMembersDetailed, getTeamById } from "@/lib/data";
import { requireTeamAccess } from "@/lib/supabase-server";

type TeamMembersPageProps = {
  params: Promise<{
    teamId: string;
  }>;
};

export default async function TeamMembersPage({ params }: TeamMembersPageProps) {
  const { teamId } = await params;
  const { supabase, membership, user } = await requireTeamAccess(teamId, `/teams/${teamId}/members`);
  const [team, members] = await Promise.all([getTeamById(supabase, teamId), listTeamMembersDetailed(supabase, teamId)]);

  if (!team) {
    notFound();
  }

  const canManage = managerRoles.includes(membership.role);

  return (
    <div className="space-y-8">
      <Card className="p-8">
        <p className="section-kicker">Mitglieder</p>
        <h1 className="mt-2 text-4xl font-semibold">{team.name}</h1>
        <p className="mt-3 text-muted-foreground">Rollen, Status und Profildaten fuer alle Teammitglieder im Blick.</p>
        <div className="mt-6">
          <TeamTabs teamId={team.id} />
        </div>
      </Card>

      <div className="space-y-4">
        {members.map((member) => (
          <Card key={member.id} className="p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold">{member.profile?.full_name ?? member.profile?.email ?? "Unbekannt"}</h2>
                  <Badge variant="outline">{member.role}</Badge>
                  <Badge variant={member.status === "active" ? "success" : "muted"}>{member.status}</Badge>
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <p>E-Mail: {member.profile?.email ?? "keine Angabe"}</p>
                  <p>Telefon: {member.profile?.phone ?? "keine Angabe"}</p>
                  <p>Rueckennummer: {member.profile?.jersey_number ?? "keine Angabe"}</p>
                  <p>Position: {member.profile?.position ?? "keine Angabe"}</p>
                  <p>Geburtstag: {member.profile?.birthday ?? "keine Angabe"}</p>
                  <p>Notfallkontakt: {member.profile?.emergency_contact_name ?? "keine Angabe"}</p>
                </div>
              </div>

              {canManage ? (
                <div className="w-full max-w-sm space-y-3">
                  <form action={updateMemberRoleAction.bind(null, team.id, member.id)} className="flex flex-col gap-3">
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
                    <Button disabled variant="ghost">
                      Eigene Mitgliedschaft
                    </Button>
                  )}
                </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
