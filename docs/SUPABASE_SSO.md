# Zentrales Supabase-SSO

Smartrain enthält sowohl das zentrale Kontoportal für `auth.etienneschwab.ch` als auch den OAuth-Client für `smartrain.etienneschwab.ch`. Beide Domains zeigen auf dasselbe Vercel-Projekt, speichern ihre Cookies aber getrennt pro Host.

## Ablauf

1. Smartrain leitet eine nicht angemeldete Person über `/auth/sso/start` zum Supabase-OAuth-Server.
2. Supabase prüft Client, Callback und PKCE und öffnet `https://auth.etienneschwab.ch/oauth/consent`.
3. Das Kontoportal meldet die Person mit Supabase Auth an und zeigt das anfragende Projekt sowie die angeforderten Angaben.
4. Nach Zustimmung erhält Smartrain einen einmaligen Code und tauscht ihn serverseitig gegen eine eigene Sitzung ein.
5. Weitere Projekte verwenden denselben Ablauf. Der zentrale Login-Cookie bleibt ausschließlich auf `auth.etienneschwab.ch`.

Zugangstokens erscheinen nie in der URL. Client-Secrets und die projektspezifischen Refresh-Tokens sind nicht für Browser-JavaScript lesbar. `state`, PKCE, exakte Callback-URLs und eine Host-Allowlist schützen den Rückweg. Die zentrale Supabase-Browsersitzung folgt dem Cookie-Modell von `@supabase/ssr` und bleibt durch den hostgebundenen Cookie auf `auth.etienneschwab.ch` von den Projekt-Subdomains getrennt.

## Supabase konfigurieren

### 1. URL Configuration

Unter `Authentication > URL Configuration`:

- Site URL: `https://auth.etienneschwab.ch`
- Redirect URL: `https://auth.etienneschwab.ch/auth/callback`
- Für lokale Magic Links zusätzlich: `http://auth.localhost:3000/auth/callback`

Die Site URL muss das zentrale Kontoportal sein, nicht Smartrain.

### 2. OAuth 2.1 Server

Unter `Authentication > OAuth Server`:

- OAuth 2.1 Server aktivieren
- Authorization Path: `/oauth/consent`

Supabase führt diese Funktion derzeit als Beta. Für OAuth empfiehlt Supabase asymmetrische JWT-Signierschlüssel wie ES256 oder RS256. Der aktuelle Smartrain-Flow fordert bewusst nur `email profile` und benötigt deshalb kein OIDC-ID-Token.

### 3. Smartrain als OAuth-App

Unter `Authentication > OAuth Apps` einen vertraulichen Client erstellen:

- Name: `Smartrain`
- Client type: `Confidential`
- Token endpoint auth method: `client_secret_basic`
- Website: `https://smartrain.etienneschwab.ch`
- Redirect URI: `https://smartrain.etienneschwab.ch/auth/sso/callback`

Für lokale Tests wird ein separater OAuth-Client empfohlen. Dessen Redirect URI lautet:

`http://smartrain.localhost:3000/auth/sso/callback`

Client-ID und Client-Secret werden anschließend als Umgebungsvariablen gesetzt. Das Secret darf nie mit `NEXT_PUBLIC_` beginnen.

## Vercel und DNS

Dem bestehenden Vercel-Projekt beide Domains zuweisen:

- `smartrain.etienneschwab.ch`
- `auth.etienneschwab.ch`

In Production werden diese Werte benötigt:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-key>
NEXT_PUBLIC_SITE_URL=https://smartrain.etienneschwab.ch
NEXT_PUBLIC_AUTH_URL=https://auth.etienneschwab.ch
SUPABASE_OAUTH_CLIENT_ID=<smartrain-client-id>
SUPABASE_OAUTH_CLIENT_SECRET=<smartrain-client-secret>
SSO_ALLOWED_HOSTS=.etienneschwab.ch
```

Nach Änderungen an `NEXT_PUBLIC_*` ist ein neuer Vercel-Deploy erforderlich.

## Lokal testen

Die Werte aus `.env.example` nach `.env.local` kopieren und den lokalen OAuth-Client eintragen. Danach:

```bash
npm run dev
```

Smartrain unter `http://smartrain.localhost:3000` öffnen. Das Kontoportal läuft unter `http://auth.localhost:3000`. Beide Namen zeigen ohne DNS-Eintrag auf den lokalen Rechner und halten die Sitzungen getrennt.

## Spätere Projekte anschließen

Für jedes Projekt:

1. Im selben Supabase-Projekt einen eigenen vertraulichen OAuth-Client erstellen.
2. Nur dessen exakte HTTPS-Callback-URL registrieren.
3. Eine eigene Client-ID und ein eigenes Client-Secret verwenden.
4. Den PKCE-Start, Callback, HttpOnly-Session-Cookies und OAuth-Refresh-Flow wie in Smartrain implementieren.
5. Die neue Domain zu `SSO_ALLOWED_HOSTS` hinzufügen, falls sie nicht bereits von `.etienneschwab.ch` abgedeckt ist.
6. Serverseitige Zugriffsregeln weiterhin mit Supabase RLS durchsetzen. Ein erfolgreicher Login ersetzt keine projektbezogene Autorisierung.

Beim zentralen Logout widerruft das Portal alle OAuth-Grants und die zentrale Supabase-Sitzung. Bereits ausgestellte Access-Tokens anderer Projekte können bis zu ihrem kurzen Ablauf noch gültig sein; deren Refresh-Tokens sind danach ungültig.
