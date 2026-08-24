import { NextResponse } from "next/server";
import { safeLocalPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const redirectPath = safeLocalPath(next, "/account");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL(`/login?error=auth_callback_failed&next=${encodeURIComponent(redirectPath)}`, requestUrl.origin));
}
