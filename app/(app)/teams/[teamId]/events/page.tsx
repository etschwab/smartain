import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarPlus, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TeamTabs } from "@/components/team/team-tabs";
import { managerRoles } from "@/lib/constants";
import { getTeamById, listTeamEvents } from "@/lib/data";
import { requireTeamAccess } from "@/lib/supabase-server";
import { formatDateTimeLabel, getEventTypeLabel, isFutureDate } from "@/lib/utils";

type TeamEventsPageProps = { params: Promise<{ teamId: string }> };

export default async function TeamEventsPage({ params }: TeamEventsPageProps) {
  const { teamId } = await params;
  const { supabase, membership } = await requireTeamAccess(teamId, `/teams/${teamId}/events`);
  const [team, events] = await Promise.all([getTeamById(supabase, teamId), listTeamEvents(supabase, teamId)]);

  if (!team) notFound();

  const canManage = managerRoles.includes(membership.role);
  const upcoming = events.filter((event) => isFutureDate(event.starts_at));
  const past = events.filter((event) => !isFutureDate(event.starts_at)).reverse();

  const eventList = (items: typeof events) => (
    <div className="space-y-3">
      {items.map((event) => (
        <Link key={event.id} href={`/teams/${team.id}/events/${event.id}`} className="block rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-semibold">{event.title}</h3>
                <Badge>{getEventTypeLabel(event.type)}</Badge>
                {event.is_cancelled ? <Badge variant="danger">Abgesagt</Badge> : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{formatDateTimeLabel(event.starts_at)}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{event.location ?? "Ort noch offen"}</p>
            </div>
            <span className="text-sm font-semibold text-primary">Öffnen</span>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Trainings & Events</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{team.name}</h1>
            <p className="mt-3 text-muted-foreground">Alle Termine dieses Teams an einem Ort.</p>
          </div>
          {canManage ? (
            <Button asChild><Link href={`/teams/${team.id}/events/new`}><CalendarPlus className="h-4 w-4" />Neuer Termin</Link></Button>
          ) : null}
        </div>
        <div className="mt-6"><TeamTabs teamId={team.id} /></div>
      </Card>

      {events.length === 0 ? (
        <EmptyState
          title="Noch keine Trainings oder Events"
          description="Erstelle den ersten Termin für dieses Team."
          action={canManage ? <Button asChild><Link href={`/teams/${team.id}/events/new`}>Termin erstellen</Link></Button> : undefined}
        />
      ) : (
        <>
          <section>
            <h2 className="mb-4 text-xl font-semibold">Bevorstehend</h2>
            {upcoming.length > 0 ? eventList(upcoming) : <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">Keine bevorstehenden Termine.</p>}
          </section>
          {past.length > 0 ? (
            <section>
              <h2 className="mb-4 text-xl font-semibold">Vergangen</h2>
              {eventList(past)}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
