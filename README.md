# Smartrain

Lauffaehige MVP-App fuer Teamverwaltung, Spieler, Trainings und Spiele mit Next.js, Supabase und Vercel.

Produktiv: https://smartrain.etienneschwab.ch

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth, OAuth 2.1 SSO + PostgreSQL
- Vercel Deployment

## Lokal starten

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ohne SSO-Konfiguration kannst du wie bisher `http://localhost:3000` öffnen. Mit den SSO-Werten aus `.env.example` öffnest du Smartrain unter `http://smartrain.localhost:3000`; das separat gestartete Kontoportal läuft unter `http://auth.localhost:3001`.

## Supabase Setup

1. Erstelle ein kostenloses Supabase-Projekt.
2. Kopiere `Project URL` und `anon public key` nach `.env.local`.
3. Oeffne in Supabase den SQL Editor.
4. Fuehre `supabase/schema.sql` aus.
5. Fuehre anschliessend die Dateien in `supabase/migrations` in aufsteigender Reihenfolge aus. Für die Teamzentrale ist insbesondere `202608230001_team_organization_hub.sql` erforderlich.
6. Aktiviere unter `Authentication > Providers > Email` den Email-Login.
7. Aktiviere dort auch `Email + Password`, wenn du klassische Registrierung und Passwort-Login willst.
8. Für den zentralen Login folge der vollständigen Anleitung in [`docs/SUPABASE_SSO.md`](docs/SUPABASE_SSO.md).

## Funktionsumfang

- Registrierung mit E-Mail und Passwort
- Login mit E-Mail und Passwort
- Magic-Link-Login mit Supabase
- Zentrales OAuth-2.1-SSO über `auth.etienneschwab.ch`
- PKCE, getrennte HttpOnly-Projekt-Sitzungen und automatische Token-Erneuerung
- Zentrale Projektzustimmung und globales Logout
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
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_AUTH_URL`
   - `SUPABASE_OAUTH_CLIENT_ID`
   - `SUPABASE_OAUTH_CLIENT_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional; nur für privilegierte Invite-Lookups)
4. Diesem Vercel-Projekt ausschließlich `smartrain.etienneschwab.ch` zuweisen.
5. `auth.etienneschwab.ch` separat aus dem Repository **esch-auth** deployen.
6. Supabase OAuth Server und den vertraulichen Smartrain-Client wie in [`docs/SUPABASE_SSO.md`](docs/SUPABASE_SSO.md) konfigurieren.

## Hinweise fuer Produktion

- Die Policies in `supabase/schema.sql` sind bewusst einfach fuer ein MVP.
- Fuer echte Vereine solltest du die RLS-Regeln spaeter pro Club und Team einschraenken.
- Production-Werte für `NEXT_PUBLIC_SUPABASE_URL` dürfen nicht auf `localhost` zeigen.
- Magic Links des zentralen Portals verwenden `NEXT_PUBLIC_AUTH_URL`.
- Änderungen an `NEXT_PUBLIC_*`-Variablen werden beim Build in den Browser-Code eingebettet und benötigen einen neuen Deploy.
