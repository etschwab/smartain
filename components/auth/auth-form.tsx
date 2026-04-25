"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/branding/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase-browser";

type AuthFormProps = {
  mode: "login" | "signup";
  nextPath?: string;
  initialMessage?: string;
};

export function AuthForm({ mode, nextPath, initialMessage }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(initialMessage ?? null);

  const targetPath = nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard";

  async function handleAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        toast.success("Willkommen zurueck");
        router.push(targetPath);
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetPath)}`
        }
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.session) {
        toast.success("Account erstellt");
        router.push(targetPath);
        router.refresh();
        return;
      }

      setMessage("Fast geschafft: Bitte bestaetige jetzt deine E-Mail.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Etwas ist schiefgelaufen.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMagicLink() {
    setSubmitting(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetPath)}`
        }
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      toast.success("Magic Link gesendet");
      setMessage("Pruefe dein Postfach fuer den Login-Link.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Magic Link konnte nicht gesendet werden.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md p-8 shadow-soft">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <Logo className="flex-col gap-2" href="/" />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">
            {mode === "login" ? "Willkommen zurueck" : "Erstelle deinen Account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login"
              ? "Logge dich ein und spring direkt ins Team-Dashboard."
              : "Starte dein Team, lade Mitglieder ein und plane eure naechsten Termine."}
          </p>
          {nextPath ? (
            <p className="text-xs font-medium text-primary">Nach dem Login geht es direkt weiter zu {nextPath}.</p>
          ) : null}
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleAuth}>
        <Input
          type="email"
          name="email"
          placeholder="deine@email.ch"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="Mindestens 6 Zeichen"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
          required
        />
        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? "Einen Moment..." : mode === "login" ? "Einloggen" : "Account erstellen"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        Oder
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button className="w-full" type="button" variant="secondary" disabled={submitting || !email} onClick={handleMagicLink}>
        Magic Link senden
      </Button>

      {message ? <p className="mt-4 text-sm text-muted-foreground">{message}</p> : null}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {mode === "login" ? "Noch kein Konto?" : "Bereits registriert?"}{" "}
        <Link
          href={mode === "login" ? `/signup${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}` : `/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
          className="font-semibold text-primary"
        >
          {mode === "login" ? "Sign up" : "Login"}
        </Link>
      </p>
    </Card>
  );
}
