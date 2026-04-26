import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, ClipboardList, Settings, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatsCard } from "@/components/stats-card";
import { InviteCard } from "@/components/team/invite-card";
import { TeamTabs } from "@/components/team/team-tabs";
import { createInviteAction, regenerateInviteAction, toggleInviteAction } from "@/lib/actions";
import { getTeamById, getTeamFeatureSupport, listTeamEvents, listTeamInvites, listTeamMembersDetailed, listTeamTasks } from "@/lib/data";
import { managerRoles } from "@/lib/constants";
import { getRequestOrigin } from "@/lib/request";
import { requireTeamAccess } from "@/lib/supabase-server";
import { buildJoinPath, formatDateTimeLabel } from "@/lib/utils";

type TeamPageProps = {
  params: Promise<{
    teamId: string;
  }>;
};

export default async function TeamOverviewPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const { supabase, membership } = await requireTeamAccess(teamId, `/teams/${teamId}`);
  const [team, members, events, tasks, invites, origin, featureSupport] = await Promise.all([
    getTeamById(supabase, teamId),
    listTeamMembersDetailed(supabase, teamId),
    listTeamEvents(supabase, teamId),
    listTeamTasks(supabase, teamId),
    listTeamInvites(supabase, teamId),
    getRequestOrigin(),
    getTeamFeatureSupport(supabase)
  ]);

  if (!team) {
    notFound();
  }

  const canManage = managerRoles.includes(membership.role);
  const activeInvite = invites.find((invite) => invite.is_active) ?? invites[0] ?? null;
  const upcomingEvents = events.slice(0, 4);
  const openTasks = tasks.filter((task) => task.status === "open").slice(0, 4);

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: team.theme_color }} />
              <p className="section-kicker">{team.sport}</p>
            </div>
            <div>
              <h1 className="text-4xl font-semibold">{team.name}</h1>
              <p className="mt-3 text-muted-foreground">Saison {team.season} · Rolle: {membership.role}</p>
            </div>
            <TeamTabs teamId={team.id} />
          </div>
          <div className="flex flex-wrap gap-3">
            {canManage ? (
              <>
                {featureSupport.events ? (
                  <Button asChild>
                    <Link href={`/teams/${team.id}/events/new`}>Training erstellen</Link>
                  </Button>
                ) : null}
                <Button asChild variant="secondary">
                  <Link href={`/teams/${team.id}/settings`}>
                    <Settings className="h-4 w-4" />
                    Einstellungen
                  </Link>
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Mitglieder" value={String(members.length)} description="aktive Personen im Team" icon={<Users className="h-5 w-5" />} />
        <StatsCard title="Naechste Termine" value={String(upcomingEvents.length)} description="kommende Teamtermine" icon={<CalendarClock className="h-5 w-5" />} />
        <StatsCard title="Offene Aufgaben" value={String(openTasks.length)} description="noch nicht erledigt" icon={<ClipboardList className="h-5 w-5" />} />
        <StatsCard title="Invite-Links" value={String(invites.length)} description="aktive und historische Links" icon={<Settings className="h-5 w-5" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        {featureSupport.invites && activeInvite && canManage ? (
          <InviteCard
            invite={activeInvite}
            absoluteUrl={`${origin}${buildJoinPath(activeInvite.code)}`}
            regenerateAction={regenerateInviteAction.bind(null, team.id, activeInvite.id)}
            toggleAction={toggleInviteAction.bind(null, team.id, activeInvite.id, !activeInvite.is_active)}
          />
        ) : !featureSupport.invites ? (
          <Card className="p-6">
            <p className="section-kicker">Einladungen</p>
            <h2 className="mt-2 text-2xl font-semibold">Invite-Links werden noch vorbereitet</h2>
            <p className="mt-3 text-muted-foreground">
              Team-Erstellung und Mitgliederbereich laufen bereits. Fuer Join-Links fehlt in Supabase noch die neue Invite-Tabelle, daher blenden wir die Funktion hier vorerst aus.
            </p>
          </Card>
        ) : (
          <Card className="p-6">
            <p className="section-kicker">Einladungen</p>
            <h2 className="mt-2 text-2xl font-semibold">Mitglieder ins Team holen</h2>
            <p className="mt-3 text-muted-foreground">
              {canManage
                ? "Erstelle einen Invite-Link in den Einstellungen, kopiere ihn und teile ihn mit neuen Teammitgliedern."
                : "Nur Owner und Coaches koennen Invite-Links verwalten."}
            </p>
            {canManage ? (
              <form action={createInviteAction.bind(null, team.id)} className="mt-6 flex flex-wrap items-end gap-3">
                <input type="hidden" name="role" value="player" />
                <Button type="submit">Invite-Link erstellen</Button>
                <Button asChild variant="secondary">
                  <Link href={`/teams/${team.id}/settings`}>Invite-Verwaltung oeffnen</Link>
                </Button>
              </form>
            ) : null}
          </Card>
        )}

        <Card className="p-6">
          <p className="section-kicker">Team-Feed</p>
          <h2 className="mt-2 text-2xl font-semibold">Naechste Termine</h2>
          <div className="mt-5 space-y-3">
            {!featureSupport.events ? (
              <p className="text-sm text-muted-foreground">Das Terminmodul wird eingeblendet, sobald die fehlende Supabase-Tabelle verfuegbar ist.</p>
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/teams/${team.id}/events/${event.id}`}
                  className="block rounded-3xl border border-border bg-background/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{event.title}</p>
                    <Badge>{event.type}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{formatDateTimeLabel(event.starts_at)}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Noch keine Termine im Teamkalender.</p>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-kicker">Mitglieder</p>
              <h2 className="mt-2 text-2xl font-semibold">Teamliste</h2>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href={`/teams/${team.id}/members`}>Alle ansehen</Link>
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {members.slice(0, 5).map((member) => (
              <div key={member.id} className="rounded-3xl border border-border bg-background/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{member.profile?.full_name ?? member.profile?.email ?? "Unbekannt"}</p>
                    <p className="text-sm text-muted-foreground">{member.profile?.email ?? "Keine E-Mail"}</p>
                  </div>
                  <Badge variant="outline">{member.role}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-kicker">Aufgaben</p>
              <h2 className="mt-2 text-2xl font-semibold">Offene Checkliste</h2>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href={`/teams/${team.id}/tasks`}>Zur Aufgabenliste</Link>
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {openTasks.length > 0 ? (
              openTasks.map((task) => (
                <div key={task.id} className="rounded-3xl border border-border bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{task.title}</p>
                    <Badge variant="muted">{task.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{task.description ?? "Keine Zusatzinfos"}</p>
                </div>
              ))
            ) : !featureSupport.tasks ? (
              <div className="rounded-3xl border border-dashed border-border bg-background/40 p-5">
                <p className="font-semibold">Aufgabenmodul wird vorbereitet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Die Aufgabenansicht wird automatisch aktiv, sobald die neue Aufgaben-Tabelle in Supabase vorhanden ist.
                </p>
              </div>
            ) : (
              <EmptyState
                title="Noch keine Aufgaben"
                description="Lege die ersten Checklisten fuer Trikots, Fahrgemeinschaft oder Kabinen an."
                action={
                  canManage ? (
                    <Button asChild size="sm">
                      <Link href={`/teams/${team.id}/tasks`}>Aufgabe anlegen</Link>
                    </Button>
                  ) : undefined
                }
              />
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
