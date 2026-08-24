import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_PERSISTENCE_COOKIE, AUTH_SESSION_COOKIE } from "@/lib/auth-persistence";
import { getSiteUrl } from "@/lib/site-url";
import { getOptionalUser } from "@/lib/supabase-server";
import { isAllowedSsoUrl } from "@/lib/sso";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { supabase, user } = await getOptionalUser();

  if (user) {
    const grants = await supabase.auth.oauth.listGrants();

    if (grants.data?.length) {
      await Promise.all(grants.data.map((grant) => supabase.auth.oauth.revokeGrant({ clientId: grant.client.id })));
    }

    await supabase.auth.signOut({ scope: "global" });
  }

  const cookieStore = await cookies();
  cookieStore.delete(AUTH_PERSISTENCE_COOKIE);
  cookieStore.delete(AUTH_SESSION_COOKIE);

  const requestedReturnUrl = request.nextUrl.searchParams.get("return_to");
  const returnUrl = requestedReturnUrl && isAllowedSsoUrl(requestedReturnUrl) ? requestedReturnUrl : getSiteUrl();
  const response = NextResponse.redirect(returnUrl);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Clear-Site-Data", '"cache", "storage"');
  return response;
}

