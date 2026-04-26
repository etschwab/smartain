import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarPlus, CheckCircle2, Clock3, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { EventCalendar } from "@/components/team/event-calendar";
import { TeamTabs } from "@/components/team/team-tabs";
import { StatsCard } from "@/components/stats-card";
import { managerRoles } from "@/lib/constants";
import { getTeamById, listTeamEvents } from "@/lib/data";
import { isRecoverableSetupError } from "@/lib/supabase-errors";
import { requireTeamAccess } from "@/lib/supabase-server";
import { formatDateTimeLabel, getEventTypeLabel, getResponseStatusLabel } from "@/lib/utils";

type TeamEventsPageProps = {
  params: Promise<{
    teamId: string;
  }>;
  searchParams: Promise<{
    view?: string;
  }>;
};

export default async function TeamEventsPage({ params, searchParams }: TeamEventsPageProps) {
  const { teamId } = await params;
  const filters = await searchParams;
  const { supabase, membership, user } = await requireTeamAccess(teamId, `/teams/${teamId}/events`);
  const [team, events] = await Promise.all([getTeamById(supabase, teamId), listTeamEvents(supabase, teamId)]);

  if (!team) {
    notFound();
  }

  const canManage = managerRoles.includes(membership.role);
  const isOwner = membership.role === "owner";
  const eventIds = events.map((event) => event.id);
  let myResponses: Array<{ event_id: string; status: "yes" | "no" | "maybe" }> = [];

  if (eventIds.length > 0) {
    const { data, error } = await supabase.from("event_responses").select("event_id, status").in("event_id", eventIds).eq("user_id", user.id);

    if (!isRecoverableSetupError(error)) {
      if (error) {
        throw new Error(error.message);
      }

      myResponses = (data as Array<{ event_id: string; status: "yes" | "no" | "maybe" }>) ?? [];
    }
  }

  const responseMap = new Map(myResponses.map((response) => [response.event_id, response.status]));
  const view = filters.view === "calendar" ? "calendar" : "list";
  const trainings = events.filter((event) => event.type === "training").length;
  const games = events.filter((event) => event.type === "game").length;
  const openResponses = events.filter((event) => !responseMap.has(event.id)).length;

  return (
    <div className="page-stack">
      <Card className="p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker">Termine</p>
            <h1 className="mt-2 text-4xl font-semibold">{team.name}</h1>
            <p className="mt-3 text-muted-foreground">Trainings, Spiele, Meetings und Events in Liste und Kalenderansicht.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant={view === "list" ? "primary" : "secondary"} size="sm">
              <Link href={`/teams/${team.id}/events?view=list`}>Liste</Link>
            </Button>
            <Button asChild variant={view === "calendar" ? "primary" : "secondary"} size="sm">
              <Link href={`/teams/${team.id}/events?view=calendar`}>Kalender</Link>
            </Button>
            {canManage ? (
              <Button asChild>
                <Link href={`/teams/${team.id}/events/new`}>
                  <CalendarPlus className="h-4 w-4" />
                  Neuer Termin
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
        <div className="mt-6">
          <TeamTabs teamId={team.id} showAdmin={isOwner} />
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Trainings" value={String(trainings)} description="geplante Trainingseinheiten" icon={<CalendarPlus className="h-5 w-5" />} />
        <StatsCard title="Spiele" value={String(games)} description="Partien und Spieltage" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatsCard title="Offen" value={String(openResponses)} description="deine unbeantworteten Termine" icon={<Clock3 className="h-5 w-5" />} />
      </section>

      {events.length === 0 ? (
        <EmptyState
          title="Noch keine Termine erstellt"
          description="Plane euer erstes Training, Spiel oder Meeting direkt im Teamkalender."
          action={
            canManage ? (
              <Button asChild>
                <Link href={`/teams/${team.id}/events/new`}>Ersten Termin erstellen</Link>
              </Button>
            ) : undefined
          }
        />
      ) : view === "calendar" ? (
        <EventCalendar events={events} />
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const response = responseMap.get(event.id);

            return (
              <Link key={event.id} href={`/teams/${team.id}/events/${event.id}`}>
                <Card className="p-6 transition-transform hover:-translate-y-1">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold">{event.title}</h2>
                        <Badge>{getEventTypeLabel(event.type)}</Badge>
                        {response ? (
                          <Badge variant={response === "yes" ? "success" : response === "no" ? "danger" : "muted"}>
                            {getResponseStatusLabel(response)}
                          </Badge>
                        ) : (
                          <Badge variant="muted">Antwort offen</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDateTimeLabel(event.starts_at)}</p>
                      <p className="text-sm text-muted-foreground">{event.location ?? "Ort folgt"}</p>
                    </div>
                    <Button variant="secondary" size="sm">
                      <MessageSquare className="h-4 w-4" />
                      Details
                    </Button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
