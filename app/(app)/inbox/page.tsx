import Link from "next/link";
import { ArrowRight, Bell, CheckCircle2, ClipboardList, MessageSquareMore } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatsCard } from "@/components/stats-card";
import { markNotificationsReadAction } from "@/lib/actions";
import { getDashboardData } from "@/lib/data";
import { requireProfile } from "@/lib/supabase-server";
import { formatDateTimeLabel, getEventTypeLabel, getTaskStatusLabel } from "@/lib/utils";

export default async function InboxPage() {
  const { supabase, user } = await requireProfile("/inbox");
  const dashboard = await getDashboardData(supabase, user.id);
  const unreadCount = dashboard.notifications.filter((notification) => !notification.is_read).length;
  const hasInboxWork =
    dashboard.notifications.length > 0 ||
    dashboard.pendingResponses.length > 0 ||
    dashboard.assignedTasks.length > 0;

  return (
    <div className="page-stack">
      <Card className="relative overflow-hidden border-red-200/70 bg-[linear-gradient(135deg,hsl(var(--card)),hsl(var(--accent)/0.58))] p-8 dark:border-red-500/15">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/14 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="section-kicker">Inbox</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Alles, was deine Aufmerksamkeit braucht.</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Benachrichtigungen, offene Zusagen und persönliche Aufgaben liegen hier getrennt vom Dashboard.
            </p>
          </div>
          <form action={markNotificationsReadAction}>
            <Button type="submit" variant={unreadCount > 0 ? "primary" : "secondary"}>
              <CheckCircle2 className="h-4 w-4" />
              Alles gelesen
            </Button>
          </form>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Ungelesen" value={String(unreadCount)} description="neue Hinweise" icon={<Bell className="h-5 w-5" />} />
        <StatsCard title="Zusagen" value={String(dashboard.pendingResponses.length)} description="Antworten offen" icon={<MessageSquareMore className="h-5 w-5" />} />
        <StatsCard title="Aufgaben" value={String(dashboard.assignedTasks.length)} description="persönliche To-dos" icon={<ClipboardList className="h-5 w-5" />} />
      </section>

      {!hasInboxWork ? (
        <EmptyState
          title="Inbox ist leer"
          description="Wenn Termine, Aufgaben oder Team-Updates anstehen, erscheinen sie hier klar sortiert."
          action={
            <Button asChild variant="secondary">
              <Link href="/dashboard">Zurück zum Dashboard</Link>
            </Button>
          }
        />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Benachrichtigungen</p>
              <h2 className="mt-2 text-2xl font-semibold">Team-Updates</h2>
            </div>
            {unreadCount > 0 ? <Badge>{unreadCount} neu</Badge> : <Badge variant="outline">Aktuell</Badge>}
          </div>
          <div className="space-y-3">
            {dashboard.notifications.length > 0 ? (
              dashboard.notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.action_path ?? "/dashboard"}
                  className="group block rounded-[26px] border border-border bg-background/72 p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{notification.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{notification.body}</p>
                    </div>
                    {!notification.is_read ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>{formatDateTimeLabel(notification.created_at)}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      Öffnen
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[26px] border border-dashed border-border bg-background/50 p-5 text-sm text-muted-foreground">
                Noch keine Team-Updates vorhanden.
              </div>
            )}
          </div>
        </Card>

        <div className="grid gap-6">
          <Card className="p-6">
            <div className="mb-5">
              <p className="section-kicker">Offene Zusagen</p>
              <h2 className="mt-2 text-2xl font-semibold">Bitte antworten</h2>
            </div>
            <div className="space-y-3">
              {dashboard.pendingResponses.length > 0 ? (
                dashboard.pendingResponses.map((event) => (
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
                <p className="rounded-[26px] border border-dashed border-border bg-background/50 p-5 text-sm text-muted-foreground">
                  Keine offenen Rückmeldungen.
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-5">
              <p className="section-kicker">Aufgaben</p>
              <h2 className="mt-2 text-2xl font-semibold">Deine Liste</h2>
            </div>
            <div className="space-y-3">
              {dashboard.assignedTasks.length > 0 ? (
                dashboard.assignedTasks.map((task) => (
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
                    {task.due_at ? <p className="mt-2 text-xs font-semibold text-primary">Fällig: {formatDateTimeLabel(task.due_at)}</p> : null}
                  </Link>
                ))
              ) : (
                <p className="rounded-[26px] border border-dashed border-border bg-background/50 p-5 text-sm text-muted-foreground">
                  Keine offenen Aufgaben für dich.
                </p>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
