import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getOptionalUser } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

const errorMap: Record<string, string> = {
  auth_callback_failed: "Der Login-Link konnte nicht bestätigt werden. Bitte versuche es erneut."
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { user } = await getOptionalUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <main className="content-wrap py-12 sm:py-20">
      <AuthForm mode="login" nextPath={params.next} initialMessage={params.error ? errorMap[params.error] : undefined} />
    </main>
  );
}
