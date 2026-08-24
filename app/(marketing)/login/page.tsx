import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AuthForm } from "@/components/auth/auth-form";
import { SsoErrorCard } from "@/components/auth/sso-error-card";
import { safeLocalPath } from "@/lib/safe-redirect";
import { getOptionalUser } from "@/lib/supabase-server";
import { dataServiceUnavailableMessage, isSupabaseConnectionError } from "@/lib/supabase-errors";
import { getAuthUrl, getSsoConfig, isAuthHostname, requestHostname } from "@/lib/sso";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

const errorMap: Record<string, string> = {
  auth_callback_failed: "Der Login-Link konnte nicht bestätigt werden. Bitte versuche es erneut.",
  backend_unavailable: dataServiceUnavailableMessage
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = safeLocalPath(params.next, "/dashboard");
  const requestHeaders = await headers();
  const centralAuth = isAuthHostname(requestHostname(requestHeaders));
  const { user, authError } = await getOptionalUser();

  if (user) {
    redirect(safeLocalPath(params.next, centralAuth ? "/account" : "/dashboard"));
  }

  if (!centralAuth && getSsoConfig()) {
    if (params.error?.startsWith("sso_")) {
      return (
        <main id="main-content" className="content-wrap py-12 sm:py-20">
          <SsoErrorCard error={params.error} nextPath={nextPath} />
        </main>
      );
    }

    redirect(`/auth/sso/start?next=${encodeURIComponent(nextPath)}`);
  }

  const authUrl = getAuthUrl();

  if (!centralAuth && authUrl && params.error === "sso_not_configured") {
    return (
      <main id="main-content" className="content-wrap py-12 sm:py-20">
        <SsoErrorCard error={params.error} nextPath={nextPath} />
      </main>
    );
  }

  return (
    <main id="main-content" className="content-wrap py-12 sm:py-20">
      <AuthForm
        mode="login"
        nextPath={params.next}
        centralAuth={centralAuth}
        initialMessage={
          params.error
            ? errorMap[params.error]
            : isSupabaseConnectionError(authError)
              ? dataServiceUnavailableMessage
              : undefined
        }
      />
    </main>
  );
}
