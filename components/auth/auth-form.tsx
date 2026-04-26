"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/branding/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { createClient } from "@/lib/supabase-browser";

type AuthFormProps = {
  mode: "login" | "signup";
  nextPath?: string;
  initialMessage?: string;
};

export function AuthForm({ mode, nextPath, initialMessage }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialMessage ?? null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const targetPath = nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard";
  const isSignup = mode === "signup";

  function formatAuthError(message: string) {
    if (/invalid login credentials/i.test(message)) {
      return "E-Mail oder Passwort ist nicht korrekt.";
    }

    if (/email not confirmed/i.test(message)) {
      return "Bitte bestätige zuerst deine E-Mail-Adresse.";
    }

    if (/password/i.test(message) && /characters/i.test(message)) {
      return "Das Passwort muss mindestens 6 Zeichen lang sein.";
    }

    if (/signup/i.test(message) && /disabled/i.test(message)) {
      return "Registrierung ist in Supabase aktuell deaktiviert.";
    }

    return message || "Die Authentifizierung konnte nicht abgeschlossen werden.";
  }

  function validateForm() {
    if (!email.trim()) {
      return "Bitte gib deine E-Mail-Adresse ein.";
    }

    if (!password) {
      return "Bitte gib dein Passwort ein.";
    }

    if (password.length < 6) {
      return "Das Passwort muss mindestens 6 Zeichen lang sein.";
    }

    if (isSignup && !name.trim()) {
      return "Bitte gib deinen Namen ein.";
    }

    if (isSignup && password !== confirmPassword) {
      return "Die Passwörter stimmen nicht überein.";
    }

    return null;
  }

  async function handleAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      setStatusMessage(null);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setErrorMessage(formatAuthError(error.message));
          return;
        }

        toast.success("Willkommen zurück");
        router.replace(targetPath);
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetPath)}`,
          data: {
            full_name: name.trim(),
            name: name.trim()
          }
        }
      });

      if (error) {
        setErrorMessage(formatAuthError(error.message));
        return;
      }

      if (data.session) {
        toast.success("Account erstellt");
        router.replace(targetPath);
        router.refresh();
        return;
      }

      setStatusMessage("Fast geschafft: Bitte bestätige jetzt deine E-Mail-Adresse.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? formatAuthError(error.message) : "Etwas ist schiefgelaufen.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMagicLink() {
    if (!email.trim()) {
      setErrorMessage("Bitte gib zuerst deine E-Mail-Adresse ein.");
      setStatusMessage(null);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetPath)}`
        }
      });

      if (error) {
        setErrorMessage(formatAuthError(error.message));
        return;
      }

      toast.success("Magic Link gesendet");
      setStatusMessage("Prüfe dein Postfach für den Login-Link.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? formatAuthError(error.message) : "Magic Link konnte nicht gesendet werden.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-lg overflow-hidden p-8 sm:p-10">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <Logo className="flex-col gap-2" href="/" />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">
            {mode === "login" ? "Willkommen zurück" : "Erstelle deinen Account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login"
              ? "Logge dich ein und spring direkt ins Team-Dashboard."
              : "Starte dein Team, lade Mitglieder ein und plane eure nächsten Termine."}
          </p>
          {nextPath ? (
            <p className="text-xs font-medium text-primary">Nach dem Login geht es direkt weiter zu {nextPath}.</p>
          ) : null}
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleAuth} noValidate>
        {isSignup ? (
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold">
              Name
            </label>
            <Input
              id="name"
              type="text"
              name="name"
              placeholder="Dein Name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold">
            E-Mail
          </label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="deine@email.ch"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold">
            Passwort
          </label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Mindestens 6 Zeichen"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />
        </div>

        {isSignup ? (
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-sm font-semibold">
              Passwort bestätigen
            </label>
            <Input
              id="confirm-password"
              type="password"
              name="confirm_password"
              placeholder="Passwort erneut eingeben"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              required
            />
          </div>
        ) : null}

        {errorMessage ? <FormError message={errorMessage} /> : null}

        {statusMessage ? (
          <div className="rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-sm text-foreground">
            {statusMessage}
          </div>
        ) : null}

        <LoadingButton className="w-full" type="submit" isLoading={submitting} loadingLabel="Einen Moment...">
          {mode === "login" ? "Einloggen" : "Account erstellen"}
        </LoadingButton>
      </form>

      <div className="my-6 flex items-center gap-4 text-xs uppercase text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        Oder
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button className="w-full" type="button" variant="secondary" disabled={submitting} onClick={handleMagicLink}>
        Magic Link senden
      </Button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {mode === "login" ? "Noch kein Konto?" : "Bereits registriert?"}{" "}
        <Link
          href={mode === "login" ? `/signup${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}` : `/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
          className="font-semibold text-primary"
        >
          {mode === "login" ? "Account erstellen" : "Einloggen"}
        </Link>
      </p>
    </Card>
  );
}
