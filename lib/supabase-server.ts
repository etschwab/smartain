import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { managerRoles } from "./constants";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";
import type { Profile, TeamMember } from "./types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const cookie of cookiesToSet) {
            cookieStore.set(cookie.name, cookie.value, cookie.options);
          }
        } catch {
          // Server Components may not be allowed to mutate cookies.
        }
      }
    }
  });
}

function loginPath(nextPath?: string) {
  return nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";
}

export async function getOptionalUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { supabase, user };
}

function normalizeProfile(raw: Partial<Profile> & { id: string }, user: User): Profile {
  const now = new Date().toISOString();

  return {
    id: raw.id,
    email: typeof raw.email === "string" || raw.email === null ? raw.email : user.email ?? null,
    full_name:
      typeof raw.full_name === "string" || raw.full_name === null
        ? raw.full_name
        : (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
          (user.email ? user.email.split("@")[0] : "Teammitglied"),
    avatar_url: typeof raw.avatar_url === "string" || raw.avatar_url === null ? raw.avatar_url : null,
    phone: typeof raw.phone === "string" || raw.phone === null ? raw.phone : null,
    jersey_number: typeof raw.jersey_number === "number" || raw.jersey_number === null ? raw.jersey_number : null,
    position: typeof raw.position === "string" || raw.position === null ? raw.position : null,
    birthday: typeof raw.birthday === "string" || raw.birthday === null ? raw.birthday : null,
    emergency_contact_name:
      typeof raw.emergency_contact_name === "string" || raw.emergency_contact_name === null
        ? raw.emergency_contact_name
        : null,
    emergency_contact_phone:
      typeof raw.emergency_contact_phone === "string" || raw.emergency_contact_phone === null
        ? raw.emergency_contact_phone
        : null,
    created_at: typeof raw.created_at === "string" ? raw.created_at : now,
    updated_at: typeof raw.updated_at === "string" ? raw.updated_at : now
  };
}

function isMissingColumnError(message: string) {
  return /could not find the '.*' column|schema cache/i.test(message);
}

function isProfileWritePolicyError(message: string) {
  return /row-level security policy|violates row-level security/i.test(message);
}

async function ensureProfile(supabase: Awaited<ReturnType<typeof createClient>>, user: User) {
  const { data: existingProfile, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (existingProfile) {
    return normalizeProfile(existingProfile as Partial<Profile> & { id: string }, user);
  }

  const fullName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    (user.email ? user.email.split("@")[0] : "Teammitglied");

  const payloads = [
    {
      id: user.id,
      email: user.email ?? null,
      full_name: fullName
    },
    {
      id: user.id,
      full_name: fullName
    },
    {
      id: user.id
    }
  ] as const;

  let lastError: string | null = null;

  for (const payload of payloads) {
    const { data: insertedProfile, error: insertError } = await supabase
      .from("profiles")
      .upsert(payload, {
        onConflict: "id"
      })
      .select("*")
      .maybeSingle();

    if (!insertError) {
      return normalizeProfile(
        ((insertedProfile ?? payload) as Partial<Profile> & { id: string }),
        user
      );
    }

    lastError = insertError.message;

    if (isProfileWritePolicyError(insertError.message)) {
      return normalizeProfile({ id: user.id, email: user.email ?? null, full_name: fullName }, user);
    }

    if (!isMissingColumnError(insertError.message)) {
      throw new Error(insertError.message);
    }
  }

  throw new Error(lastError ?? "Profil konnte nicht erstellt werden.");
}

export async function requireProfile(nextPath?: string) {
  const { supabase, user } = await getOptionalUser();

  if (!user) {
    redirect(loginPath(nextPath));
  }

  const profile = await ensureProfile(supabase, user);

  return {
    supabase,
    user,
    profile
  };
}

export async function getMembershipForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teamId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as TeamMember | null) ?? null;
}

export async function requireTeamAccess(teamId: string, nextPath?: string) {
  const context = await requireProfile(nextPath ?? `/teams/${teamId}`);
  const membership = await getMembershipForUser(context.supabase, teamId, context.user.id);

  if (!membership || membership.status !== "active") {
    redirect("/teams");
  }

  return {
    ...context,
    membership
  };
}

export async function requireTeamManager(teamId: string, nextPath?: string) {
  const context = await requireTeamAccess(teamId, nextPath);

  if (!managerRoles.includes(context.membership.role)) {
    throw new Error("Du hast fuer diese Aktion keine Berechtigung.");
  }

  return context;
}
