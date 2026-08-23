import type { SupabaseClient } from "@supabase/supabase-js";
import { getUserFacingSupabaseError, isRecoverableSetupError } from "@/lib/supabase-errors";
import { getProfilesMap, listTeamEvents } from "@/lib/data";
import type {
  AbsenceRecord,
  CarpoolRecord,
  LedgerEntry,
  LineupEntry,
  PollRecord,
  Profile,
  TeamUpdate
} from "@/lib/types";

type AppSupabaseClient = SupabaseClient<any, "public", any>;

function fail(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(getUserFacingSupabaseError(error, fallback));
}

export async function getOrganizationFeatureSupport(supabase: AppSupabaseClient) {
  const { error } = await supabase.from("team_updates").select("id").limit(1);
  if (isRecoverableSetupError(error)) return false;
  fail(error, "Die Teamzentrale konnte nicht geprüft werden.");
  return true;
}

export async function listTeamUpdates(supabase: AppSupabaseClient, teamId: string, kind: "news" | "message") {
  const { data, error } = await supabase
    .from("team_updates")
    .select("*")
    .eq("team_id", teamId)
    .eq("kind", kind)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(kind === "message" ? 50 : 20);

  if (isRecoverableSetupError(error)) return [] satisfies TeamUpdate[];
  fail(error, kind === "news" ? "Neuigkeiten konnten nicht geladen werden." : "Nachrichten konnten nicht geladen werden.");

  const updates = ((data as TeamUpdate[]) ?? []) as TeamUpdate[];
  const profiles = await getProfilesMap(supabase, updates.map((entry) => entry.author_id));
  return updates.map((entry) => ({ ...entry, author: profiles.get(entry.author_id) ?? null }));
}

export async function listTeamPolls(supabase: AppSupabaseClient, teamId: string, userId: string) {
  const { data: pollsData, error } = await supabase
    .from("polls")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (isRecoverableSetupError(error)) return [] satisfies PollRecord[];
  fail(error, "Abstimmungen konnten nicht geladen werden.");

  const polls = (pollsData ?? []) as Array<Omit<PollRecord, "options" | "own_option_id">>;
  if (polls.length === 0) return [] satisfies PollRecord[];

  const pollIds = polls.map((poll) => poll.id);
  const [{ data: optionsData, error: optionsError }, { data: votesData, error: votesError }] = await Promise.all([
    supabase.from("poll_options").select("*").in("poll_id", pollIds).order("position", { ascending: true }),
    supabase.from("poll_votes").select("poll_id, option_id, user_id").in("poll_id", pollIds)
  ]);

  fail(optionsError, "Antwortmöglichkeiten konnten nicht geladen werden.");
  fail(votesError, "Stimmen konnten nicht geladen werden.");

  const votes = (votesData ?? []) as Array<{ poll_id: string; option_id: string; user_id: string }>;
  return polls.map((poll) => ({
    ...poll,
    options: ((optionsData ?? []) as Array<{ id: string; poll_id: string; label: string; position: number }>)
      .filter((option) => option.poll_id === poll.id)
      .map((option) => ({
        ...option,
        votes: votes.filter((vote) => vote.option_id === option.id).length
      })),
    own_option_id: votes.find((vote) => vote.poll_id === poll.id && vote.user_id === userId)?.option_id ?? null
  }));
}

export async function listTeamAbsences(supabase: AppSupabaseClient, teamId: string) {
  const { data, error } = await supabase
    .from("absences")
    .select("*")
    .eq("team_id", teamId)
    .gte("ends_on", new Date().toISOString().slice(0, 10))
    .order("starts_on", { ascending: true });

  if (isRecoverableSetupError(error)) return [] satisfies AbsenceRecord[];
  fail(error, "Abwesenheiten konnten nicht geladen werden.");

  const absences = ((data as AbsenceRecord[]) ?? []) as AbsenceRecord[];
  const profiles = await getProfilesMap(supabase, absences.map((entry) => entry.user_id));
  return absences.map((entry) => ({ ...entry, profile: profiles.get(entry.user_id) ?? null }));
}

export async function listTeamCarpools(supabase: AppSupabaseClient, teamId: string) {
  const { data, error } = await supabase
    .from("carpools")
    .select("*")
    .eq("team_id", teamId)
    .order("departure_at", { ascending: true, nullsFirst: false });

  if (isRecoverableSetupError(error)) return [] satisfies CarpoolRecord[];
  fail(error, "Fahrgemeinschaften konnten nicht geladen werden.");

  const carpools = ((data as CarpoolRecord[]) ?? []) as CarpoolRecord[];
  if (carpools.length === 0) return [] satisfies CarpoolRecord[];

  const [{ data: ridersData, error: ridersError }, profiles, events] = await Promise.all([
    supabase.from("carpool_riders").select("carpool_id, user_id").in("carpool_id", carpools.map((entry) => entry.id)),
    getProfilesMap(supabase, carpools.map((entry) => entry.driver_id)),
    listTeamEvents(supabase, teamId)
  ]);
  fail(ridersError, "Mitfahrende konnten nicht geladen werden.");
  const riders = (ridersData ?? []) as Array<{ carpool_id: string; user_id: string }>;
  const eventMap = new Map(events.map((event) => [event.id, event]));

  return carpools.map((entry) => ({
    ...entry,
    driver: profiles.get(entry.driver_id) ?? null,
    event: entry.event_id ? eventMap.get(entry.event_id) ?? null : null,
    rider_ids: riders.filter((rider) => rider.carpool_id === entry.id).map((rider) => rider.user_id)
  }));
}

export async function listTeamLedger(supabase: AppSupabaseClient, teamId: string) {
  const { data, error } = await supabase
    .from("ledger_entries")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  if (isRecoverableSetupError(error)) return [] satisfies LedgerEntry[];
  fail(error, "Teamkasse konnte nicht geladen werden.");

  const entries = ((data as LedgerEntry[]) ?? []) as LedgerEntry[];
  const profiles = await getProfilesMap(supabase, entries.map((entry) => entry.member_id ?? "").filter(Boolean));
  return entries.map((entry) => ({ ...entry, member: entry.member_id ? profiles.get(entry.member_id) ?? null : null }));
}

export async function listEventLineup(supabase: AppSupabaseClient, eventId: string) {
  const { data, error } = await supabase
    .from("event_lineup")
    .select("*")
    .eq("event_id", eventId)
    .order("is_starter", { ascending: false })
    .order("created_at", { ascending: true });

  if (isRecoverableSetupError(error)) return [] satisfies LineupEntry[];
  fail(error, "Aufstellung konnte nicht geladen werden.");

  const lineup = ((data as LineupEntry[]) ?? []) as LineupEntry[];
  const profiles = await getProfilesMap(supabase, lineup.map((entry) => entry.user_id));
  return lineup.map((entry) => ({ ...entry, profile: profiles.get(entry.user_id) ?? null }));
}

export function profileName(profile?: Profile | null) {
  return profile?.full_name ?? profile?.email ?? "Teammitglied";
}
