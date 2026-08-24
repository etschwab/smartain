import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AuthForm } from "@/components/auth/auth-form";
import { safeLocalPath } from "@/lib/safe-redirect";
import { getOptionalUser } from "@/lib/supabase-server";
import { dataServiceUnavailableMessage, isSupabaseConnectionError } from "@/lib/supabase-errors";
import { getSsoConfig, isAuthHostname, requestHostname } from "@/lib/sso";

export const dynamic = "force-dynamic";

type SignupPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const requestHeaders = await headers();
  const centralAuth = isAuthHostname(requestHostname(requestHeaders));
  const { user, authError } = await getOptionalUser();

  if (user) {
    redirect(safeLocalPath(params.next, centralAuth ? "/account" : "/dashboard"));
  }

  if (!centralAuth && getSsoConfig()) {
    redirect(`/auth/sso/start?next=${encodeURIComponent(safeLocalPath(params.next, "/dashboard"))}`);
  }

  return (
    <main id="main-content" className="content-wrap py-12 sm:py-20">
      <AuthForm
        mode="signup"
        nextPath={params.next}
        centralAuth={centralAuth}
        initialMessage={isSupabaseConnectionError(authError) ? dataServiceUnavailableMessage : undefined}
      />
    </main>
  );
}
