# SmarTrain Starter

Lauffaehige MVP-App fuer Teamverwaltung, Spieler, Trainings und Spiele mit Next.js, Supabase und Vercel.

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
5. Aktiviere unter `Authentication > Providers > Email` den Email-Login.
6. Aktiviere dort auch `Email + Password`, wenn du klassische Registrierung und Passwort-Login willst.
7. Setze unter `Authentication > URL Configuration` diese URLs:
   - Site URL: `http://localhost:3000`
   - Additional Redirect URLs: `http://localhost:3000/auth/callback`

## Was bereits funktioniert

- Registrierung mit E-Mail und Passwort
- Login mit E-Mail und Passwort
- Magic-Link-Login mit Supabase
- Session-Callback fuer App Router
- Teams, Spieler, Trainings und Spiele anlegen
- Datenlisten auf allen Hauptseiten
- Dashboard mit Kennzahlen und naechsten Terminen

## Deployment auf Vercel

1. Repository nach GitHub pushen.
2. Projekt in Vercel importieren.
3. Diese Environment Variables in Vercel setzen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Nach dem ersten Deploy die Vercel-URL in Supabase ergaenzen:
   - Site URL: deine Produktions-URL
   - Additional Redirect URLs: `https://deine-domain.tld/auth/callback`
5. Optional fuer Preview-Deployments auch die Preview-URL oder eigene Domain dort eintragen.

## Hinweise fuer Produktion

- Die Policies in `supabase/schema.sql` sind bewusst einfach fuer ein MVP.
- Fuer echte Vereine solltest du die RLS-Regeln spaeter pro Club und Team einschraenken.
"# smartain" 
