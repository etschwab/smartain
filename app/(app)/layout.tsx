import { Suspense } from "react";
import { AppShell } from "@/components/app/app-shell";
import { ToastFromSearch } from "@/components/toast-from-search";
import { listUserTeams } from "@/lib/data";
import { requireProfile } from "@/lib/supabase-server";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, profile } = await requireProfile("/dashboard");
  const teams = await listUserTeams(supabase, user.id);

  return (
    <>
      <Suspense fallback={null}>
        <ToastFromSearch />
      </Suspense>
      <AppShell profile={profile} teams={teams}>
        {children}
      </AppShell>
    </>
  );
}
