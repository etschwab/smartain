import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { SubmitButton } from "@/components/forms/submit-button";
import { TeamTabs } from "@/components/team/team-tabs";
import { eventTypeOptions, responseStatusOptions, managerRoles } from "@/lib/constants";
import { getEventById, getEventResponseCounts, getTeamById, listEventResponses, listTeamMembersDetailed } from "@/lib/data";
import { deleteEventAction, respondToEventAction, updateEventAction } from "@/lib/actions";
import { requireTeamAccess } from "@/lib/supabase-server";
import { formatDateTimeLabel, getEventTypeLabel, getResponseStatusLabel, toDateTimeLocalValue } from "@/lib/utils";

type EventDetailPageProps = {
  params: Promise<{
    teamId: string;
    eventId: string;
  }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { teamId, eventId } = await params;
  const { supabase, membership, user } = await requireTeamAccess(teamId, `/teams/${teamId}/events/${eventId}`);
  const [team, event, members, responses, counts] = await Promise.all([
    getTeamById(supabase, teamId),
    getEventById(supabase, eventId),
    listTeamMembersDetailed(supabase, teamId),
    listEventResponses(supabase, eventId),
    getEventResponseCounts(supabase, eventId, teamId)
  ]);

  if (!team || !event || event.team_id !== team.id) {
    notFound();
  }

  const currentResponse = responses.find((response) => response.user_id === user.id) ?? null;
  const missingMembers = members.filter(
    (member) => member.status === "active" && !responses.some((response) => response.user_id === member.user_id)
  );
  const canManage = managerRoles.includes(membership.role);
  const isOwner = membership.role === "owner";

  return (
    <div className="page-stack">
      <Card className="p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-kicker">{team.name}</p>
            <h1 className="mt-2 text-4xl font-semibold">{event.title}</h1>
            <p className="mt-3 text-muted-foreground">{formatDateTimeLabel(event.starts_at)} · {event.location ?? "Ort folgt"}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{getEventTypeLabel(event.type)}</Badge>
              {currentResponse ? (
                <Badge variant="success">Deine Antwort: {getResponseStatusLabel(currentResponse.status)}</Badge>
              ) : (
                <Badge variant="muted">Du hast noch nicht geantwortet</Badge>
              )}
            </div>
          </div>
          <div className="max-w-md text-sm text-muted-foreground">{event.description ?? "Keine Zusatzbeschreibung hinterlegt."}</div>
        </div>
        <div className="mt-6">
          <TeamTabs teamId={team.id} showAdmin={isOwner} />
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <Card className="p-6">
          <p className="section-kicker">Deine Rückmeldung</p>
          <h2 className="mt-2 text-2xl font-semibold">Antwort absenden</h2>
          <form action={respondToEventAction.bind(null, team.id, event.id)} className="mt-5 space-y-4">
            <Select name="status" defaultValue={currentResponse?.status ?? "yes"}>
              {responseStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Textarea name="comment" placeholder="Optionaler Kommentar" defaultValue={currentResponse?.comment ?? ""} />
            <SubmitButton pendingLabel="Antwort wird gespeichert...">Antwort speichern</SubmitButton>
          </form>
        </Card>

        <Card className="p-6">
          <p className="section-kicker">Antwortstatus</p>
          <h2 className="mt-2 text-2xl font-semibold">Teamüberblick</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-4">
            <div className="rounded-[24px] border border-border bg-background/70 p-4">
              <p className="text-sm text-muted-foreground">Zugesagt</p>
              <p className="mt-2 text-3xl font-semibold">{counts.yes}</p>
            </div>
            <div className="rounded-[24px] border border-border bg-background/70 p-4">
              <p className="text-sm text-muted-foreground">Absagen</p>
              <p className="mt-2 text-3xl font-semibold">{counts.no}</p>
            </div>
            <div className="rounded-[24px] border border-border bg-background/70 p-4">
              <p className="text-sm text-muted-foreground">Vielleicht</p>
              <p className="mt-2 text-3xl font-semibold">{counts.maybe}</p>
            </div>
            <div className="rounded-[24px] border border-border bg-background/70 p-4">
              <p className="text-sm text-muted-foreground">Offen</p>
              <p className="mt-2 text-3xl font-semibold">{counts.pending}</p>
            </div>
          </div>
        </Card>
      </section>

      {canManage ? (
        <Card className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="section-kicker">Termin verwalten</p>
              <h2 className="mt-2 text-2xl font-semibold">Details bearbeiten</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Passe Zeit, Ort und Beschreibung an oder entferne den Termin, wenn er nicht mehr benötigt wird.
              </p>
            </div>
            <form action={deleteEventAction.bind(null, team.id, event.id)}>
              <ConfirmSubmit
                type="submit"
                variant="ghost"
                confirmMessage="Termin wirklich löschen?"
              >
                Termin löschen
              </ConfirmSubmit>
            </form>
          </div>
          <form action={updateEventAction.bind(null, team.id, event.id)} className="mt-6 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input name="title" defaultValue={event.title} required />
              <Select name="type" defaultValue={event.type}>
                {eventTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Input name="starts_at" type="datetime-local" defaultValue={toDateTimeLocalValue(event.starts_at)} required />
              <Input name="ends_at" type="datetime-local" defaultValue={toDateTimeLocalValue(event.ends_at)} required />
              <Input name="location" defaultValue={event.location ?? ""} placeholder="Ort" />
            </div>
            <Textarea name="description" defaultValue={event.description ?? ""} placeholder="Beschreibung, Treffpunkt oder Zusatzinfos" />
            <div className="flex flex-wrap justify-end gap-3">
              <Button asChild variant="secondary">
                <Link href={`/teams/${team.id}/events`}>Zur Übersicht</Link>
              </Button>
              <SubmitButton pendingLabel="Termin wird gespeichert...">Termin speichern</SubmitButton>
            </div>
          </form>
        </Card>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <p className="section-kicker">Wer fehlt noch?</p>
          <h2 className="mt-2 text-2xl font-semibold">Offene Rückmeldungen</h2>
          <div className="mt-5 space-y-3">
            {missingMembers.length > 0 ? (
              missingMembers.map((member) => (
                <div key={member.id} className="rounded-[26px] border border-border bg-background/70 p-4">
                  <p className="font-semibold">{member.profile?.full_name ?? member.profile?.email ?? "Unbekannt"}</p>
                  <p className="text-sm text-muted-foreground">{member.profile?.email ?? "Keine E-Mail"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Alle aktiven Mitglieder haben bereits reagiert.</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-kicker">Rückmeldungen</p>
              <h2 className="mt-2 text-2xl font-semibold">Kommentare aus dem Team</h2>
            </div>
            {canManage ? (
              <Link href={`/teams/${team.id}/tasks`} className="text-sm font-semibold text-primary">
                Aufgaben ansehen
              </Link>
            ) : null}
          </div>
          <div className="mt-5 space-y-3">
            {responses.length > 0 ? (
              responses.map((response) => {
                const member = members.find((entry) => entry.user_id === response.user_id);

                return (
                  <div key={response.id} className="rounded-[26px] border border-border bg-background/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{member?.profile?.full_name ?? member?.profile?.email ?? "Unbekannt"}</p>
                      <Badge variant={response.status === "yes" ? "success" : response.status === "no" ? "danger" : "muted"}>
                        {getResponseStatusLabel(response.status)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{response.comment ?? "Kein Kommentar"}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Noch keine Rückmeldungen vorhanden.</p>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
