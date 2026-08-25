"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase-server";
import { getAuthUrl, SSO_ACCESS_COOKIE, SSO_REFRESH_COOKIE } from "@/lib/sso";

export async function signOutAction() {
  const cookieStore = await cookies();
  const hasSsoSession = Boolean(cookieStore.get(SSO_ACCESS_COOKIE) || cookieStore.get(SSO_REFRESH_COOKIE));

  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });

  if (hasSsoSession) {
    cookieStore.delete(SSO_ACCESS_COOKIE);
    cookieStore.delete(SSO_REFRESH_COOKIE);

    const authUrl = getAuthUrl();

    if (authUrl) {
      const returnUrl = new URL(getSiteUrl());
      returnUrl.searchParams.set("toast", "signed-out");
      const logoutUrl = new URL("/logout", authUrl);
      logoutUrl.searchParams.set("return_to", returnUrl.toString());
      redirect(logoutUrl.toString());
    }
  }

  redirect("/login");
}
