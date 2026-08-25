import { PublicNavbar } from "@/components/public-navbar";
import { getOptionalUser } from "@/lib/supabase-server";

export async function PublicNavbarAuth() {
  const { user } = await getOptionalUser();
  return <PublicNavbar isAuthenticated={Boolean(user)} />;
}
