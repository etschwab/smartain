"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

type LoginFormProps = {
  error?: string;
};

type AuthMode = "password" | "register" | "magic";

const errorMessages: Record<string, string> = {
  auth_callback_failed: "Der Magic Link konnte nicht bestaetigt werden. Bitte versuche es erneut."
};

export function LoginForm({ error }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(error ? errorMessages[error] ?? "Login fehlgeschlagen." : "");
  const [submitting, setSubmitting] = useState(false);

  async function handlePasswordLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        setMessage(signInError.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (signInError) {
      setMessage(signInError instanceof Error ? signInError.message : "Login fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
        }
      });

      if (signUpError) {
        setMessage(signUpError.message);
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setMessage("Registrierung erfolgreich. Bitte bestaetige jetzt deine E-Mail.");
      setMode("password");
    } catch (signUpError) {
      setMessage(signUpError instanceof Error ? signUpError.message : "Registrierung fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
        }
      });

      setMessage(signInError ? signInError.message : "Login-Link wurde gesendet.");
    } catch (signInError) {
      setMessage(signInError instanceof Error ? signInError.message : "Magic-Link fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="card">
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="mt-2 text-slate-600">Einloggen, registrieren oder einen Magic Link senden.</p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <button
            className={mode === "password" ? "btn" : "btn-secondary"}
            type="button"
            onClick={() => setMode("password")}
          >
            Login
          </button>
          <button
            className={mode === "register" ? "btn" : "btn-secondary"}
            type="button"
            onClick={() => setMode("register")}
          >
            Register
          </button>
          <button
            className={mode === "magic" ? "btn" : "btn-secondary"}
            type="button"
            onClick={() => setMode("magic")}
          >
            Magic Link
          </button>
        </div>

        {mode === "password" && (
          <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4">
            <input
              className="input"
              type="email"
              placeholder="deine@email.ch"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button className="btn w-full" type="submit" disabled={submitting}>
              {submitting ? "Lade..." : "Mit Passwort einloggen"}
            </button>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <input
              className="input"
              type="email"
              placeholder="deine@email.ch"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="Mindestens 6 Zeichen"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
            <button className="btn w-full" type="submit" disabled={submitting}>
              {submitting ? "Lade..." : "Account erstellen"}
            </button>
          </form>
        )}

        {mode === "magic" && (
          <form onSubmit={handleMagicLink} className="mt-6 space-y-4">
            <input
              className="input"
              type="email"
              placeholder="deine@email.ch"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button className="btn w-full" type="submit" disabled={submitting}>
              {submitting ? "Sende..." : "Login-Link senden"}
            </button>
          </form>
        )}

        {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
      </div>
    </main>
  );
}
