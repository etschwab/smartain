import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";
import {
  clearSsoSessionCookies,
  getAuthUrl,
  getSsoConfig,
  isAuthHostname,
  jwtExpiresSoon,
  refreshSsoTokens,
  requestHostname,
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

async function refreshAuthPortalSession(request: NextRequest, requestHeaders: Headers) {
  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headersToSet) {
        for (const cookie of cookiesToSet) {
          request.cookies.set(cookie.name, cookie.value);
        }

        requestHeaders.set("cookie", request.cookies.toString());
        response = NextResponse.next({ request: { headers: requestHeaders } });

        for (const cookie of cookiesToSet) {
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        }

        for (const [name, value] of Object.entries(headersToSet)) {
          response.headers.set(name, value);
        }
      }
    }
  });

  await supabase.auth.getUser();
  return response;
}

export async function proxy(request: NextRequest) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const requestHost = requestHostname(request.headers);

  if (configuredSiteUrl && requestHost.endsWith(".vercel.app")) {
    const canonicalUrl = new URL(configuredSiteUrl);

    if (requestHost !== canonicalUrl.hostname.toLowerCase()) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.protocol = canonicalUrl.protocol;
      redirectUrl.host = canonicalUrl.host;

      return NextResponse.redirect(redirectUrl, 308);
    }
  }

  const authUrl = getAuthUrl();
  const isAuthRequest = isAuthHostname(requestHost);
  const centralOnlyPaths = ["/account", "/logout", "/oauth/consent", "/api/oauth/decision"];
  const authPortalPaths = ["/account", "/logout", "/oauth/consent", "/api/oauth/decision", "/login", "/signup", "/auth/callback", "/datenschutz", "/impressum"];

  if (authUrl && isAuthRequest && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/account", authUrl));
  }

  if (authUrl && isAuthRequest && !authPortalPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/account", authUrl));
  }

  if (authUrl && !isAuthRequest && centralOnlyPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    const centralUrl = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, authUrl);
    return NextResponse.redirect(centralUrl);
  }

  const requestHeaders = new Headers(request.headers);
  const currentPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  requestHeaders.set("x-current-path", currentPath);

  if (isAuthRequest) {
    return refreshAuthPortalSession(request, requestHeaders);
  }

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
