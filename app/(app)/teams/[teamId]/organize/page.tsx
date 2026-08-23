import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Banknote,
  BarChart3,
  CalendarOff,
  Car,
  CheckCircle2,
  Download,
  Megaphone,
  MessageCircle,
  Vote
} from "lucide-react";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { SubmitButton } from "@/components/forms/submit-button";
import { StatsCard } from "@/components/stats-card";
import { TeamTabs } from "@/components/team/team-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createAbsenceAction,
  createCarpoolAction,
  createLedgerEntryAction,
  createPollAction,
  createTeamUpdateAction,
  deleteAbsenceAction,
  deleteTeamUpdateAction,
  toggleCarpoolRideAction,
  toggleLedgerStatusAction,
  votePollAction
} from "@/lib/actions";
import { managerRoles } from "@/lib/constants";
import { getTeamById, listTeamEvents, listTeamMembersDetailed } from "@/lib/data";
import {
  getOrganizationFeatureSupport,
  listTeamAbsences,
  listTeamCarpools,
  listTeamLedger,
  listTeamPolls,
  listTeamUpdates,
  profileName
} from "@/lib/organization-data";
import { requireTeamAccess } from "@/lib/supabase-server";
import { formatDateLabel, formatDateTimeLabel } from "@/lib/utils";

type Props = { params: Promise<{ teamId: string }> };

const absenceLabels = {
  holiday: "Ferien",
  illness: "Krankheit",
  injury: "Verletzung",
  school: "Schule",
  work: "Arbeit",
  other: "Sonstiges"
};

const money = new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" });

