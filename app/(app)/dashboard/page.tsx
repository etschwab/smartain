import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  MessageSquareMore,
  Plus,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/submit-button";
import { StatsCard } from "@/components/stats-card";
import { markNotificationsReadAction, updateProfileAction } from "@/lib/actions";
import { managerRoles, MAX_OWNED_TEAMS } from "@/lib/constants";
import { getDashboardData } from "@/lib/data";
import { requireProfile } from "@/lib/supabase-server";
import {
  formatDateTimeLabel,
  getDisplayName,
  getEventTypeLabel,
  getRoleLabel
} from "@/lib/utils";

export default async function DashboardPage() {
  const { supabase, user, profile } = await requireProfile("/dashboard");
  const dashboard = await getDashboardData(supabase, user.id);
  const managedTeams = dashboard.teams.filter((team) => managerRoles.includes(team.membership.role));
  const ownedTeams = dashboard.teams.filter((team) => team.membership.role === "owner");
  const quickManagedTeam = managedTeams[0] ?? null;
  const canCreateTeam = ownedTeams.length < MAX_OWNED_TEAMS;

  return (
    <div className="page-stack">
      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <Card className="overflow-hidden p-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <p className="section-kicker">Dashboard</p>
                <div className="space-y-3">
                  <h1 className="text-4xl font-semibold">Hallo {getDisplayName(profile.full_name, profile.email)}.</h1>
                  <p className="max-w-2xl text-muted-foreground">
                    Heute stehen {dashboard.todayEvents.length} Termine, {dashboard.pendingResponses.length} offene
                    Rückmeldungen und {dashboard.assignedTasks.length} persönliche Aufgaben an.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {quickManagedTeam ? (
                  <>
                    <Button asChild>
                      <Link href={`/teams/${quickManagedTeam.id}/events/new`}>
                        <Plus className="h-4 w-4" />
                        Termin erstellen
                      </Link>
                    </Button>
                    <Button asChild variant="secondary">
                      <Link href={`/teams/${quickManagedTeam.id}/tasks`}>Aufgabe erstellen</Link>
                    </Button>
                    <Button asChild variant="secondary">
                      <Link href={`/teams/${quickManagedTeam.id}`}>Invite-Link erzeugen</Link>
                    </Button>
                  </>
                ) : null}
                {canCreateTeam ? (
                  <Button asChild variant="secondary">
                    <Link href="/teams/new">Neues Team</Link>
                  </Button>
                ) : (
                  <Button variant="secondary" disabled>
                    {ownedTeams.length}/{MAX_OWNED_TEAMS} Teams erreicht
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[28px] border border-border bg-background/70 p-5">
                <p className="text-sm font-medium text-muted-foreground">Heute im Kalender</p>
                <p className="mt-3 text-3xl font-semibold">{dashboard.todayEvents.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">Trainings, Spiele und Teamtermine für den heutigen Tag.</p>
              </div>
              <div className="rounded-[28px] border border-border bg-background/70 p-5">
                <p className="text-sm font-medium text-muted-foreground">Offene Antworten</p>
                <p className="mt-3 text-3xl font-semibold">{dashboard.pendingResponses.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">Hier fehlt noch deine Rückmeldung zu einem bevorstehenden Termin.</p>
              </div>
              <div className="rounded-[28px] border border-border bg-background/70 p-5">
                <p className="text-sm font-medium text-muted-foreground">Meine Teams</p>
                <p className="mt-3 text-3xl font-semibold">{dashboard.teams.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">Alle aktiven Mannschaften mit Schnellzugriff und Rollen.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <p className="section-kicker">Heute</p>
          <h2 className="mt-2 text-2xl font-semibold">Nächste Aktionen</h2>
          <div className="mt-5 space-y-3">
            {dashboard.todayEvents.length > 0 ? (
              dashboard.todayEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="rounded-[26px] border border-border bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{formatDateTimeLabel(event.starts_at)}</p>
                    </div>
                    <Badge>{getEventTypeLabel(event.type)}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[26px] border border-dashed border-border bg-background/50 p-5 text-sm text-muted-foreground">
                Heute ist noch kein Termin geplant. Lege direkt das nächste Training an und teile es mit deinem Team.
              </div>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Teams" value={String(dashboard.teams.length)} description="aktive Teamräume" icon={<Users className="h-5 w-5" />} />
        <StatsCard title="Heute" value={String(dashboard.todayEvents.length)} description="Termine am heutigen Tag" icon={<CalendarClock className="h-5 w-5" />} />
        <StatsCard title="Zusagen" value={String(dashboard.pendingResponses.length)} description="offene Antworten für dich" icon={<MessageSquareMore className="h-5 w-5" />} />
        <StatsCard title="Aufgaben" value={String(dashboard.assignedTasks.length)} description="deine offenen To-dos" icon={<ClipboardList className="h-5 w-5" />} />
      </section>

      {dashboard.teams.length === 0 ? (
        <EmptyState
          title="Noch kein Team vorhanden"
          description="Erstelle dein erstes Team, lade Mitglieder ein und starte direkt mit Trainings und Rückmeldungen."
          action={
            <Button asChild>
              <Link href="/teams/new">Erstes Team erstellen</Link>
            </Button>
          }
        />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Meine Teams</p>
              <h2 className="mt-2 text-2xl font-semibold">Schneller Zugriff</h2>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/teams">
                Alle Teams
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {dashboard.teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="rounded-[28px] border border-border bg-background/70 p-5 transition-transform hover:-translate-y-1"
                style={{ boxShadow: `inset 0 0 0 1px ${team.theme_color}22` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold">{team.name}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {team.sport} - Saison {team.season}
                    </p>
                  </div>
                  <Badge variant="outline">{getRoleLabel(team.membership.role)}</Badge>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-primary">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: team.theme_color }} />
                  Team öffnen
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="section-kicker">Offene Rückmeldungen</p>
          <h2 className="mt-2 text-2xl font-semibold">Was braucht deine Antwort?</h2>
          <div className="mt-5 space-y-3">
            {dashboard.pendingResponses.length > 0 ? (
              dashboard.pendingResponses.map((event) => (
                <Link
                  key={event.id}
                  href={`/teams/${event.team?.id ?? event.team_id}/events/${event.id}`}
                  className="block rounded-[26px] border border-border bg-background/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{event.title}</p>
                    <Badge>{getEventTypeLabel(event.type)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{formatDateTimeLabel(event.starts_at)}</p>
                  {event.team ? <p className="mt-2 text-xs font-semibold text-primary">{event.team.name}</p> : null}
                </Link>
              ))
            ) : (
              <div className="rounded-[26px] border border-dashed border-border bg-background/50 p-5 text-sm text-muted-foreground">
                Aktuell stehen keine offenen Rückmeldungen für dich an.
              </div>
            )}
          </div>
        </Card>
      </section>

      <section id="calendar" className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="mb-5">
            <p className="section-kicker">Nächste Trainings</p>
            <h2 className="mt-2 text-2xl font-semibold">Trainingsplan</h2>
          </div>
          <div className="space-y-3">
            {dashboard.nextTrainings.length > 0 ? (
              dashboard.nextTrainings.map((event) => (
                <div key={event.id} className="rounded-[26px] border border-border bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{formatDateTimeLabel(event.starts_at)}</p>
                    </div>
                    <Badge>{getEventTypeLabel(event.type)}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Noch keine Trainings geplant.</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5">
            <p className="section-kicker">Nächste Spiele</p>
            <h2 className="mt-2 text-2xl font-semibold">Spieltag</h2>
          </div>
          <div className="space-y-3">
            {dashboard.nextGames.length > 0 ? (
              dashboard.nextGames.map((event) => (
                <div key={event.id} className="rounded-[26px] border border-border bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{formatDateTimeLabel(event.starts_at)}</p>
                    </div>
                    <Badge>{getEventTypeLabel(event.type)}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Noch keine Spiele geplant.</p>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]" id="notifications">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Inbox</p>
              <h2 className="mt-2 text-2xl font-semibold">Benachrichtigungen</h2>
            </div>
            <form action={markNotificationsReadAction}>
              <Button variant="secondary" size="sm" type="submit">
                Alles gelesen
              </Button>
            </form>
          </div>
          <div className="mt-5 space-y-3">
            {dashboard.notifications.length > 0 ? (
              dashboard.notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.action_path ?? "/dashboard"}
                  className="block rounded-[26px] border border-border bg-background/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{notification.title}</p>
                    {!notification.is_read ? <span className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{notification.body}</p>
                  <p className="mt-3 text-xs text-muted-foreground">{formatDateTimeLabel(notification.created_at)}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Noch keine In-App-Benachrichtigungen.</p>
            )}
          </div>
        </Card>

        <Card className="p-6" id="profile">
          <div>
            <p className="section-kicker">Mein Profil</p>
            <h2 className="mt-2 text-2xl font-semibold">Spieler- und Kontaktdaten</h2>
          </div>
          <form action={updateProfileAction} className="mt-6 grid gap-4 sm:grid-cols-2">
            <Input name="full_name" placeholder="Vollständiger Name" defaultValue={profile.full_name ?? ""} />
            <Input name="phone" placeholder="Telefonnummer" defaultValue={profile.phone ?? ""} />
            <Input name="jersey_number" type="number" placeholder="Rückennummer" defaultValue={profile.jersey_number ?? ""} />
            <Input name="position" placeholder="Position" defaultValue={profile.position ?? ""} />
            <Input name="birthday" type="date" defaultValue={profile.birthday ?? ""} />
            <Input name="emergency_contact_name" placeholder="Notfallkontakt Name" defaultValue={profile.emergency_contact_name ?? ""} />
            <div className="sm:col-span-2">
              <Input
                name="emergency_contact_phone"
                placeholder="Notfallkontakt Telefonnummer"
                defaultValue={profile.emergency_contact_phone ?? ""}
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                name="note"
                placeholder="Optional: weitere Hinweise für das Team."
                defaultValue=""
                disabled
              />
            </div>
            <div className="sm:col-span-2">
              <SubmitButton pendingLabel="Profil wird gespeichert...">Profil speichern</SubmitButton>
            </div>
          </form>
          <div className="mt-6 rounded-[26px] border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            Deine Profilfelder werden in Teamansichten genutzt, damit Coaches Rückfragen, Notfallkontakte und Spielinfos
            schneller im Blick haben.
          </div>
        </Card>
      </section>
    </div>
  );
}
