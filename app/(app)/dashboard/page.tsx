import Link from "next/link";
import { ArrowRight, CalendarClock, ClipboardList, MessageSquareMore, Plus, ShieldCheck, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/submit-button";
import { StatsCard } from "@/components/stats-card";
import { getDashboardData } from "@/lib/data";
import { managerRoles } from "@/lib/constants";
import { requireProfile } from "@/lib/supabase-server";
import { formatDateTimeLabel, getDisplayName } from "@/lib/utils";
import { updateProfileAction, markNotificationsReadAction } from "@/lib/actions";

export default async function DashboardPage() {
  const { supabase, user, profile } = await requireProfile("/dashboard");
  const dashboard = await getDashboardData(supabase, user.id);
  const managedTeams = dashboard.teams.filter((team) => managerRoles.includes(team.membership.role));
  const quickTeam = managedTeams[0];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.3fr,0.7fr]">
        <Card className="p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <p className="section-kicker">Dashboard</p>
              <div>
                <h1 className="text-4xl font-semibold">Hallo {getDisplayName(profile.full_name, profile.email)}.</h1>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  Heute stehen {dashboard.todayEvents.length} Termine, {dashboard.pendingResponses.length} offene Antworten und {dashboard.assignedTasks.length} Aufgaben an.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {quickTeam ? (
                <Button asChild>
                  <Link href={`/teams/${quickTeam.id}/events/new`}>
                    <Plus className="h-4 w-4" />
                    Training erstellen
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="secondary">
                <Link href="/teams/new">Neues Team</Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <p className="section-kicker">Heute</p>
          <div className="mt-3 space-y-4">
            {dashboard.todayEvents.length > 0 ? (
              dashboard.todayEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="rounded-3xl border border-border bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{formatDateTimeLabel(event.starts_at)}</p>
                    </div>
                    <Badge>{event.type}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Heute ist noch kein Termin geplant.</p>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Teams" value={String(dashboard.teams.length)} description="aktive Teamraeume" icon={<Users className="h-5 w-5" />} />
        <StatsCard title="Heute" value={String(dashboard.todayEvents.length)} description="Termine heute" icon={<CalendarClock className="h-5 w-5" />} />
        <StatsCard title="Offene Zusagen" value={String(dashboard.pendingResponses.length)} description="Rueckmeldungen fehlen" icon={<MessageSquareMore className="h-5 w-5" />} />
        <StatsCard title="Aufgaben" value={String(dashboard.assignedTasks.length)} description="offen fuer dich" icon={<ClipboardList className="h-5 w-5" />} />
      </section>

      {dashboard.teams.length === 0 ? (
        <EmptyState
          title="Noch kein Team vorhanden"
          description="Erstelle dein erstes Team oder trete ueber einen Invite-Link einem bestehenden Team bei."
          action={
            <Button asChild>
              <Link href="/teams/new">Erstes Team erstellen</Link>
            </Button>
          }
        />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Meine Teams</p>
              <h2 className="mt-2 text-2xl font-semibold">Teamkarten und Schnellzugriff</h2>
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
              <Link key={team.id} href={`/teams/${team.id}`} className="rounded-[28px] border border-border bg-background/70 p-5 transition-transform hover:-translate-y-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold">{team.name}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {team.sport} · Saison {team.season}
                    </p>
                  </div>
                  <Badge variant="outline">{team.membership.role}</Badge>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-primary">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: team.theme_color }}
                  />
                  Team oeffnen
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="section-kicker">Offene Antworten</p>
          <h2 className="mt-2 text-2xl font-semibold">Wer fehlt noch?</h2>
          <div className="mt-5 space-y-3">
            {dashboard.pendingResponses.length > 0 ? (
              dashboard.pendingResponses.map((event) => (
                <Link key={event.id} href={`/teams/${event.team?.id ?? event.team_id}/events/${event.id}`} className="block rounded-3xl border border-border bg-background/70 p-4">
                  <p className="font-semibold">{event.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDateTimeLabel(event.starts_at)}</p>
                  {event.team ? <p className="mt-2 text-xs font-medium text-primary">{event.team.name}</p> : null}
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Aktuell stehen keine offenen Rueckmeldungen fuer dich an.</p>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="section-kicker">Naechste Trainings</p>
              <h2 className="mt-2 text-2xl font-semibold">Trainingsplan</h2>
            </div>
          </div>
          <div className="space-y-3">
            {dashboard.nextTrainings.length > 0 ? (
              dashboard.nextTrainings.map((event) => (
                <div key={event.id} className="rounded-3xl border border-border bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{formatDateTimeLabel(event.starts_at)}</p>
                    </div>
                    <Badge>{event.type}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Noch keine Trainings geplant.</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="section-kicker">Naechste Spiele</p>
              <h2 className="mt-2 text-2xl font-semibold">Spieltag</h2>
            </div>
          </div>
          <div className="space-y-3">
            {dashboard.nextGames.length > 0 ? (
              dashboard.nextGames.map((event) => (
                <div key={event.id} className="rounded-3xl border border-border bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{formatDateTimeLabel(event.starts_at)}</p>
                    </div>
                    <Badge>{event.type}</Badge>
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
                  className="block rounded-3xl border border-border bg-background/70 p-4"
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
            <Input name="full_name" placeholder="Vollstaendiger Name" defaultValue={profile.full_name ?? ""} />
            <Input name="phone" placeholder="Telefonnummer" defaultValue={profile.phone ?? ""} />
            <Input name="jersey_number" type="number" placeholder="Rueckennummer" defaultValue={profile.jersey_number ?? ""} />
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
                placeholder="Optional: weitere Hinweise fuer das Team."
                defaultValue=""
                disabled
              />
            </div>
            <div className="sm:col-span-2">
              <SubmitButton pendingLabel="Profil wird gespeichert...">Profil speichern</SubmitButton>
            </div>
          </form>
          <div className="mt-6 rounded-3xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            Deine Profilfelder werden in Teamansichten verwendet, damit Coaches Rueckfragen, Notfallkontakte und Spielinfos schneller im Blick haben.
          </div>
        </Card>
      </section>
    </div>
  );
}
