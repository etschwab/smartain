# Zentrales Supabase-SSO

Das zentrale Portal läuft als eigenes Repository **esch-auth** auf `auth.etienneschwab.ch`. Smartrain enthält nur noch den OAuth-Client für `smartrain.etienneschwab.ch` sowie Callback, Token-Cookies und Refresh-Logik. Die beiden Domains werden als getrennte Vercel-Projekte deployed.

## Ablauf

1. Smartrain leitet eine nicht angemeldete Person über `/auth/sso/start` zum Supabase-OAuth-Server.
2. Supabase prüft Client, Callback und PKCE und öffnet `https://auth.etienneschwab.ch/oauth/consent`.
3. **ESCH Account** meldet die Person mit Supabase Auth an und zeigt das anfragende Projekt sowie die angeforderten Angaben.
4. Nach Zustimmung erhält Smartrain einen einmaligen Code und tauscht ihn serverseitig gegen eine eigene Sitzung ein.
5. Weitere Projekte verwenden denselben Ablauf. Der zentrale Login-Cookie bleibt ausschließlich auf `auth.etienneschwab.ch`; dadurch werden dort bereits angemeldete Personen ohne erneute Passworteingabe zurückgeführt.

Zugangstokens erscheinen nie in der URL. Client-Secrets und die projektspezifischen Refresh-Tokens sind nicht für Browser-JavaScript lesbar. `state`, PKCE, exakte Callback-URLs und eine Host-Allowlist schützen den Rückweg. Die zentrale Supabase-Browsersitzung folgt dem Cookie-Modell von `@supabase/ssr` und bleibt durch den hostgebundenen Cookie auf `auth.etienneschwab.ch` von den Projekt-Subdomains getrennt. Das ist bewusst sicherer als ein gemeinsames Cookie für alle Subdomains: Jedes Projekt erhält seine eigene erneuerbare Sitzung, während ESCH Account das einmalige Login zentral wiederverwendet.

## Supabase konfigurieren

### 1. URL Configuration

Unter `Authentication > URL Configuration`:

- Site URL: `https://auth.etienneschwab.ch`
- Redirect URL: `https://auth.etienneschwab.ch/auth/callback`
- Für lokale Magic Links zusätzlich: `http://auth.localhost:3001/auth/callback`

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

Die beiden Repositories werden als getrennte Vercel-Projekte deployed:

- **smartrain** erhält ausschließlich `smartrain.etienneschwab.ch`.
- **esch-auth** erhält ausschließlich `auth.etienneschwab.ch`.

Im Smartrain-Projekt werden diese Werte benötigt:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-key>
NEXT_PUBLIC_SITE_URL=https://smartrain.etienneschwab.ch
NEXT_PUBLIC_AUTH_URL=https://auth.etienneschwab.ch
SUPABASE_OAUTH_CLIENT_ID=<smartrain-client-id>
SUPABASE_OAUTH_CLIENT_SECRET=<smartrain-client-secret>
```

Im ESCH-Account-Projekt werden diese Werte benötigt:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-key>
NEXT_PUBLIC_SITE_URL=https://auth.etienneschwab.ch
SSO_ALLOWED_HOSTS=.etienneschwab.ch
DEFAULT_PROJECT_URL=https://smartrain.etienneschwab.ch/dashboard
```

Nach Änderungen an `NEXT_PUBLIC_*` ist ein neuer Vercel-Deploy erforderlich.

## Lokal testen

Die Werte aus `.env.example` nach `.env.local` kopieren und den lokalen OAuth-Client eintragen. Im Repository **esch-auth** `NEXT_PUBLIC_SITE_URL=http://auth.localhost:3001` und `DEFAULT_PROJECT_URL=http://smartrain.localhost:3000/dashboard` setzen. Danach beide Apps starten:

```bash
# smartrain
npm run dev

# esch-auth (in einem zweiten Terminal)
npm run dev -- -p 3001
```

Smartrain unter `http://smartrain.localhost:3000` öffnen. Das Kontoportal läuft unter `http://auth.localhost:3001`. Beide Namen zeigen ohne DNS-Eintrag auf den lokalen Rechner und halten die Sitzungen getrennt.

## Spätere Projekte anschließen

Für jedes Projekt:

1. Im selben Supabase-Projekt einen eigenen vertraulichen OAuth-Client erstellen.
2. Nur dessen exakte HTTPS-Callback-URL registrieren.
3. Eine eigene Client-ID und ein eigenes Client-Secret verwenden.
4. Den PKCE-Start, Callback, HttpOnly-Session-Cookies und OAuth-Refresh-Flow wie in Smartrain implementieren.
5. Die neue Domain im **esch-auth**-Projekt zu `SSO_ALLOWED_HOSTS` hinzufügen, falls sie nicht bereits von `.etienneschwab.ch` abgedeckt ist.
6. Serverseitige Zugriffsregeln weiterhin mit Supabase RLS durchsetzen. Ein erfolgreicher Login ersetzt keine projektbezogene Autorisierung.

Beim zentralen Logout widerruft das Portal alle OAuth-Grants und die zentrale Supabase-Sitzung. Bereits ausgestellte Access-Tokens anderer Projekte können bis zu ihrem kurzen Ablauf noch gültig sein; deren Refresh-Tokens sind danach ungültig.
