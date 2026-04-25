import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardCheck, ShieldCheck, UserRoundPlus, Users } from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    title: "Teams und Rollen",
    description: "Owner, Coaches, Spieler und Eltern arbeiten mit klaren Rechten in einem Teamraum zusammen.",
    icon: Users
  },
  {
    title: "Termine und Zusagen",
    description: "Trainings, Spiele und Events mit Zu- und Absagen, Kommentaren und Statusuebersicht.",
    icon: CalendarDays
  },
  {
    title: "Invite-Links",
    description: "Teile einen sicheren Join-Link, kopiere ihn mit einem Klick und hole neue Mitglieder schnell ins Team.",
    icon: UserRoundPlus
  },
  {
    title: "Aufgaben und Follow-ups",
    description: "Checklisten, Zuständigkeiten und Benachrichtigungen bleiben direkt im Teamkontext sichtbar.",
    icon: ClipboardCheck
  }
];

export default function HomePage() {
  return (
    <main>
      <section className="content-wrap py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              SpielerPlus-inspirierte Team-App
            </div>
            <div className="space-y-6">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">
                SmarTrain verbindet Teamplanung, Rueckmeldungen und Kommunikation in einer ruhigen SaaS-Oberflaeche.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Erstelle Teams, lade Spieler ueber Invite-Links ein, plane Termine und behalte Zusagen, Aufgaben und offene Antworten an einem Ort im Blick.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signup">
                  Kostenlos starten
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/login">Login</Link>
              </Button>
            </div>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="rounded-3xl border border-border bg-card px-4 py-4">Teams, Rollen und sichere Invite-Links</div>
              <div className="rounded-3xl border border-border bg-card px-4 py-4">Dashboard fuer heutige Termine und offene Zusagen</div>
              <div className="rounded-3xl border border-border bg-card px-4 py-4">Supabase-Auth und Vercel-ready</div>
            </div>
          </div>

          <Card className="overflow-hidden p-8">
            <div className="rounded-[30px] bg-foreground px-6 py-6 text-white">
              <div className="flex items-center justify-between">
                <Logo className="text-white [&_span:last-child]:text-white [&_span:first-child+span_span:first-child]:text-white/70" />
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                  Live Dashboard
                </div>
              </div>
              <div className="mt-8 grid gap-4">
                <div className="rounded-3xl bg-white p-5 text-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Heute</p>
                  <p className="mt-2 text-2xl font-semibold">3 Termine</p>
                  <p className="mt-2 text-sm text-slate-500">Training, Matchday-Briefing und Fahrgemeinschaftsplanung.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white/10 p-5">
                    <p className="text-sm text-white/60">Offene Zusagen</p>
                    <p className="mt-2 text-3xl font-semibold">8</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-5">
                    <p className="text-sm text-white/60">Neue Aufgaben</p>
                    <p className="mt-2 text-3xl font-semibold">4</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="features" className="content-wrap py-8 sm:py-12">
        <div className="mb-8 max-w-2xl">
          <p className="section-kicker">Features</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Alles, was ein modernes Sportteam im Alltag braucht.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="p-6 transition-transform hover:-translate-y-1">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="workflow" className="content-wrap py-12">
        <Card className="grid gap-8 p-8 lg:grid-cols-3">
          <div>
            <p className="section-kicker">Workflow</p>
            <h2 className="mt-3 text-3xl font-semibold">Von der Teamgruendung bis zum Spieltag in einem Flow.</h2>
          </div>
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-3xl border border-border bg-background/60 p-5">
              <h3 className="font-semibold">1. Team anlegen</h3>
              <p className="mt-2 text-sm text-muted-foreground">Sportart, Saison, Farbe und Rollen festlegen.</p>
            </div>
            <div className="rounded-3xl border border-border bg-background/60 p-5">
              <h3 className="font-semibold">2. Mitglieder per Link einladen</h3>
              <p className="mt-2 text-sm text-muted-foreground">Invite kopieren, teilen und den Join-Flow automatisch fortsetzen.</p>
            </div>
            <div className="rounded-3xl border border-border bg-background/60 p-5">
              <h3 className="font-semibold">3. Termine, Aufgaben und Zusagen verfolgen</h3>
              <p className="mt-2 text-sm text-muted-foreground">Dashboard, Event-Detail und Inbox liefern den Ueberblick.</p>
            </div>
          </div>
        </Card>
      </section>

      <section id="pricing" className="content-wrap py-12">
        <Card className="flex flex-col gap-6 p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="section-kicker">Pricing</p>
            <h2 className="text-3xl font-semibold">Starte kostenlos und entwickle dein Team digital weiter.</h2>
            <p className="max-w-2xl text-muted-foreground">
              SmarTrain ist als moderne Basis fuer Sportteams gebaut und laeuft auf deiner bestehenden Supabase- und Vercel-Umgebung.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/signup">Account erstellen</Link>
          </Button>
        </Card>
      </section>
    </main>
  );
}
