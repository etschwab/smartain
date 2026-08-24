function normalizeSiteUrl(value: string) {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  let url: URL;

  try {
    url = new URL(withProtocol);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL ist keine gültige URL.");
  }

  const isLoopback = ["localhost", "127.0.0.1", "::1"].includes(url.hostname) || url.hostname.endsWith(".localhost");

  if (process.env.NODE_ENV === "production" && isLoopback) {
    throw new Error("NEXT_PUBLIC_SITE_URL darf in Produktion nicht auf localhost zeigen.");
  }

  return url.origin;
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();

  if (configuredUrl) {
    return normalizeSiteUrl(configuredUrl);
  }

  if (vercelUrl) {
    return normalizeSiteUrl(vercelUrl);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Für Produktion muss NEXT_PUBLIC_SITE_URL oder eine von Vercel bereitgestellte Deployment-URL gesetzt sein."
    );
  }

  return "http://localhost:3000";
}
