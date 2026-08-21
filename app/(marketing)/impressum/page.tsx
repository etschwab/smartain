import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Kontaktangaben für Smartrain.",
  alternates: { canonical: "/impressum" }
};

const rows = [
  { label: "Verantwortlich", value: "Etienne Schwab" },
  { label: "Kontakt", value: "contact@etienneschwab.ch", href: "mailto:contact@etienneschwab.ch" },
  { label: "Standort", value: "Bern, Schweiz" },
  { label: "Zweck", value: "Team-Management- und Trainings-App" }
] as const;

export default function ImpressumPage() {
  return (
    <main id="main-content" className="legal-page">
      <div className="content-wrap legal-grid">
        <div className="legal-hero">
          <p className="section-kicker">Rechtliches</p>
          <h1>Impressum<span>.</span></h1>
          <p>Kontakt, verantwortliche Person und Zweck der Smartrain-Webanwendung.</p>
        </div>

        <dl className="legal-list">
          {rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{"href" in row ? <a href={row.href}>{row.value}</a> : row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="legal-notes">
          <p>Smartrain dient der Organisation von Teams, Trainings, Terminen und zugehörigen Aufgaben.</p>
          <p>Für Inhalte verlinkter Websites sind deren jeweilige Betreiber verantwortlich.</p>
        </div>

        <Link className="editorial-link legal-back-link" href="/">Zurück zur Startseite <span aria-hidden="true">↗</span></Link>
      </div>
    </main>
  );
}
