import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const messages: Record<string, string> = {
  sso_access_denied: "Die Anmeldung wurde abgebrochen. Es wurden keine Kontodaten an Smartrain übertragen.",
  sso_callback_failed: "Die zentrale Anmeldung konnte nicht abgeschlossen werden.",
  sso_not_configured: "Die zentrale Anmeldung ist für diese Umgebung noch nicht vollständig eingerichtet.",
  sso_state_invalid: "Die Sicherheitsprüfung der Anmeldung ist fehlgeschlagen. Bitte starte den Vorgang erneut.",
  sso_token_exchange_failed: "Die Anmeldebestätigung ist abgelaufen oder konnte nicht eingelöst werden."
};

export function SsoErrorCard({ error, nextPath }: { error: string; nextPath: string }) {
  const retryUrl = `/auth/sso/start?next=${encodeURIComponent(nextPath)}`;

  return (
    <Card className="mx-auto w-full max-w-lg p-8 text-center sm:p-10">
      <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
      <h1 className="mt-5 text-2xl font-semibold">Anmeldung nicht abgeschlossen</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {messages[error] ?? "Bei der zentralen Anmeldung ist ein unerwarteter Fehler aufgetreten."}
      </p>
      <Button asChild className="mt-7 w-full">
        <Link href={retryUrl}>Erneut versuchen</Link>
      </Button>
    </Card>
  );
}

