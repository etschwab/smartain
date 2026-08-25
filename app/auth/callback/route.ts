import { NextResponse } from "next/server";
import { safeLocalPath } from "@/lib/safe-redirect";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const siteUrl = getSiteUrl();
  const code = requestUrl.searchParams.get("code");
  const nextPath = safeLocalPath(requestUrl.searchParams.get("next"), "/dashboard");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, siteUrl));
    }
  }

  const loginUrl = new URL("/login", siteUrl);
  loginUrl.searchParams.set("error", "auth_callback_failed");
  loginUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(loginUrl);
}
