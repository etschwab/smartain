export const dataServiceUnavailableMessage =
  "Der Smartrain-Datenservice ist aktuell nicht erreichbar. Prüfe die Supabase-URL und die Vercel-Umgebungsvariablen.";

function getSupabaseErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return "";
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : "";
}

export function getSupabaseErrorMessage(error: unknown) {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : "";
  }

  return "";
}

export function isRecoverableSetupError(error: unknown) {
  const code = getSupabaseErrorCode(error);
  const message = getSupabaseErrorMessage(error);

  return (
    ["42P01", "42703", "42883", "42501", "42P17", "PGRST202", "PGRST204", "PGRST205"].includes(code) ||
    /schema cache/i.test(message) ||
    /could not find the .* column/i.test(message) ||
    /column .* does not exist/i.test(message) ||
    /could not find the table/i.test(message) ||
    /relation .* does not exist/i.test(message) ||
    /function .* does not exist/i.test(message) ||
    /could not find the function/i.test(message) ||
    /infinite recursion detected in policy/i.test(message) ||
    /row-level security policy/i.test(message) ||
    /permission denied/i.test(message)
  );
}

export function isSupabaseConnectionError(error: unknown) {
  const code = getSupabaseErrorCode(error);
  const message = getSupabaseErrorMessage(error);

  return (
    ["ENOTFOUND", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT"].includes(code.toUpperCase()) ||
    /failed to fetch/i.test(message) ||
    /fetch failed/i.test(message) ||
    /network(?: request)? failed/i.test(message) ||
    /getaddrinfo|enotfound|econnrefused|timed?\s*out/i.test(message)
  );
}

export function getUserFacingSupabaseError(error: unknown, fallback: string) {
  if (isSupabaseConnectionError(error)) {
    return dataServiceUnavailableMessage;
  }

  if (isRecoverableSetupError(error)) {
    return fallback;
  }

  return getSupabaseErrorMessage(error) || fallback;
}
