"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AuthBrand } from "@/components/auth/auth-brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { setAuthPersistence } from "@/lib/auth-persistence";
import { safeLocalPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase-browser";
import { getUserFacingSupabaseError } from "@/lib/supabase-errors";

type AuthFormProps = {
  mode: "login" | "signup";
  nextPath?: string;
  initialMessage?: string;
  centralAuth?: boolean;
};

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
const configuredAuthUrl = process.env.NEXT_PUBLIC_AUTH_URL?.trim().replace(/\/$/, "");

export function AuthForm({ mode, nextPath, initialMessage, centralAuth = false }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialMessage ?? null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const targetPath = safeLocalPath(nextPath, centralAuth ? "/account" : "/dashboard");
  const isSignup = mode === "signup";

  function getEmailRedirectTo() {
    let origin = window.location.origin;

    const configuredRedirectOrigin = centralAuth ? configuredAuthUrl : configuredSiteUrl;

    if (configuredRedirectOrigin) {
      try {
        const configuredUrl = new URL(configuredRedirectOrigin);
        const isLoopback = ["localhost", "127.0.0.1", "::1"].includes(configuredUrl.hostname);

        if (process.env.NODE_ENV !== "production" || !isLoopback) {
          origin = configuredUrl.origin;
        }
      } catch {
        // Fall back to the origin that is actually serving the app.
      }
    }

    return `${origin}/auth/callback?next=${encodeURIComponent(targetPath)}`;
  }

  function formatAuthError(message: string) {
    if (/invalid login credentials/i.test(message)) {
      return "E-Mail oder Passwort ist nicht korrekt.";
    }

    if (/email not confirmed/i.test(message)) {
      return "Bitte bestätige zuerst deine E-Mail-Adresse über den Link in deinem Postfach.";
    }

    if (/password/i.test(message) && /characters/i.test(message)) {
      return "Das Passwort muss mindestens 6 Zeichen lang sein.";
    }

    if (/signup/i.test(message) && /disabled/i.test(message)) {
      return "Registrierung ist in Supabase aktuell deaktiviert.";
    }

    return getUserFacingSupabaseError(message, "Die Authentifizierung konnte nicht abgeschlossen werden.");
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

        setAuthPersistence(rememberMe);
        toast.success("Willkommen zurück");
        router.replace(targetPath);
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getEmailRedirectTo(),
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
        setAuthPersistence(rememberMe);
        toast.success("Account erstellt");
        router.replace(targetPath);
        router.refresh();
        return;
      }

      const loginResult = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!loginResult.error) {
        setAuthPersistence(rememberMe);
        toast.success("Account erstellt");
        router.replace(targetPath);
        router.refresh();
        return;
      }

      setStatusMessage(
        "Account erstellt. Bitte prüfe dein Postfach und bestätige deine E-Mail-Adresse, bevor du dich einloggst."
      );
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
          emailRedirectTo: getEmailRedirectTo()
        }
      });

      if (error) {
        setErrorMessage(formatAuthError(error.message));
        return;
      }

      setAuthPersistence(rememberMe);
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
        <AuthBrand central={centralAuth} />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">
            {mode === "login" ? "Willkommen zurück" : centralAuth ? "Erstelle dein zentrales Konto" : "Erstelle deinen Account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login"
              ? centralAuth
                ? "Ein Login für Smartrain und alle zukünftigen Etienne-Projekte."
                : "Logge dich ein und spring direkt ins Team-Dashboard."
              : centralAuth
                ? "Deine Zugangsdaten bleiben beim zentralen Konto und werden nicht an einzelne Projekte weitergegeben."
                : "Starte dein Team, lade Mitglieder ein und plane eure nächsten Termine."}
          </p>
          {nextPath ? (
            <p className="text-xs font-medium text-primary">
              {centralAuth ? "Nach der Anmeldung geht es sicher zurück zum angefragten Projekt." : `Nach dem Login geht es direkt weiter zu ${nextPath}.`}
            </p>
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

        {!isSignup ? (
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-muted/35 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-primary/5">
            <input
              type="checkbox"
              name="remember_me"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary"
            />
            <span className="space-y-0.5">
              <span className="block text-sm font-semibold text-foreground">Angemeldet bleiben</span>
              <span className="block text-xs leading-5 text-muted-foreground">
                Du bleibst auf diesem Gerät eingeloggt, bis du dich abmeldest.
              </span>
            </span>
          </label>
        ) : null}

        {errorMessage ? <FormError message={errorMessage} /> : null}

        {statusMessage ? (
          <div className="rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-sm text-foreground">
            {statusMessage}
          </div>
        ) : null}

        {isSignup ? (
          <p className="text-xs leading-5 text-muted-foreground">
            Mit der Registrierung bestätigst du, dass du die <Link href="/datenschutz" className="font-semibold text-primary underline underline-offset-4">Datenschutzhinweise</Link> gelesen hast.
          </p>
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
