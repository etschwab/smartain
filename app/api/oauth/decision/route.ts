import { NextResponse, type NextRequest } from "next/server";
import { getOptionalUser } from "@/lib/supabase-server";
import { getAuthUrl, isAllowedSsoUrl, isAuthHostname, requestHostname } from "@/lib/sso";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const authUrl = getAuthUrl();
  const origin = request.headers.get("origin");
  let trustedOrigin = !authUrl;

  if (authUrl && origin) {
    try {
      trustedOrigin = new URL(origin).origin === authUrl;
    } catch {
      trustedOrigin = false;
    }
  }

  if (authUrl && (!isAuthHostname(requestHostname(request.headers)) || !trustedOrigin)) {
    return errorResponse("Ungültiger Ursprung.", 403);
  }

  const formData = await request.formData();
  const authorizationId = formData.get("authorization_id");
  const decision = formData.get("decision");

  if (typeof authorizationId !== "string" || authorizationId.length < 10 || authorizationId.length > 500) {
    return errorResponse("Die Autorisierungs-ID fehlt oder ist ungültig.", 400);
  }

  if (decision !== "approve" && decision !== "deny") {
    return errorResponse("Die Entscheidung ist ungültig.", 400);
  }

  const { supabase, user } = await getOptionalUser();

  if (!user) {
    return errorResponse("Die Sitzung ist abgelaufen. Bitte melde dich erneut an.", 401);
  }

  const { data: details, error: detailsError } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

  if (detailsError || !details) {
    return errorResponse("Die Autorisierungsanfrage ist ungültig oder abgelaufen.", 400);
  }

  const targetUrl = "authorization_id" in details ? details.redirect_uri : details.redirect_url;

  if (!isAllowedSsoUrl(targetUrl)) {
    return errorResponse("Dieses Ziel ist nicht freigegeben.", 403);
  }

  if (!("authorization_id" in details)) {
    return NextResponse.redirect(details.redirect_url, 303);
  }

  const result =
    decision === "approve"
      ? await supabase.auth.oauth.approveAuthorization(authorizationId, { skipBrowserRedirect: true })
      : await supabase.auth.oauth.denyAuthorization(authorizationId, { skipBrowserRedirect: true });

  if (result.error || !result.data || !isAllowedSsoUrl(result.data.redirect_url)) {
    return errorResponse("Die Entscheidung konnte nicht gespeichert werden.", 400);
  }

  const response = NextResponse.redirect(result.data.redirect_url, 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
