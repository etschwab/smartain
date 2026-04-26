type SupabaseLikeError =
  | {
      code?: string;
      message?: string;
    }
  | string
  | null
  | undefined;

export function getSupabaseErrorMessage(error: SupabaseLikeError) {
  if (!error) {
    return "";
  }

  return typeof error === "string" ? error : error.message ?? "";
}

export function isRecoverableSetupError(error: SupabaseLikeError) {
  const code = typeof error === "string" ? "" : error?.code ?? "";
  const message = getSupabaseErrorMessage(error);

  return (
    ["42P01", "42703", "42501", "PGRST204", "PGRST205"].includes(code) ||
    /schema cache/i.test(message) ||
    /could not find the .* column/i.test(message) ||
    /column .* does not exist/i.test(message) ||
    /could not find the table/i.test(message) ||
    /relation .* does not exist/i.test(message) ||
    /row-level security policy/i.test(message) ||
    /permission denied/i.test(message)
  );
}
