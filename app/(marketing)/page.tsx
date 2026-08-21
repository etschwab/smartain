import Link from "next/link";
import { ArrowDownRight, ArrowRight, CalendarDays, ClipboardCheck, UserRoundPlus, Users } from "lucide-react";

const features = [
  { number: "01", title: "Teams & Rollen", description: "Owner, Coaches, Spieler und Eltern arbeiten mit klaren Rechten in einem gemeinsamen Teamraum.", icon: Users },
  { number: "02", title: "Termine & Zusagen", description: "Trainings, Spiele und Events mit Zusage, Absage, Vielleicht-Status und Kommentaren.", icon: CalendarDays },
  { number: "03", title: "Einladungen", description: "Neue Mitglieder treten per sicherem Link bei – ohne manuelle Listen oder verstreute Nachrichten.", icon: UserRoundPlus },
  { number: "04", title: "Aufgaben", description: "Material, Fahrten und Organisation bleiben dort sichtbar, wo das Team ohnehin arbeitet.", icon: ClipboardCheck }
];

const workflow = [
  ["01", "Teamraum erstellen", "Name festlegen, Rollen verteilen und die gemeinsame Arbeitsfläche vorbereiten."],
  ["02", "Mitglieder einladen", "Mit einem sicheren Link kommen Coaches, Spieler und Eltern direkt ins richtige Team."],
  ["03", "Training planen", "Termine erfassen, Antworten sammeln und offene Rückmeldungen sofort erkennen."],
  ["04", "Gemeinsam handeln", "Aufgaben verteilen und den nächsten Spieltag ohne Nachrichtenchaos vorbereiten."]
];

const audiences = [
  ["01", "Coaches", "Planen Trainings und Spiele, sehen Rückmeldungen sofort und halten Aufgaben dort fest, wo sie hingehören."],
  ["02", "Spieler", "Erkennen auf einen Blick, was als Nächstes ansteht, und melden ihre Teilnahme ohne Umwege zurück."],
  ["03", "Eltern", "Behalten Termine und organisatorische Informationen im Blick, ohne wichtige Details in Chats suchen zu müssen."]
];

export default function HomePage() {
  return (
    <main id="main-content">
      <section className="smartrain-hero content-wrap">
        <div className="smartrain-hero-copy">
          <p className="section-kicker">Team-App · Training · 2026</p>
          <h1>
            Smartrain
            <em>Team.</em>
          </h1>
          <div className="smartrain-hero-role">
            <p>Team-Management &amp; Training</p>
            <ArrowDownRight className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Die ruhige Kommandozentrale für Teams, Termine, Zusagen, Einladungen und Aufgaben.</p>
          <div className="smartrain-hero-actions">
            <Link href="/signup" className="editorial-link">Kostenlos starten <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/login" className="editorial-link text-muted-foreground">Einloggen</Link>
          </div>
        </div>
      </section>

      <section id="features" className="editorial-section scroll-mt-28">
        <div className="content-wrap">
        <div className="editorial-section-heading">
          <div>
            <p className="section-kicker">Funktionen</p>
            <h2>Alles Wichtige,<br /><span className="display-serif">ohne Lärm.</span></h2>
          </div>
          <p>Smartrain organisiert die wiederkehrenden Abläufe eines Sportteams in klaren, mobilen Ansichten.</p>
        </div>
        <div className="editorial-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.number} className="editorial-card">
                <div className="flex items-start justify-between">
                  <span>{feature.number}</span>
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>
        </div>
      </section>

      <section id="workflow" className="editorial-section is-transparent scroll-mt-28">
        <div className="content-wrap">
        <div className="editorial-section-heading">
          <div>
            <p className="section-kicker">Ablauf</p>
            <h2>Vom ersten Team<br /><span className="display-serif">bis zum Spieltag.</span></h2>
          </div>
          <p>Vier klare Schritte bringen das ganze Team auf denselben Stand.</p>
        </div>
        <div className="border-t border-white/10">
          {workflow.map(([number, title, description]) => (
            <article key={number} className="grid gap-4 border-b border-white/10 py-7 sm:grid-cols-[4rem_minmax(12rem,0.7fr)_1fr] sm:items-start sm:py-9">
              <span className="text-xs font-semibold tracking-[0.18em] text-primary">{number}</span>
              <h3 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{title}</h3>
              <p className="max-w-xl leading-7 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
        </div>
      </section>

      <section className="editorial-section">
        <div className="content-wrap">
          <div className="editorial-section-heading">
            <div>
              <p className="section-kicker">Für das ganze Team</p>
              <h2>Jede Rolle weiss,<br /><span className="display-serif">was jetzt zählt.</span></h2>
            </div>
            <p>Eine gemeinsame Informationsquelle – mit genau den Ansichten und Aktionen, die im jeweiligen Moment relevant sind.</p>
          </div>
          <div className="audience-grid">
            {audiences.map(([number, title, description]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="start" className="editorial-section is-transparent scroll-mt-28 pb-24 sm:pb-32">
        <div className="content-wrap">
        <p className="section-kicker">Bereit?</p>
        <div className="mt-6 grid gap-8 border-y border-white/10 py-10 lg:grid-cols-[1fr_auto] lg:items-end lg:py-14">
          <h2 className="max-w-5xl text-5xl font-semibold leading-[0.9] tracking-[-0.065em] sm:text-7xl lg:text-8xl">Dein Team.<br /><span className="display-serif text-primary">Ein klarer Plan.</span></h2>
          <Link href="/signup" className="inline-flex w-fit items-center gap-2 bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85">Kostenlos starten <ArrowRight className="h-4 w-4" /></Link>
        </div>
        </div>
      </section>
    </main>
  );
}
