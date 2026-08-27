import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Kontaktangaben für Smartrain.",
  alternates: { canonical: "/impressum" }
};

const rows = [
  { label: "Betreiber", value: "Etienne Schwab" },
  { label: "Standort", value: "Bern, Schweiz" },
  { label: "E-Mail", value: "contact@etienneschwab.ch", href: "mailto:contact@etienneschwab.ch" },
  { label: "Website", value: "smartrain.etienneschwab.ch", href: "https://smartrain.etienneschwab.ch" }
] as const;

const sections = [
  {
    title: "Verantwortung für Inhalte",
    text: "Der Betreiber erstellt und pflegt die Inhalte dieser Website mit angemessener Sorgfalt. Eine Gewähr für Vollständigkeit, Richtigkeit und jederzeitige Verfügbarkeit wird nicht übernommen. Hinweise zu fehlerhaften Inhalten können per E-Mail gemeldet werden."
  },
  {
    title: "Externe Links",
    text: "Für Inhalte externer Websites, auf die Smartrain verweist, sind ausschliesslich deren jeweilige Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung waren keine offensichtlichen rechtswidrigen Inhalte erkennbar."
  },
  {
    title: "Urheberrecht",
    text: "Inhalte, Gestaltung und eigene Werke auf dieser Website unterliegen dem anwendbaren Urheberrecht. Eine Verwendung ausserhalb der gesetzlichen Schranken bedarf der vorherigen Zustimmung des jeweiligen Rechteinhabers."
  },
  {
    title: "Technischer Betrieb",
    text: "Die Webanwendung wird über Vercel bereitgestellt. Authentifizierung und Datenhaltung erfolgen über Supabase. Weitere Informationen zur Verarbeitung personenbezogener Daten stehen in der Datenschutzerklärung."
  }
] as const;

export default function ImpressumPage() {
  return (
    <main id="main-content" className="legal-page">
      <div className="content-wrap legal-grid">
        <div className="legal-hero">
          <p className="section-kicker">Rechtliches</p>
          <h1>Impressum<span>.</span></h1>
          <p>Angaben zum Betreiber und zur Verantwortlichkeit für die Smartrain-Webanwendung.</p>
        </div>

        <dl className="legal-list">
          {rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{"href" in row ? <a href={row.href}>{row.value}</a> : row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="legal-copy">
          {sections.map((section, index) => (
            <section key={section.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{section.title}</h2>
                <p>{section.text}</p>
              </div>
            </section>
          ))}
        </div>

        <div className="legal-actions flex flex-wrap gap-6">
          <Link className="editorial-link" href="/">Zurück zur Startseite <span aria-hidden="true">↗</span></Link>
          <Link className="editorial-link" href="/datenschutz">Datenschutzerklärung <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </main>
  );
}
