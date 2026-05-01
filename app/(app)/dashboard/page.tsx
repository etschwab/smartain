import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  MessageSquareMore,
  Plus,
  ShieldCheck,
  Trophy,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatsCard } from "@/components/stats-card";
import { managerRoles, MAX_OWNED_TEAMS } from "@/lib/constants";
import { getDashboardData } from "@/lib/data";
import { requireProfile } from "@/lib/supabase-server";
import {
  formatDateTimeLabel,
  getDisplayName,
  getEventTypeLabel,
  getRoleLabel,
  getTaskStatusLabel,
  getTeamAccentColor
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
        <Card className="relative overflow-hidden border-red-200/70 bg-[linear-gradient(135deg,hsl(var(--card)),hsl(var(--accent)/0.48))] p-8 dark:border-red-500/15">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/14 blur-3xl" />
          <div className="relative flex flex-col gap-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <p className="section-kicker">Dashboard</p>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Willkommen zurück, {getDisplayName(profile.full_name, profile.email)}.
                </h1>
                <p className="text-base leading-7 text-muted-foreground">
                  Dein Matchday-Überblick für Termine, Zusagen, Aufgaben und Teams. Alles Wichtige ist jetzt klar
                  getrennt: Inbox, Kalender und Profil haben eigene Bereiche.
                </p>
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
                  </>
                ) : null}
                {canCreateTeam ? (
                  <Button asChild variant={quickManagedTeam ? "secondary" : "primary"}>
                    <Link href="/teams/new">Team erstellen</Link>
                  </Button>
                ) : (
                  <Button variant="secondary" disabled>
                    {ownedTeams.length}/{MAX_OWNED_TEAMS} Teams erreicht
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[28px] border border-border bg-card/72 p-5">
                <p className="text-sm font-medium text-muted-foreground">Heute</p>
                <p className="mt-3 text-3xl font-semibold">{dashboard.todayEvents.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">Termine, die heute wirklich zählen.</p>
              </div>
              <div className="rounded-[28px] border border-border bg-card/72 p-5">
                <p className="text-sm font-medium text-muted-foreground">Offene Zusagen</p>
                <p className="mt-3 text-3xl font-semibold">{dashboard.pendingResponses.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">Antworten, die noch von dir gebraucht werden.</p>
              </div>
              <div className="rounded-[28px] border border-border bg-card/72 p-5">
                <p className="text-sm font-medium text-muted-foreground">Aufgaben</p>
                <p className="mt-3 text-3xl font-semibold">{dashboard.assignedTasks.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">Offene persönliche To-dos im Teamkontext.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <p className="section-kicker">Schnellzugriff</p>
          <h2 className="mt-2 text-2xl font-semibold">Deine wichtigsten Bereiche</h2>
          <div className="mt-6 grid gap-3">
            {[
              { href: "/inbox", label: "Inbox öffnen", text: "Benachrichtigungen, offene Zusagen und Aufgaben.", icon: MessageSquareMore },
              { href: "/calendar", label: "Kalender ansehen", text: "Alle Termine aus allen Teams in einer Ansicht.", icon: CalendarClock },
              { href: "/profile", label: "Profil pflegen", text: "Kontaktdaten, Position und Notfallkontakt.", icon: ShieldCheck }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between gap-4 rounded-[26px] border border-border bg-background/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent/65"
                >
                  <span className="flex items-center gap-3">
                    <span className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-semibold">{item.label}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{item.text}</span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Teams" value={String(dashboard.teams.length)} description="aktive Teamräume" icon={<Users className="h-5 w-5" />} />
        <StatsCard title="Heute" value={String(dashboard.todayEvents.length)} description="Termine am heutigen Tag" icon={<CalendarClock className="h-5 w-5" />} />
        <StatsCard title="Zusagen" value={String(dashboard.pendingResponses.length)} description="offene Antworten" icon={<MessageSquareMore className="h-5 w-5" />} />
        <StatsCard title="Aufgaben" value={String(dashboard.assignedTasks.length)} description="deine offenen To-dos" icon={<ClipboardList className="h-5 w-5" />} />
      </section>

      {dashboard.teams.length === 0 ? (
        <EmptyState
          title="Noch kein Team vorhanden"
          description="Erstelle dein erstes Team, lade Mitglieder ein und starte direkt mit Trainings, Zusagen und Aufgaben."
          action={
            <Button asChild>
              <Link href="/teams/new">Erstes Team erstellen</Link>
            </Button>
          }
        />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Teams</p>
              <h2 className="mt-2 text-2xl font-semibold">Teamräume</h2>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/teams">
                Alle Teams
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {dashboard.teams.map((team) => {
              const teamAccent = getTeamAccentColor(team.theme_color);

              return (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="rounded-[28px] border border-border bg-background/72 p-5 transition-all hover:-translate-y-1 hover:border-primary/30"
                  style={{ boxShadow: `inset 0 0 0 1px ${teamAccent}22` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold">{team.name}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {team.sport} · Saison {team.season}
                      </p>
                    </div>
                    <Badge variant="outline">{getRoleLabel(team.membership.role)}</Badge>
                  </div>
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-primary">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: teamAccent }} />
                    Team öffnen
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Heute</p>
              <h2 className="mt-2 text-2xl font-semibold">Nächste Aktionen</h2>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/calendar">Kalender</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {dashboard.todayEvents.length > 0 ? (
              dashboard.todayEvents.slice(0, 4).map((event) => (
                <Link
                  key={event.id}
                  href={`/teams/${event.team_id}/events/${event.id}`}
                  className="block rounded-[26px] border border-border bg-background/72 p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{formatDateTimeLabel(event.starts_at)}</p>
                    </div>
                    <Badge>{getEventTypeLabel(event.type)}</Badge>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[26px] border border-dashed border-border bg-background/50 p-5 text-sm text-muted-foreground">
                Heute ist kein Termin geplant. Perfekt, um den nächsten Trainingsblock vorzubereiten.
              </div>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Zusagen</p>
              <h2 className="mt-2 text-2xl font-semibold">Offene Rückmeldungen</h2>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/inbox">Zur Inbox</Link>
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {dashboard.pendingResponses.length > 0 ? (
              dashboard.pendingResponses.slice(0, 4).map((event) => (
                <Link
                  key={event.id}
                  href={`/teams/${event.team?.id ?? event.team_id}/events/${event.id}`}
                  className="block rounded-[26px] border border-border bg-background/72 p-4 transition-colors hover:border-primary/30"
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
                Stark: aktuell wartet keine offene Zusage auf dich.
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Aufgaben</p>
              <h2 className="mt-2 text-2xl font-semibold">Deine To-dos</h2>
            </div>
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div className="mt-5 space-y-3">
            {dashboard.assignedTasks.length > 0 ? (
              dashboard.assignedTasks.slice(0, 4).map((task) => (
                <Link
                  key={task.id}
                  href={`/teams/${task.team_id}/tasks`}
                  className="block rounded-[26px] border border-border bg-background/72 p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{task.title}</p>
                    <Badge variant="muted">{getTaskStatusLabel(task.status)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {task.description ?? task.event?.title ?? "Keine Zusatzinfos"}
                  </p>
                  {task.due_at ? (
                    <p className="mt-2 text-xs font-semibold text-primary">Fällig: {formatDateTimeLabel(task.due_at)}</p>
                  ) : null}
                </Link>
              ))
            ) : (
              <div className="rounded-[26px] border border-dashed border-border bg-background/50 p-5 text-sm text-muted-foreground">
                Du hast aktuell keine offenen Aufgaben.
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
