import { Suspense } from "react";
import { headers } from "next/headers";
import { AppShell } from "@/components/app/app-shell";
import { ToastFromSearch } from "@/components/toast-from-search";
import { listUserTeams } from "@/lib/data";
import { requireProfile } from "@/lib/supabase-server";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers();
  const currentPath = headerStore.get("x-current-path") ?? "/dashboard";
  const { supabase, user, profile } = await requireProfile(currentPath);
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
