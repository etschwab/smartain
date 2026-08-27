import Link from "next/link";
import { ArrowDownRight, ArrowRight, BarChart3, CalendarDays, Car, Check, ClipboardCheck, Clock3, MapPin, MessageCircle, ShieldCheck, UserRoundPlus, Users, Vote } from "lucide-react";

const features = [
  { number: "01", title: "Teams & Rollen", description: "Owner, Coaches, Spieler und Eltern arbeiten mit klaren Rechten in einem gemeinsamen Teamraum.", icon: Users },
  { number: "02", title: "Termine & Zusagen", description: "Trainings, Spiele und Events mit Zusage, Absage, Vielleicht-Status und Kommentaren.", icon: CalendarDays },
  { number: "03", title: "Einladungen", description: "Neue Mitglieder treten per sicherem Link bei – ohne manuelle Listen oder verstreute Nachrichten.", icon: UserRoundPlus },
  { number: "04", title: "Aufgaben", description: "Material, Checklisten und Zuständigkeiten bleiben dort sichtbar, wo das Team ohnehin arbeitet.", icon: ClipboardCheck },
  { number: "05", title: "News & Team-Chat", description: "Wichtige Mitteilungen, schnelle Rückfragen und Teamwissen landen in einem gemeinsamen Verlauf.", icon: MessageCircle },
  { number: "06", title: "Abstimmungen", description: "Entscheidungen werden mit klaren Optionen, Frist und sofort sichtbarem Ergebnis getroffen.", icon: Vote },
  { number: "07", title: "Fahrten & Teamkasse", description: "Mitfahrplätze, Beiträge, Ausgaben und Strafen werden direkt im Team organisiert.", icon: Car },
  { number: "08", title: "Aufstellung & Statistik", description: "Kader, Positionen, Anwesenheit und Rückmeldequoten geben Coaches den nötigen Überblick.", icon: BarChart3 }
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

const benefits = [
  ["Ein Teamraum", "für Termine, Aufgaben und Kommunikation"],
  ["Jede Rolle", "sieht nur, was sie wirklich braucht"],
  ["Jederzeit", "mobil und ohne App-Chaos erreichbar"]
];

const faqs = [
  ["Für welche Teams ist Smartrain gedacht?", "Für Sportteams, Trainerstäbe und Vereine, die Training, Spieltage und die Organisation dazwischen an einem Ort bündeln möchten."],
  ["Brauchen alle Mitglieder einen eigenen Zugang?", "Ja. Coaches, Spieler und Eltern treten über einen Einladungslink bei und erhalten die passende Rolle mit den dazugehörigen Rechten."],
  ["Funktioniert Smartrain auch auf dem Smartphone?", "Ja. Die Oberfläche ist für mobile Nutzung optimiert, damit Zu- und Absagen, Termine und Mitteilungen auch unterwegs schnell erreichbar sind."],
  ["Kann ich erst einmal kostenlos starten?", "Ja. Du kannst direkt ein Konto erstellen, deinen Teamraum anlegen und die ersten Mitglieder einladen."]
];

export default function HomePage() {
  return (
    <main id="main-content">
      <section className="smartrain-hero content-wrap">
        <div className="smartrain-hero-copy">
          <p className="section-kicker">Die Team-App für den Sportalltag</p>
          <h1>
            Smartrain
            <em>Team.</em>
          </h1>
          <div className="smartrain-hero-role">
            <p>Team-Management &amp; Training</p>
            <ArrowDownRight className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Weniger Nachrichtenchaos, mehr Zeit fürs Team: Plane Termine, sammle Zusagen und organisiere Spieltage in einer gemeinsamen, übersichtlichen App.</p>
          <div className="smartrain-hero-actions">
            <Link href="/signup" className="hero-primary-action">Team kostenlos erstellen <ArrowRight className="h-4 w-4" /></Link>
            <Link href="#features" className="editorial-link text-muted-foreground">Funktionen ansehen</Link>
          </div>
          <p className="hero-trust"><ShieldCheck aria-hidden="true" /> In wenigen Minuten eingerichtet · Für Coaches, Spieler &amp; Eltern</p>
        </div>

        <div className="hero-product-preview" aria-label="Beispielansicht eines Team-Dashboards">
          <div className="preview-topline"><div><span className="preview-dot" /> FC Beispiel · 1. Mannschaft</div><span>Dashboard</span></div>
          <div className="preview-event">
            <div className="preview-date"><strong>29</strong><span>Aug</span></div>
            <div className="preview-event-copy"><span className="preview-label">Nächster Termin</span><h2>Training</h2><p><Clock3 aria-hidden="true" /> 18:30 Uhr <MapPin aria-hidden="true" /> Sportplatz Nord</p></div>
          </div>
          <div className="preview-status-grid">
            <div><strong>16</strong><span><Check aria-hidden="true" /> Dabei</span></div><div><strong>3</strong><span>Noch offen</span></div><div><strong>2</strong><span>Abwesend</span></div>
          </div>
          <div className="preview-task"><span><ClipboardCheck aria-hidden="true" /></span><div><strong>Material fürs Training</strong><small>2 von 3 Aufgaben erledigt</small></div><span className="preview-progress">67%</span></div>
        </div>
      </section>

      <section className="benefit-strip" aria-label="Vorteile von Smartrain"><div className="content-wrap benefit-strip-grid">
        {benefits.map(([title, description], index) => <div key={title}><span>0{index + 1}</span><p><strong>{title}</strong>{description}</p></div>)}
      </div></section>

      <section id="features" className="editorial-section scroll-mt-28">
        <div className="content-wrap">
        <div className="editorial-section-heading">
          <div>
            <p className="section-kicker">Funktionen</p>
            <h2>Alles Wichtige,<br /><span className="display-serif">ohne Lärm.</span></h2>
          </div>
          <p>Smartrain organisiert den kompletten Teamalltag in klaren, mobilen Ansichten – vom Training bis zur Teamkasse.</p>
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

      <section className="editorial-section">
        <div className="content-wrap faq-layout">
          <div className="faq-intro"><p className="section-kicker">Gut zu wissen</p><h2>Fragen vor<br /><span className="display-serif">dem Anpfiff.</span></h2><p>Alles, was du für den Start mit deinem Team wissen musst.</p></div>
          <div className="faq-list">{faqs.map(([question, answer], index) => <article key={question}><span>0{index + 1}</span><div><h3>{question}</h3><p>{answer}</p></div></article>)}</div>
        </div>
      </section>
    </main>
  );
}
