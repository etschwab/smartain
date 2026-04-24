export function getSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!value) {
    throw new Error("Die Umgebungsvariable NEXT_PUBLIC_SUPABASE_URL fehlt.");
  }

  return value;
}

export function getSupabaseAnonKey() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!value) {
    throw new Error("Die Umgebungsvariable NEXT_PUBLIC_SUPABASE_ANON_KEY fehlt.");
  }

  return value;
}
