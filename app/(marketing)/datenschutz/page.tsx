import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzhinweise zur Nutzung von Smartrain.",
  alternates: { canonical: "/datenschutz" }
};

const sections = [
  {
    title: "Verantwortliche Person",
    text: "Verantwortlich für die Datenbearbeitung in Smartrain ist Etienne Schwab, Bern, Schweiz. Datenschutzanfragen können an contact@etienneschwab.ch gerichtet werden."
  },
  {
    title: "Welche Daten verarbeitet werden",
    text: "Für Konten und Teamfunktionen verarbeitet Smartrain insbesondere E-Mail-Adresse, Profilangaben sowie die von Nutzenden erfassten Teams, Termine, Rückmeldungen und Aufgaben. Je nach Nutzung können auch Angaben zu Rollen, Position, Geburtstag oder Notfallkontakt gespeichert werden."
  },
  {
    title: "Wofür die Daten verwendet werden",
    text: "Die Daten werden ausschliesslich benötigt, um Anmeldung, Teamverwaltung, Einladungen, Terminplanung und die weiteren angezeigten App-Funktionen bereitzustellen."
  },
  {
    title: "Aufbewahrungsdauer",
    text: "Konto-, Profil- und Teamdaten werden grundsätzlich so lange gespeichert, wie sie für die Nutzung von Smartrain benötigt werden oder bis eine berechtigte Löschanfrage umgesetzt wird. Für technische Protokolldaten gelten zusätzlich die Aufbewahrungsfristen der eingesetzten Dienstleister."
  },
  {
    title: "Dienstleister und Empfänger",
    text: "Die Anwendung wird über Vercel bereitgestellt. Authentifizierung und Datenhaltung erfolgen über Supabase. Diese Dienstleister verarbeiten die für Hosting, Anmeldung, Datenbankbetrieb und Sicherheit technisch notwendigen Daten. Smartrain verkauft keine personenbezogenen Daten."
  },
  {
    title: "Bearbeitung ausserhalb der Schweiz",
    text: "Die eingesetzten technischen Dienstleister können Daten auch ausserhalb der Schweiz bearbeiten. Massgeblich sind dabei die vertraglichen und gesetzlichen Schutzmechanismen der jeweiligen Anbieter."
  },
  {
    title: "Cookies und lokale Speicherung",
    text: "Smartrain nutzt technisch notwendige Authentifizierungsdaten, damit eine Anmeldung erhalten bleibt. Es werden keine Werbe- oder Tracking-Cookies eingesetzt."
  },
  {
    title: "Rechte der betroffenen Personen",
    text: "Betroffene Personen können im Rahmen des anwendbaren Rechts Auskunft, Berichtigung, Löschung oder Herausgabe ihrer Daten verlangen und einer bestimmten Bearbeitung widersprechen. Anfragen können an contact@etienneschwab.ch gerichtet werden."
  },
  {
    title: "Anwendbares Datenschutzrecht",
    text: "Die Datenbearbeitung richtet sich insbesondere nach dem Schweizer Datenschutzgesetz. Falls Smartrain künftig zusätzliche Funktionen oder Dienstleister einsetzt, werden diese Hinweise entsprechend aktualisiert."
  }
] as const;

export default function DatenschutzPage() {
  return (
    <main id="main-content" className="legal-page">
      <div className="content-wrap legal-grid">
        <div className="legal-hero">
          <p className="section-kicker">Rechtliches</p>
          <h1>Datenschutz<span>.</span></h1>
          <p>Klare Informationen dazu, welche Daten Smartrain verarbeitet, wofür sie benötigt werden und welche Rechte Nutzende haben.</p>
        </div>

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

        <Link className="editorial-link legal-back-link" href="/">Zurück zur Startseite <span aria-hidden="true">↗</span></Link>
      </div>
    </main>
  );
}
