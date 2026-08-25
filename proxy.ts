import { NextResponse, type NextRequest } from "next/server";
import {
  clearSsoSessionCookies,
  getSsoConfig,
  jwtExpiresSoon,
  refreshSsoTokens,
  setSsoSessionCookies,
  SSO_ACCESS_COOKIE,
  SSO_REFRESH_COOKIE
} from "@/lib/sso";

function withUpdatedCookieHeader(currentHeader: string | null, updates: Record<string, string | null>) {
  const cookies = new Map<string, string>();

  for (const part of currentHeader?.split(";") ?? []) {
    const separator = part.indexOf("=");

    if (separator > 0) {
      cookies.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
    }
  }

  for (const [name, value] of Object.entries(updates)) {
    if (value === null) {
      cookies.delete(name);
    } else {
      cookies.set(name, value);
    }
  }

  return Array.from(cookies, ([name, value]) => `${name}=${value}`).join("; ");
}

export async function proxy(request: NextRequest) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const requestHost = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").split(":")[0].toLowerCase();

  if (configuredSiteUrl && requestHost.endsWith(".vercel.app")) {
    const canonicalUrl = new URL(configuredSiteUrl);

    if (requestHost !== canonicalUrl.hostname.toLowerCase()) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.protocol = canonicalUrl.protocol;
      redirectUrl.host = canonicalUrl.host;

      return NextResponse.redirect(redirectUrl, 308);
    }
  }

  const requestHeaders = new Headers(request.headers);
  const currentPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  requestHeaders.set("x-current-path", currentPath);

  const config = getSsoConfig();
  const accessToken = request.cookies.get(SSO_ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(SSO_REFRESH_COOKIE)?.value;

  if (config && refreshToken && (!accessToken || jwtExpiresSoon(accessToken))) {
    const tokens = await refreshSsoTokens(config, refreshToken).catch(() => null);

    if (tokens) {
      requestHeaders.set(
        "cookie",
        withUpdatedCookieHeader(request.headers.get("cookie"), {
          [SSO_ACCESS_COOKIE]: tokens.accessToken,
          [SSO_REFRESH_COOKIE]: tokens.refreshToken
        })
      );
      const response = NextResponse.next({ request: { headers: requestHeaders } });
      setSsoSessionCookies(response, tokens);
      return response;
    }

    requestHeaders.set(
      "cookie",
      withUpdatedCookieHeader(request.headers.get("cookie"), {
        [SSO_ACCESS_COOKIE]: null,
        [SSO_REFRESH_COOKIE]: null
      })
    );
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    clearSsoSessionCookies(response);
    return response;
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
