import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getOptionalUser } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type SignupPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { user } = await getOptionalUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <main className="content-wrap py-12 sm:py-20">
      <AuthForm mode="signup" nextPath={params.next} />
    </main>
  );
}
