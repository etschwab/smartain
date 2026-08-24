import { ExternalLink, KeyRound, LogOut, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthBrand } from "@/components/auth/auth-brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getOptionalUser } from "@/lib/supabase-server";
import { getAuthUrl, isAllowedSsoUrl, isAuthHostname, requestHostname } from "@/lib/sso";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Etienne Account",
  robots: { index: false, follow: false }
};

export default async function AccountPage() {
  const requestHeaders = await headers();
  const authUrl = getAuthUrl();

  if (authUrl && !isAuthHostname(requestHostname(requestHeaders))) {
    redirect(new URL("/account", authUrl).toString());
  }

  const { supabase, user } = await getOptionalUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const grantsResult = await supabase.auth.oauth.listGrants();
  const grants = grantsResult.data ?? [];

  return (
    <main className="content-wrap grid min-h-screen place-items-center py-12 sm:py-20">
      <Card className="w-full max-w-2xl p-8 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <AuthBrand central />
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-primary">Etienne Account</p>
            <h1 className="mt-2 text-3xl font-semibold">Dein zentrales Konto</h1>
            <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-primary/25 bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="my-8 border-y border-border/80 py-6">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-semibold">Verbundene Projekte</h2>
              <p className="text-xs text-muted-foreground">Du wirst dort künftig ohne erneute Passworteingabe angemeldet.</p>
            </div>
          </div>

          {grants.length ? (
            <ul className="mt-5 divide-y divide-border/70 border border-border/70">
              {grants.map((grant) => (
                <li key={grant.client.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{grant.client.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{grant.scopes.join(" · ")}</p>
                  </div>
                  {grant.client.uri && isAllowedSsoUrl(grant.client.uri) ? (
                    <Link href={grant.client.uri} className="text-muted-foreground hover:text-primary" aria-label={`${grant.client.name} öffnen`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
              Noch kein Projekt verbunden. Öffne Smartrain, um die erste Verbindung herzustellen.
            </p>
          )}
        </div>

        <Button asChild variant="danger" className="w-full sm:w-auto">
          <Link href="/logout">
            <LogOut className="h-4 w-4" />
            Überall abmelden
          </Link>
        </Button>
      </Card>
    </main>
  );
}
