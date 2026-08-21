import { headers } from "next/headers";
import { getSiteUrl } from "./site-url";

export async function getRequestOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  if (!host) {
    return getSiteUrl();
  }

  const protocol = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");

  return new URL(`${protocol}://${host}`).origin;
}
