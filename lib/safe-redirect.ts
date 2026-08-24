export function safeLocalPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  try {
    const baseUrl = new URL("https://local.invalid");
    const url = new URL(value, baseUrl);

    if (url.origin !== baseUrl.origin) {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

