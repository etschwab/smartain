import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  MessageSquareHeart,
  ShieldCheck,
  UserRoundPlus,
  Users
} from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    title: "Teams und Rollen",
    description: "Owner, Coaches, Spieler und Eltern arbeiten mit klaren Rechten in einem gemeinsamen Teamraum.",
    icon: Users
  },
  {
    title: "Termine und Zusagen",
    description: "Trainings, Spiele und Events mit Zusage, Absage, Vielleicht-Status und Kommentaren.",
    icon: CalendarDays
  },
  {
    title: "Einladungen per Link",
    description: "Neue Mitglieder treten per Invite-Link bei, ohne manuelle Listen oder verstreute Nachrichten.",
    icon: UserRoundPlus
  },
  {
    title: "Aufgaben im Teamkontext",
    description: "Material, Fahrten und Orga-Punkte bleiben dort sichtbar, wo das Team ohnehin arbeitet.",
    icon: ClipboardCheck
  }
];

const workflow = [
  "Teamraum erstellen und Rollen festlegen",
  "Mitglieder über einen sicheren Invite-Link einladen",
  "Termine planen und Rückmeldungen einsammeln",
  "Aufgaben verteilen und offene Punkte im Dashboard schließen"
];

export default function HomePage() {
  return (
    <main>
      <section className="content-wrap pb-16 pt-10 sm:pb-24 sm:pt-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
            <ShieldCheck className="h-4 w-4 text-primary" />
            SpielerPlus-inspirierte Organisation für moderne Teams
          </div>
          <h1 className="text-6xl font-semibold leading-none sm:text-7xl lg:text-8xl">
            SmarTrain
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Die ruhige Kommandozentrale für Teams, Termine, Zusagen, Einladungen und Aufgaben.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">
                Kostenlos starten
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="#demo">Demo ansehen</Link>
            </Button>
          </div>
        </div>

        <div id="demo" className="mx-auto mt-14 max-w-6xl">
          <Card className="overflow-hidden border-border/70 bg-white/95 p-3 shadow-[0_40px_120px_-64px_rgba(15,23,42,0.55)]">
            <div className="rounded-[24px] border border-border bg-[linear-gradient(180deg,#f8fafc,#ffffff)] p-4 sm:p-6">
              <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <Logo href="/" />
                <Badge variant="outline">Produktvorschau</Badge>
              </div>
              <div className="grid gap-4 pt-5 lg:grid-cols-[1.05fr,0.95fr]">
                <div className="rounded-[22px] border border-border bg-card p-5">
                  <p className="section-kicker">Heute</p>
                  <h2 className="mt-3 text-3xl font-semibold">Abendtraining U17</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Status, Ort, Antworten und offene Aufgaben liegen in einer Ansicht, ohne Chat-Verlauf und ohne Tabellenchaos.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-sm text-muted-foreground">Zugesagt</p>
                      <p className="mt-2 text-2xl font-semibold">Preview</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-sm text-muted-foreground">Offen</p>
                      <p className="mt-2 text-2xl font-semibold">Live</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-sm text-muted-foreground">Aufgaben</p>
                      <p className="mt-2 text-2xl font-semibold">Team</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-[22px] border border-border bg-card p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">Schnelle Aktionen</p>
                        <p className="mt-1 text-sm text-muted-foreground">Direkt aus dem Dashboard starten.</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <span className="rounded-full border border-border px-3 py-2 text-sm">Team erstellen</span>
                      <span className="rounded-full border border-border px-3 py-2 text-sm">Termin planen</span>
                      <span className="rounded-full border border-border px-3 py-2 text-sm">Aufgabe anlegen</span>
                      <span className="rounded-full border border-border px-3 py-2 text-sm">Invite kopieren</span>
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-border bg-card p-5">
                    <p className="font-semibold">Rückmeldungen</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Zusage, Absage, Vielleicht und Kommentare werden pro Termin sauber zusammengeführt.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="features" className="content-wrap py-14 sm:py-20">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="section-kicker">Features</p>
          <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">Alles Wichtige, ohne Lärm.</h2>
          <p className="mt-4 text-muted-foreground">
            SmarTrain organisiert die wiederkehrenden Abläufe eines Sportteams in klaren, mobilen Ansichten.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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

      <section id="workflow" className="content-wrap py-14">
        <div className="grid gap-10 lg:grid-cols-[0.8fr,1.2fr] lg:items-start">
          <div>
            <p className="section-kicker">Workflow</p>
            <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
              Von der Teamgründung bis zum Spieltag in einem Fluss.
            </h2>
          </div>
          <div className="grid gap-3">
            {workflow.map((item, index) => (
              <div key={item} className="flex gap-4 rounded-[24px] border border-border bg-card/90 p-5 shadow-sm">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <p className="pt-1 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="content-wrap py-16 sm:py-24">
        <div className="rounded-[30px] border border-border bg-card/95 px-6 py-10 text-center shadow-[0_36px_100px_-70px_rgba(15,23,42,0.55)] sm:px-10">
          <p className="section-kicker">Start</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold sm:text-5xl">
            Baue deinen Teamraum kostenlos auf und teste den kompletten Flow.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Ideal für Coaches, Vereine und Elternteams, die Planung, Einladungen und Rückmeldungen an einem Ort bündeln wollen.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <Link href="/signup">
                Kostenlos starten
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
