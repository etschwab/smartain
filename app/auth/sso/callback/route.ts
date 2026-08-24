import { NextResponse, type NextRequest } from "next/server";
import { safeLocalPath } from "@/lib/safe-redirect";
import {
  clearSsoFlowCookies,
  constantTimeEqual,
  exchangeSsoCode,
  getSsoConfig,
  setSsoSessionCookies,
  SSO_NEXT_COOKIE,
  SSO_STATE_COOKIE,
  SSO_VERIFIER_COOKIE
} from "@/lib/sso";

export const dynamic = "force-dynamic";

function failureResponse(config: NonNullable<ReturnType<typeof getSsoConfig>>, error: string) {
  const response = NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, config.siteUrl));
  clearSsoFlowCookies(response);
  return response;
}

export async function GET(request: NextRequest) {
  const config = getSsoConfig();

  if (!config) {
    return NextResponse.redirect(new URL("/login?error=sso_not_configured", request.url));
  }

  const returnedState = request.nextUrl.searchParams.get("state") ?? "";
  const expectedState = request.cookies.get(SSO_STATE_COOKIE)?.value ?? "";
  const verifier = request.cookies.get(SSO_VERIFIER_COOKIE)?.value;
  const nextPath = safeLocalPath(request.cookies.get(SSO_NEXT_COOKIE)?.value, "/dashboard");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError) {
    return failureResponse(config, oauthError === "access_denied" ? "sso_access_denied" : "sso_callback_failed");
  }

  if (!returnedState || !expectedState || !verifier || !constantTimeEqual(returnedState, expectedState)) {
    return failureResponse(config, "sso_state_invalid");
  }

  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return failureResponse(config, "sso_callback_failed");
  }

  const tokens = await exchangeSsoCode(config, code, verifier).catch(() => null);

  if (!tokens) {
    return failureResponse(config, "sso_token_exchange_failed");
  }

  const response = NextResponse.redirect(new URL(nextPath, config.siteUrl));
  clearSsoFlowCookies(response);
  setSsoSessionCookies(response, tokens);
  return response;
}

