import Link from "next/link";
import { CalendarDays, CalendarPlus, CheckCircle2, Clock3, MessageSquareMore } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatsCard } from "@/components/stats-card";
import { managerRoles } from "@/lib/constants";
import { getUserCalendarData } from "@/lib/data";
import { requireProfile } from "@/lib/supabase-server";
import {
  formatDateLabel,
  formatDateTimeLabel,
  getEventTypeLabel,
  getResponseStatusLabel,
  getTeamAccentColor
} from "@/lib/utils";

export default async function CalendarPage() {
  const { supabase, user } = await requireProfile("/calendar");
  const calendar = await getUserCalendarData(supabase, user.id);
  const managedTeam = calendar.teams.find((team) => managerRoles.includes(team.membership.role)) ?? null;
  const today = new Date();
  const now = today.getTime();
  const todayEvents = calendar.events.filter((event) => new Date(event.starts_at).toDateString() === today.toDateString());
  const openResponses = calendar.events.filter((event) => new Date(event.starts_at).getTime() >= now && !event.response);
  const upcomingEvents = calendar.events.filter((event) => new Date(event.starts_at).getTime() >= now);
  const groupedEvents = calendar.events.reduce<Array<{ label: string; events: typeof calendar.events }>>((groups, event) => {
    const label = formatDateLabel(event.starts_at, "EEEE, dd. MMMM");
    const group = groups.find((entry) => entry.label === label);

    if (group) {
      group.events.push(event);
    } else {
      groups.push({ label, events: [event] });
    }

    return groups;
  }, []);

  return (
    <div className="page-stack">
      <Card className="relative overflow-hidden border-red-200/70 bg-[linear-gradient(135deg,hsl(var(--card)),hsl(var(--accent)/0.58))] p-8 dark:border-red-500/15">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/14 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="section-kicker">Kalender</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Alle Termine über alle Teams.</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Trainings, Spiele und Meetings sind hier gebündelt, damit du nicht zwischen Teamseiten springen musst.
            </p>
          </div>
          {managedTeam ? (
            <Button asChild>
              <Link href={`/teams/${managedTeam.id}/events/new`}>
                <CalendarPlus className="h-4 w-4" />
                Termin erstellen
              </Link>
            </Button>
          ) : null}
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Heute" value={String(todayEvents.length)} description="Termine am heutigen Tag" icon={<Clock3 className="h-5 w-5" />} />
        <StatsCard title="Anstehend" value={String(upcomingEvents.length)} description="in den nächsten 90 Tagen" icon={<CalendarDays className="h-5 w-5" />} />
        <StatsCard title="Offen" value={String(openResponses.length)} description="ohne deine Zusage" icon={<MessageSquareMore className="h-5 w-5" />} />
      </section>

      {calendar.teams.length === 0 ? (
        <EmptyState
          title="Noch kein Team verbunden"
          description="Erstelle ein Team oder öffne einen Einladungslink, dann erscheint hier dein Kalender."
          action={
            <Button asChild>
              <Link href="/teams/new">Team erstellen</Link>
            </Button>
          }
        />
      ) : null}

      {calendar.events.length === 0 && calendar.teams.length > 0 ? (
        <EmptyState
          title="Noch keine Termine"
          description="Sobald Trainings, Spiele oder Meetings geplant sind, erscheinen sie hier als klare Agenda."
          action={
            managedTeam ? (
              <Button asChild>
                <Link href={`/teams/${managedTeam.id}/events/new`}>Ersten Termin erstellen</Link>
              </Button>
            ) : undefined
          }
        />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <Card className="p-6">
          <p className="section-kicker">Teams</p>
          <h2 className="mt-2 text-2xl font-semibold">Kalenderquellen</h2>
          <div className="mt-5 space-y-3">
            {calendar.teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}/events`}
                className="flex items-center justify-between rounded-[26px] border border-border bg-background/72 p-4 transition-colors hover:border-primary/30"
              >
                <span className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: getTeamAccentColor(team.theme_color) }} />
                  <span>
                    <span className="block font-semibold">{team.name}</span>
                    <span className="text-sm text-muted-foreground">{team.sport} · Saison {team.season}</span>
                  </span>
                </span>
                <Badge variant="outline">{team.membership.role === "owner" ? "Owner" : "Mitglied"}</Badge>
              </Link>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          {groupedEvents.map((group) => (
            <Card key={group.label} className="p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="section-kicker">Agenda</p>
                  <h2 className="mt-2 text-2xl font-semibold">{group.label}</h2>
                </div>
                <Badge variant="outline">{group.events.length} Termin{group.events.length === 1 ? "" : "e"}</Badge>
              </div>
              <div className="space-y-3">
                {group.events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/teams/${event.team?.id ?? event.team_id}/events/${event.id}`}
                    className="block rounded-[26px] border border-border bg-background/72 p-4 transition-colors hover:border-primary/30"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge>{getEventTypeLabel(event.type)}</Badge>
                          {event.response ? (
                            <Badge variant={event.response.status === "yes" ? "success" : event.response.status === "no" ? "danger" : "muted"}>
                              {getResponseStatusLabel(event.response.status)}
                            </Badge>
                          ) : (
                            <Badge variant="muted">Antwort offen</Badge>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{formatDateTimeLabel(event.starts_at)}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{event.location ?? "Ort folgt"}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                        {event.team?.name ?? "Team"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
