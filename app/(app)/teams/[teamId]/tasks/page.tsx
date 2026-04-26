import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/submit-button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { TeamTabs } from "@/components/team/team-tabs";
import { createTaskAction, deleteTaskAction, updateTaskStatusAction } from "@/lib/actions";
import { managerRoles } from "@/lib/constants";
import { getTeamById, getTeamFeatureSupport, listTeamEvents, listTeamMembersDetailed, listTeamTasks } from "@/lib/data";
import { requireTeamAccess } from "@/lib/supabase-server";
import { formatDateTimeLabel } from "@/lib/utils";

type TeamTasksPageProps = {
  params: Promise<{
    teamId: string;
  }>;
};

export default async function TeamTasksPage({ params }: TeamTasksPageProps) {
  const { teamId } = await params;
  const { supabase, membership } = await requireTeamAccess(teamId, `/teams/${teamId}/tasks`);
  const [team, members, events, tasks, featureSupport] = await Promise.all([
    getTeamById(supabase, teamId),
    listTeamMembersDetailed(supabase, teamId),
    listTeamEvents(supabase, teamId),
    listTeamTasks(supabase, teamId),
    getTeamFeatureSupport(supabase)
  ]);

  if (!team) {
    notFound();
  }

  const canManage = managerRoles.includes(membership.role);

  return (
    <div className="space-y-8">
      <Card className="p-8">
        <p className="section-kicker">Aufgaben</p>
        <h1 className="mt-2 text-4xl font-semibold">{team.name}</h1>
        <p className="mt-3 text-muted-foreground">Checklisten, Zuständigkeiten und Orga-Punkte fuer eure Trainings- und Spieltage.</p>
        <div className="mt-6">
          <TeamTabs teamId={team.id} />
        </div>
      </Card>

      {canManage && featureSupport.tasks ? (
        <Card className="p-6">
          <p className="section-kicker">Neue Aufgabe</p>
          <h2 className="mt-2 text-2xl font-semibold">Checkliste erweitern</h2>
          <form action={createTaskAction.bind(null, team.id)} className="mt-5 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="title" placeholder="Aufgabentitel" required />
              <Input name="due_at" type="datetime-local" />
              <Select name="assigned_to" defaultValue="">
                <option value="">Niemand direkt zugewiesen</option>
                {members.map((member) => (
                  <option key={member.id} value={member.user_id}>
                    {member.profile?.full_name ?? member.profile?.email ?? "Unbekannt"}
                  </option>
                ))}
              </Select>
              <Select name="event_id" defaultValue="">
                <option value="">Kein direkter Terminbezug</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </Select>
            </div>
            <Textarea name="description" placeholder="Beschreibung, Material oder weitere Hinweise" />
            <div className="flex justify-end">
              <SubmitButton pendingLabel="Aufgabe wird erstellt...">Aufgabe erstellen</SubmitButton>
            </div>
          </form>
        </Card>
      ) : canManage ? (
        <Card className="p-6">
          <p className="section-kicker">Aufgabenmodul</p>
          <h2 className="mt-2 text-2xl font-semibold">Wird vorbereitet</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Fuer Aufgaben fehlt in Supabase aktuell noch die `tasks`-Tabelle. Deshalb zeigen wir hier bewusst kein kaputtes Formular an.
          </p>
        </Card>
      ) : null}

      <div className="space-y-4">
        {!featureSupport.tasks ? (
          <Card className="p-8 text-center text-muted-foreground">Die Aufgabenliste wird automatisch aktiv, sobald das neue Tasks-Modul in Supabase verfuegbar ist.</Card>
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <Card key={task.id} className="p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold">{task.title}</h2>
                    <Badge variant={task.status === "done" ? "success" : "muted"}>{task.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{task.description ?? "Keine Beschreibung vorhanden."}</p>
                  <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <p>Zugewiesen: {task.assignee?.full_name ?? task.assignee?.email ?? "niemand"}</p>
                    <p>Termin: {task.event?.title ?? "kein Bezug"}</p>
                    <p>Faellig: {task.due_at ? formatDateTimeLabel(task.due_at) : "ohne Frist"}</p>
                    <p>Statuswechsel: {task.completed_at ? formatDateTimeLabel(task.completed_at) : "offen"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <form action={updateTaskStatusAction.bind(null, team.id, task.id)}>
                    <input type="hidden" name="status" value={task.status === "done" ? "open" : "done"} />
                    <SubmitButton variant="secondary" pendingLabel="Speichert...">
                      {task.status === "done" ? "Wieder oeffnen" : "Als erledigt markieren"}
                    </SubmitButton>
                  </form>
                  {canManage ? (
                    <form action={deleteTaskAction.bind(null, team.id, task.id)}>
                      <ConfirmSubmit
                        type="submit"
                        variant="ghost"
                        confirmMessage="Aufgabe wirklich loeschen?"
                      >
                        Loeschen
                      </ConfirmSubmit>
                    </form>
                  ) : null}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center text-muted-foreground">Noch keine Aufgaben vorhanden.</Card>
        )}
      </div>
    </div>
  );
}
