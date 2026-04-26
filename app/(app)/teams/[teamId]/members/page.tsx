import { notFound } from "next/navigation";
import { ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { SubmitButton } from "@/components/forms/submit-button";
import { StatsCard } from "@/components/stats-card";
import { TeamTabs } from "@/components/team/team-tabs";
import { removeMemberAction, updateMemberRoleAction } from "@/lib/actions";
import { managerRoles, teamRoleOptions } from "@/lib/constants";
import { getTeamById, listTeamMembersDetailed } from "@/lib/data";
import { requireTeamAccess } from "@/lib/supabase-server";
import { getMemberStatusLabel, getRoleLabel } from "@/lib/utils";

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

  const canManage = membership.role === "owner";
  const activeCount = members.filter((member) => member.status === "active").length;
  const staffCount = members.filter((member) => member.role === "owner" || member.role === "coach").length;

  return (
    <div className="page-stack">
      <Card className="p-8">
        <p className="section-kicker">Mitglieder</p>
        <h1 className="mt-2 text-4xl font-semibold">{team.name}</h1>
        <p className="mt-3 text-muted-foreground">Rollen, Status und Profildaten für alle Teammitglieder im Blick.</p>
        <div className="mt-6">
          <TeamTabs teamId={team.id} showAdmin={canManage} />
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Mitglieder" value={String(members.length)} description="alle Personen im Team" icon={<Users className="h-5 w-5" />} />
        <StatsCard title="Aktiv" value={String(activeCount)} description="derzeit freigeschaltet" icon={<ShieldCheck className="h-5 w-5" />} />
        <StatsCard title="Staff" value={String(staffCount)} description="Owner und Coaches" icon={<Users className="h-5 w-5" />} />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {members.map((member) => (
          <Card key={member.id} className="p-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold">{member.profile?.full_name ?? member.profile?.email ?? "Unbekannt"}</h2>
                <Badge variant="outline">{getRoleLabel(member.role)}</Badge>
                <Badge variant={member.status === "active" ? "success" : "muted"}>{getMemberStatusLabel(member.status)}</Badge>
              </div>

              <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="rounded-[22px] border border-border bg-background/70 p-3">E-Mail: {member.profile?.email ?? "keine Angabe"}</div>
                <div className="rounded-[22px] border border-border bg-background/70 p-3">Telefon: {member.profile?.phone ?? "keine Angabe"}</div>
                <div className="rounded-[22px] border border-border bg-background/70 p-3">Rückennummer: {member.profile?.jersey_number ?? "keine Angabe"}</div>
                <div className="rounded-[22px] border border-border bg-background/70 p-3">Position: {member.profile?.position ?? "keine Angabe"}</div>
                <div className="rounded-[22px] border border-border bg-background/70 p-3">Geburtstag: {member.profile?.birthday ?? "keine Angabe"}</div>
                <div className="rounded-[22px] border border-border bg-background/70 p-3">Notfallkontakt: {member.profile?.emergency_contact_name ?? "keine Angabe"}</div>
              </div>

              {canManage ? (
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
