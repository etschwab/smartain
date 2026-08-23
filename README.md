# Smartrain

Lauffaehige MVP-App fuer Teamverwaltung, Spieler, Trainings und Spiele mit Next.js, Supabase und Vercel.

Produktiv: https://smartrain.etienneschwab.ch

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth + PostgreSQL
- Vercel Deployment

## Lokal starten

```bash
npm install
cp .env.example .env.local
npm run dev
```

Dann oeffne `http://localhost:3000`.

## Supabase Setup

1. Erstelle ein kostenloses Supabase-Projekt.
2. Kopiere `Project URL` und `anon public key` nach `.env.local`.
3. Oeffne in Supabase den SQL Editor.
4. Fuehre `supabase/schema.sql` aus.
5. Fuehre anschliessend die Dateien in `supabase/migrations` in aufsteigender Reihenfolge aus. Für die Teamzentrale ist insbesondere `202608230001_team_organization_hub.sql` erforderlich.
6. Aktiviere unter `Authentication > Providers > Email` den Email-Login.
7. Aktiviere dort auch `Email + Password`, wenn du klassische Registrierung und Passwort-Login willst.
8. Setze unter `Authentication > URL Configuration` diese URLs:
   - Site URL: `http://localhost:3000`
   - Additional Redirect URLs: `http://localhost:3000/auth/callback`

## Funktionsumfang

- Registrierung mit E-Mail und Passwort
- Login mit E-Mail und Passwort
- Magic-Link-Login mit Supabase
- Session-Callback fuer App Router
- Teams, Rollen, Spielerprofile und sichere Einladungslinks
- Trainings, Spiele, Meetings, Serientermine und CSV-Spielplanimport
- Zu-/Absagen mit Kommentaren, Teilnehmerübersicht und Benachrichtigungen
- Aufgaben, Zuständigkeiten und terminbezogene Checklisten
- Team-News, angeheftete Mitteilungen und Team-Chat
- Abstimmungen mit Frist, Live-Ergebnis und eigener Stimme
- Abwesenheiten für Ferien, Krankheit, Verletzung, Schule und Arbeit
- Fahrgemeinschaften mit freien Plätzen und Reservierung
- Teamkasse für Beiträge, Strafen, Einnahmen und Ausgaben
- Aufstellungen mit Startformation, Bank, Position und Notizen
- Anwesenheits-, Rückmelde- und Aufgabenstatistiken
- ICS-Kalenderexport für den privaten Kalender
- Responsive Oberfläche für Desktop und Mobile

## Deployment auf Vercel

1. Repository nach GitHub pushen.
2. Projekt in Vercel importieren.
3. Diese Environment Variables in Vercel setzen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (empfohlen)
   - `SUPABASE_SERVICE_ROLE_KEY` (optional; nur für privilegierte Invite-Lookups)
4. Nach dem ersten Deploy die Vercel-URL in Supabase ergaenzen:
   - Site URL: deine Produktions-URL
   - Additional Redirect URLs: `https://deine-domain.tld/auth/callback`
5. Optional fuer Preview-Deployments auch die Preview-URL oder eigene Domain dort eintragen.

## Hinweise fuer Produktion

- Die Policies in `supabase/schema.sql` sind bewusst einfach fuer ein MVP.
- Fuer echte Vereine solltest du die RLS-Regeln spaeter pro Club und Team einschraenken.
- Production-Werte für `NEXT_PUBLIC_SUPABASE_URL` dürfen nicht auf `localhost` zeigen.
- Magic Links verwenden die aktuelle Browser-Origin, wenn `NEXT_PUBLIC_SITE_URL` nicht gesetzt ist.
- Änderungen an `NEXT_PUBLIC_*`-Variablen werden beim Build in den Browser-Code eingebettet und benötigen einen neuen Deploy.