export default async function TeamOrganizationPage({ params }: Props) {
  const { teamId } = await params;
  const { supabase, membership, user } = await requireTeamAccess(teamId, `/teams/${teamId}/organize`);
  const [team, members, events, supported] = await Promise.all([
    getTeamById(supabase, teamId),
    listTeamMembersDetailed(supabase, teamId),
    listTeamEvents(supabase, teamId),
    getOrganizationFeatureSupport(supabase)
  ]);
  if (!team) notFound();

  const canManage = managerRoles.includes(membership.role);
  const isOwner = membership.role === "owner";
  const nowIso = new Date().toISOString();

  if (!supported) {
    return (
      <div className="page-stack">
        <Card className="p-8">
          <p className="section-kicker">Teamzentrale</p>
          <h1 className="mt-2 text-4xl font-semibold">{team.name}</h1>
          <p className="mt-3 text-muted-foreground">Kommunikation, Abwesenheiten, Fahrgemeinschaften, Abstimmungen und Teamkasse an einem Ort.</p>
          <div className="mt-6"><TeamTabs teamId={team.id} showAdmin={isOwner} /></div>
        </Card>
        <Card className="border-primary/25 p-8">
          <h2 className="text-2xl font-semibold">Teamzentrale wird eingerichtet</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Die Oberfläche ist bereit. Für dieses Supabase-Projekt muss noch die neue Datenbankmigration ausgeführt werden.</p>
        </Card>
      </div>
    );
  }

  const [news, messages, polls, absences, carpools, ledger] = await Promise.all([
    listTeamUpdates(supabase, teamId, "news"),
    listTeamUpdates(supabase, teamId, "message"),
    listTeamPolls(supabase, teamId, user.id),
    listTeamAbsences(supabase, teamId),
    listTeamCarpools(supabase, teamId),
    listTeamLedger(supabase, teamId)
  ]);
  const openLedger = ledger.filter((entry) => entry.status === "open");
  const openAmount = openLedger.reduce((total, entry) => total + entry.amount_cents, 0) / 100;

  return (
    <div className="page-stack">
      <Card className="p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker">Teamzentrale</p>
            <h1 className="mt-2 text-4xl font-semibold">{team.name}</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">News, Chat, Abstimmungen und Organisation – ohne verstreute Gruppen-Chats und Listen.</p>
          </div>
          <Button asChild variant="secondary">
            <Link href={`/api/teams/${team.id}/calendar`}>
              <Download className="h-4 w-4" /> Kalender exportieren
            </Link>
          </Button>
        </div>
        <div className="mt-6"><TeamTabs teamId={team.id} showAdmin={isOwner} /></div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Neuigkeiten" value={String(news.length)} description="Mitteilungen im Team" icon={<Megaphone className="h-5 w-5" />} />
        <StatsCard title="Abstimmungen" value={String(polls.length)} description="offen und abgeschlossen" icon={<Vote className="h-5 w-5" />} />
        <StatsCard title="Abwesenheiten" value={String(absences.length)} description="aktuell vorgemerkt" icon={<CalendarOff className="h-5 w-5" />} />
        <StatsCard title="Offene Kasse" value={money.format(openAmount)} description={`${openLedger.length} offene Posten`} icon={<Banknote className="h-5 w-5" />} />
      </section>

      <nav aria-label="Bereiche der Teamzentrale" className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          ["news", "News", Megaphone], ["chat", "Chat", MessageCircle], ["polls", "Abstimmen", Vote],
          ["absences", "Abwesend", CalendarOff], ["carpools", "Fahrten", Car], ["cash", "Kasse", Banknote]
        ].map(([id, label, Icon]) => (
          <a key={String(id)} href={`#${id}`} className="group flex items-center gap-3 border border-border bg-card/80 p-4 text-sm font-semibold transition-colors hover:border-primary/35 hover:text-primary">
            <Icon className="h-4 w-4" /> {String(label)}
          </a>
        ))}
      </nav>

      <section id="news" className="scroll-mt-28 grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
        {canManage ? (
          <Card className="p-6">
            <p className="section-kicker">Neuigkeit</p><h2 className="mt-2 text-2xl font-semibold">Team informieren</h2>
            <form action={createTeamUpdateAction.bind(null, team.id, "news")} className="mt-5 grid gap-4">
              <Input name="title" placeholder="Kurzer Titel" maxLength={140} required />
              <Textarea name="body" placeholder="Was muss das Team wissen?" maxLength={4000} required />
              <label className="flex items-center gap-3 text-sm text-muted-foreground"><input type="checkbox" name="is_pinned" className="rounded border-border" /> Oben anheften</label>
              <SubmitButton pendingLabel="Wird veröffentlicht...">Veröffentlichen</SubmitButton>
            </form>
          </Card>
        ) : null}
        <Card className="p-6">
          <p className="section-kicker">News</p><h2 className="mt-2 text-2xl font-semibold">Wichtiges auf einen Blick</h2>
          <div className="mt-5 space-y-3">
            {news.length ? news.map((entry) => (
              <article key={entry.id} className="border border-border bg-background/70 p-5">
                <div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold">{entry.title}</h3>{entry.is_pinned ? <Badge>Angeheftet</Badge> : null}</div><p className="mt-1 text-xs text-muted-foreground">{profileName(entry.author)} · {formatDateTimeLabel(entry.created_at)}</p></div>
                  {(canManage || entry.author_id === user.id) ? <form action={deleteTeamUpdateAction.bind(null, team.id, entry.id, "news")}><ConfirmSubmit variant="ghost" confirmMessage="Neuigkeit löschen?">Löschen</ConfirmSubmit></form> : null}
                </div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{entry.body}</p>
              </article>
            )) : <p className="text-sm text-muted-foreground">Noch keine Neuigkeiten veröffentlicht.</p>}
          </div>
        </Card>
      </section>

      <section id="chat" className="scroll-mt-28 grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <Card className="p-6">
          <p className="section-kicker">Team-Chat</p><h2 className="mt-2 text-2xl font-semibold">Direkter Austausch</h2>
          <div className="mt-5 max-h-[32rem] space-y-3 overflow-y-auto pr-2">
            {messages.length ? [...messages].reverse().map((entry) => (
              <div key={entry.id} className={`max-w-[88%] border p-4 ${entry.author_id === user.id ? "ml-auto border-primary/25 bg-primary/10" : "border-border bg-background/70"}`}>
                <p className="text-xs font-semibold text-primary">{profileName(entry.author)} · {formatDateTimeLabel(entry.created_at)}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{entry.body}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">Noch keine Nachrichten. Starte die Unterhaltung.</p>}
          </div>
        </Card>
        <Card className="p-6">
          <p className="section-kicker">Neue Nachricht</p><h2 className="mt-2 text-2xl font-semibold">Ans Team schreiben</h2>
          <form action={createTeamUpdateAction.bind(null, team.id, "message")} className="mt-5 grid gap-4">
            <Textarea name="body" placeholder="Nachricht eingeben …" maxLength={4000} required />
            <SubmitButton pendingLabel="Wird gesendet...">Nachricht senden</SubmitButton>
          </form>
        </Card>
      </section>

      <section id="polls" className="scroll-mt-28 grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
        {canManage ? <Card className="p-6"><p className="section-kicker">Abstimmung</p><h2 className="mt-2 text-2xl font-semibold">Entscheidung einholen</h2>
          <form action={createPollAction.bind(null, team.id)} className="mt-5 grid gap-4"><Input name="question" placeholder="Frage" required /><Textarea name="description" placeholder="Optionaler Kontext" /><Textarea name="options" placeholder="Optionen mit Komma oder je einer Zeile trennen" required /><Input name="closes_at" type="datetime-local" /><SubmitButton pendingLabel="Wird erstellt...">Abstimmung erstellen</SubmitButton></form>
        </Card> : null}
        <div className="space-y-4">
          {polls.length ? polls.map((poll) => {
            const total = poll.options.reduce((sum, option) => sum + option.votes, 0);
            const closed = poll.closes_at ? poll.closes_at < nowIso : false;
            return <Card key={poll.id} className="p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="section-kicker">Abstimmung</p><h3 className="mt-2 text-xl font-semibold">{poll.question}</h3><p className="mt-2 text-sm text-muted-foreground">{poll.description ?? `${total} Stimmen`}</p></div>{closed ? <Badge variant="muted">Beendet</Badge> : <Badge variant="success">Offen</Badge>}</div>
              <form action={votePollAction.bind(null, team.id, poll.id)} className="mt-5 space-y-3">{poll.options.map((option) => { const percentage = total ? Math.round(option.votes / total * 100) : 0; return <label key={option.id} className="relative flex cursor-pointer items-center gap-3 overflow-hidden border border-border bg-background/70 p-4"><span className="absolute inset-y-0 left-0 bg-primary/10" style={{ width: `${percentage}%` }} /><input className="relative" type="radio" name="option_id" value={option.id} defaultChecked={poll.own_option_id === option.id} disabled={closed} /><span className="relative flex-1 text-sm font-semibold">{option.label}</span><span className="relative text-xs text-muted-foreground">{option.votes} · {percentage}%</span></label>})}{!closed ? <SubmitButton variant="secondary" pendingLabel="Speichert...">Stimme speichern</SubmitButton> : null}</form>
            </Card>;
          }) : <Card className="p-8 text-sm text-muted-foreground">Noch keine Abstimmungen vorhanden.</Card>}
        </div>
      </section>

      <section id="absences" className="scroll-mt-28 grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
        <Card className="p-6"><p className="section-kicker">Abwesenheit</p><h2 className="mt-2 text-2xl font-semibold">Zeitraum vormerken</h2>
          <form action={createAbsenceAction.bind(null, team.id)} className="mt-5 grid gap-4"><div className="grid gap-4 sm:grid-cols-2"><Input name="starts_on" type="date" required /><Input name="ends_on" type="date" required /></div><Select name="reason" defaultValue="holiday"><option value="holiday">Ferien</option><option value="illness">Krankheit</option><option value="injury">Verletzung</option><option value="school">Schule</option><option value="work">Arbeit</option><option value="other">Sonstiges</option></Select><Input name="note" placeholder="Optionale Notiz" /><SubmitButton pendingLabel="Wird gespeichert...">Abwesenheit eintragen</SubmitButton></form>
        </Card>
        <Card className="p-6"><p className="section-kicker">Planung</p><h2 className="mt-2 text-2xl font-semibold">Kommende Abwesenheiten</h2><div className="mt-5 space-y-3">{absences.length ? absences.map((entry) => <div key={entry.id} className="flex flex-col gap-3 border border-border bg-background/70 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{profileName(entry.profile)} <Badge variant="outline">{absenceLabels[entry.reason]}</Badge></p><p className="mt-1 text-sm text-muted-foreground">{formatDateLabel(entry.starts_on)} – {formatDateLabel(entry.ends_on)}{entry.note ? ` · ${entry.note}` : ""}</p></div>{(canManage || entry.user_id === user.id) ? <form action={deleteAbsenceAction.bind(null, team.id, entry.id)}><ConfirmSubmit variant="ghost" confirmMessage="Abwesenheit entfernen?">Entfernen</ConfirmSubmit></form> : null}</div>) : <p className="text-sm text-muted-foreground">Keine kommenden Abwesenheiten.</p>}</div></Card>
      </section>

      <section id="carpools" className="scroll-mt-28 grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
        <Card className="p-6"><p className="section-kicker">Fahrgemeinschaft</p><h2 className="mt-2 text-2xl font-semibold">Fahrt anbieten</h2><form action={createCarpoolAction.bind(null, team.id)} className="mt-5 grid gap-4"><Select name="event_id" defaultValue=""><option value="">Allgemeine Fahrt</option>{events.filter((event) => event.starts_at >= nowIso).map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</Select><div className="grid gap-4 sm:grid-cols-2"><Input name="meeting_point" placeholder="Treffpunkt" required /><Input name="seats" type="number" min="1" max="20" defaultValue="3" required /></div><Input name="departure_at" type="datetime-local" /><Input name="note" placeholder="Optionale Notiz" /><SubmitButton pendingLabel="Wird angeboten...">Fahrt anbieten</SubmitButton></form></Card>
        <Card className="p-6"><p className="section-kicker">Mitfahren</p><h2 className="mt-2 text-2xl font-semibold">Freie Plätze</h2><div className="mt-5 space-y-3">{carpools.length ? carpools.map((entry) => { const joined = entry.rider_ids.includes(user.id); const free = Math.max(0, entry.seats - entry.rider_ids.length); return <div key={entry.id} className="border border-border bg-background/70 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold">{entry.event?.title ?? "Fahrgemeinschaft"}</p><p className="mt-1 text-sm text-muted-foreground">{profileName(entry.driver)} · {entry.meeting_point}{entry.departure_at ? ` · ${formatDateTimeLabel(entry.departure_at)}` : ""}</p><p className="mt-2 text-sm">{free} von {entry.seats} Plätzen frei{entry.note ? ` · ${entry.note}` : ""}</p></div>{entry.driver_id !== user.id ? <form action={toggleCarpoolRideAction.bind(null, team.id, entry.id)}><SubmitButton variant={joined ? "ghost" : "secondary"} pendingLabel="Speichert..." disabled={!joined && free === 0}>{joined ? "Platz freigeben" : free ? "Mitfahren" : "Voll"}</SubmitButton></form> : <Badge>Du fährst</Badge>}</div></div>}) : <p className="text-sm text-muted-foreground">Noch keine Fahrten angeboten.</p>}</div></Card>
      </section>

      <section id="cash" className="scroll-mt-28 grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
        {canManage ? <Card className="p-6"><p className="section-kicker">Teamkasse</p><h2 className="mt-2 text-2xl font-semibold">Posten erfassen</h2><form action={createLedgerEntryAction.bind(null, team.id)} className="mt-5 grid gap-4"><div className="grid gap-4 sm:grid-cols-2"><Select name="kind" defaultValue="fine"><option value="fine">Strafe</option><option value="fee">Beitrag</option><option value="income">Einnahme</option><option value="expense">Ausgabe</option></Select><Input name="amount" type="number" min="0.05" step="0.05" placeholder="Betrag in CHF" required /></div><Input name="title" placeholder="Bezeichnung" required /><Select name="member_id" defaultValue=""><option value="">Allgemeiner Team-Posten</option>{members.map((member) => <option key={member.id} value={member.user_id}>{profileName(member.profile)}</option>)}</Select><Input name="due_on" type="date" /><Input name="note" placeholder="Optionale Notiz" /><SubmitButton pendingLabel="Wird verbucht...">Posten erfassen</SubmitButton></form></Card> : null}
        <Card className="p-6"><div className="flex items-start justify-between gap-4"><div><p className="section-kicker">Kassenbuch</p><h2 className="mt-2 text-2xl font-semibold">Beiträge, Strafen & Ausgaben</h2></div><BarChart3 className="h-6 w-6 text-primary" /></div><div className="mt-5 space-y-3">{ledger.length ? ledger.map((entry) => <div key={entry.id} className="flex flex-col gap-4 border border-border bg-background/70 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{entry.title}</p><Badge variant={entry.status === "paid" ? "success" : "muted"}>{entry.status === "paid" ? "Erledigt" : "Offen"}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{profileName(entry.member)} · {entry.due_on ? `fällig ${formatDateLabel(entry.due_on)}` : "ohne Frist"}</p></div><div className="flex items-center gap-3"><p className="text-lg font-semibold">{money.format(entry.amount_cents / 100)}</p>{canManage ? <form action={toggleLedgerStatusAction.bind(null, team.id, entry.id, entry.status === "paid" ? "open" : "paid")}><SubmitButton size="sm" variant="secondary" pendingLabel="Speichert..."><CheckCircle2 className="h-4 w-4" />{entry.status === "paid" ? "Öffnen" : "Erledigt"}</SubmitButton></form> : null}</div></div>) : <p className="text-sm text-muted-foreground">Noch keine Kassenbewegungen vorhanden.</p>}</div></Card>
      </section>
    </div>
  );
}
