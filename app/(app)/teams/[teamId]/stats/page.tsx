import { notFound } from "next/navigation";
import { BarChart3, CalendarCheck2, CheckCircle2, Users } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { TeamTabs } from "@/components/team/team-tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getTeamById, listTeamEvents, listTeamMembersDetailed, listTeamTasks } from "@/lib/data";
import { profileName } from "@/lib/organization-data";
import { requireTeamAccess } from "@/lib/supabase-server";
import type { EventResponseRecord } from "@/lib/types";

type Props = { params: Promise<{ teamId: string }> };

export default async function TeamStatsPage({ params }: Props) {
  const { teamId } = await params;
  const { supabase, membership } = await requireTeamAccess(teamId, `/teams/${teamId}/stats`);
  const [team, members, events, tasks] = await Promise.all([
    getTeamById(supabase, teamId),
    listTeamMembersDetailed(supabase, teamId),
    listTeamEvents(supabase, teamId),
    listTeamTasks(supabase, teamId)
  ]);
  if (!team) notFound();

  const eventIds = events.map((event) => event.id);
  const { data: responseData } = eventIds.length
    ? await supabase.from("event_responses").select("*").in("event_id", eventIds)
    : { data: [] };
  const responses = ((responseData as EventResponseRecord[]) ?? []) as EventResponseRecord[];
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const yesResponses = responses.filter((response) => response.status === "yes").length;
  const responseRate = eventIds.length && members.length ? Math.round(responses.length / (eventIds.length * members.length) * 100) : 0;

  const rows = members.filter((member) => member.status === "active").map((member) => {
    const own = responses.filter((response) => response.user_id === member.user_id);
    const yes = own.filter((response) => response.status === "yes").length;
    const no = own.filter((response) => response.status === "no").length;
    const maybe = own.filter((response) => response.status === "maybe").length;
    const rate = events.length ? Math.round(yes / events.length * 100) : 0;
    return { member, yes, no, maybe, pending: Math.max(0, events.length - own.length), rate };
  }).sort((a, b) => b.rate - a.rate);

  return (
    <div className="page-stack">
      <Card className="p-8">
        <p className="section-kicker">Statistik</p>
        <h1 className="mt-2 text-4xl font-semibold">{team.name}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Teilnahme, Rückmeldungen und Aufgabenfortschritt in einer einfachen Teamübersicht.</p>
        <div className="mt-6"><TeamTabs teamId={team.id} showAdmin={membership.role === "owner"} /></div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Termine" value={String(events.length)} description="im aktuellen Datenbestand" icon={<CalendarCheck2 className="h-5 w-5" />} />
        <StatsCard title="Zusagen" value={String(yesResponses)} description="über alle Termine" icon={<Users className="h-5 w-5" />} />
        <StatsCard title="Rückmeldequote" value={`${responseRate}%`} description="beantwortete Einladungen" icon={<BarChart3 className="h-5 w-5" />} />
        <StatsCard title="Aufgabenquote" value={tasks.length ? `${Math.round(completedTasks / tasks.length * 100)}%` : "–"} description={`${completedTasks} von ${tasks.length} erledigt`} icon={<CheckCircle2 className="h-5 w-5" />} />
      </section>

      <Card className="overflow-hidden">
        <div className="border-b border-border p-6"><p className="section-kicker">Anwesenheit</p><h2 className="mt-2 text-2xl font-semibold">Teilnahme nach Mitglied</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="border-b border-border bg-background/60 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-6 py-4">Mitglied</th><th className="px-4 py-4">Zusagen</th><th className="px-4 py-4">Absagen</th><th className="px-4 py-4">Vielleicht</th><th className="px-4 py-4">Offen</th><th className="px-6 py-4 text-right">Teilnahme</th></tr></thead>
            <tbody className="divide-y divide-border/70">
              {rows.map(({ member, yes, no, maybe, pending, rate }) => <tr key={member.id} className="transition-colors hover:bg-white/[0.025]"><td className="px-6 py-4 font-semibold">{profileName(member.profile)}</td><td className="px-4 py-4 text-emerald-400">{yes}</td><td className="px-4 py-4 text-red-400">{no}</td><td className="px-4 py-4 text-amber-300">{maybe}</td><td className="px-4 py-4 text-muted-foreground">{pending}</td><td className="px-6 py-4 text-right"><Badge variant={rate >= 70 ? "success" : "muted"}>{rate}%</Badge></td></tr>)}
              {!rows.length ? <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">Noch keine Mitgliederstatistik verfügbar.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
