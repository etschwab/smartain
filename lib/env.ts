export function getSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!value) {
    throw new Error("Die Umgebungsvariable NEXT_PUBLIC_SUPABASE_URL fehlt.");
  }

  if (/your[-_]supabase[-_]url|your-project-ref/i.test(value)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL enthält noch den Beispielwert.");
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL ist keine gültige URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL muss eine HTTP- oder HTTPS-URL sein.");
  }

  const isLoopback = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);

  if (process.env.NODE_ENV === "production" && isLoopback) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL darf in Produktion nicht auf localhost zeigen.");
  }

  return url.origin;
}

export function getSupabaseAnonKey() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!value) {
    throw new Error("Die Umgebungsvariable NEXT_PUBLIC_SUPABASE_ANON_KEY fehlt.");
  }

  if (/your[-_]supabase[-_](anon|publishable)[-_]key/i.test(value)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY enthält noch den Beispielwert.");
  }

  return value;
}

export function getSupabaseServiceRoleKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!value) {
    return null;
  }

  if (/your[-_]supabase[-_]service[-_]role[-_]key/i.test(value)) {
    return null;
  }

  return value;
}
