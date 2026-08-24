import { Check, LockKeyhole, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthBrand } from "@/components/auth/auth-brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getOptionalUser } from "@/lib/supabase-server";
import { getAuthUrl, isAllowedSsoUrl, isAuthHostname, requestHostname } from "@/lib/sso";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Projekt freigeben",
  robots: { index: false, follow: false }
};

type ConsentPageProps = {
  searchParams: Promise<{ authorization_id?: string }>;
};

const scopeLabels: Record<string, string> = {
  email: "Deine E-Mail-Adresse verwenden",
  profile: "Deinen Namen und dein Profil verwenden",
  phone: "Deine Telefonnummer verwenden",
  openid: "Deine Identität bestätigen"
};

function ErrorCard({ message }: { message: string }) {
  return (
    <main className="content-wrap grid min-h-screen place-items-center py-16">
      <Card className="w-full max-w-xl p-8 text-center sm:p-10">
        <ShieldCheck className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="mt-5 text-2xl font-semibold">Anfrage konnte nicht geprüft werden</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>
      </Card>
    </main>
  );
}

export default async function ConsentPage({ searchParams }: ConsentPageProps) {
  const params = await searchParams;
  const authorizationId = params.authorization_id;
  const requestHeaders = await headers();
  const authUrl = getAuthUrl();

  if (authUrl && !isAuthHostname(requestHostname(requestHeaders))) {
    const centralUrl = new URL("/oauth/consent", authUrl);

    if (authorizationId) {
      centralUrl.searchParams.set("authorization_id", authorizationId);
    }

    redirect(centralUrl.toString());
  }

  if (!authorizationId) {
    return <ErrorCard message="Die Autorisierungs-ID fehlt. Starte den Login bitte erneut beim gewünschten Projekt." />;
  }

  const { supabase, user } = await getOptionalUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/oauth/consent?authorization_id=${authorizationId}`)}`);
  }

  const { data: details, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

  if (error || !details) {
    return <ErrorCard message="Die Anfrage ist ungültig oder abgelaufen. Kehre zum Projekt zurück und versuche es erneut." />;
  }

  if (!("authorization_id" in details)) {
    if (!isAllowedSsoUrl(details.redirect_url)) {
      return <ErrorCard message="Das Ziel dieser Anfrage ist nicht als Etienne-Projekt freigegeben." />;
    }

    redirect(details.redirect_url);
  }

  if (!isAllowedSsoUrl(details.redirect_uri)) {
    return <ErrorCard message="Dieses Projekt ist nicht für das zentrale Konto freigegeben." />;
  }

  const scopes = details.scope.split(" ").filter(Boolean);

  return (
    <main className="content-wrap grid min-h-screen place-items-center py-12 sm:py-20">
      <Card className="w-full max-w-xl overflow-hidden p-8 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <AuthBrand central />
          <div className="mt-6 grid h-14 w-14 place-items-center rounded-full border border-primary/25 bg-primary/10">
            <LockKeyhole className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">Etienne Account</p>
          <h1 className="mt-2 text-3xl font-semibold">Bei {details.client.name} anmelden</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            {details.client.name} möchte dein zentrales Konto verwenden. Dein Passwort wird niemals an das Projekt weitergegeben.
          </p>
        </div>

        <div className="my-8 border-y border-border/80 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Freigegebene Angaben</p>
          <ul className="mt-4 space-y-3">
            {scopes.map((scope) => (
              <li key={scope} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>{scopeLabels[scope] ?? scope}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-none border border-border/70 bg-muted/30 px-4 py-3 text-xs leading-5 text-muted-foreground">
          Angemeldet als <span className="font-semibold text-foreground">{details.user.email}</span>
        </div>

        <form action="/api/oauth/decision" method="post" className="mt-6 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="authorization_id" value={authorizationId} />
          <Button type="submit" name="decision" value="deny" variant="secondary">
            Abbrechen
          </Button>
          <Button type="submit" name="decision" value="approve">
            Sicher anmelden
          </Button>
        </form>
      </Card>
    </main>
  );
}
