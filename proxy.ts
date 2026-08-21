import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const requestHost = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(":")[0]
    .toLowerCase();

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

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
