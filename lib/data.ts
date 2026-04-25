import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, endOfDay, startOfDay } from "date-fns";
import { isRecoverableSetupError } from "./supabase-errors";
import type {
  EventRecord,
  EventResponseCounts,
  EventResponseRecord,
  EventWithTeam,
  MemberWithProfile,
  NotificationRecord,
  Profile,
  TaskRecord,
  TaskWithRelations,
  Team,
  TeamInvite,
  TeamMember,
  TeamWithMembership
} from "./types";

type AppSupabaseClient = SupabaseClient<any, "public", any>;

function assertNoError(error: { message: string } | null, fallback: string) {
  if (error) {
    throw new Error(`${fallback}: ${error.message}`);
  }
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

export async function getProfilesMap(supabase: AppSupabaseClient, userIds: string[]) {
  const ids = unique(userIds.filter(Boolean));

  if (ids.length === 0) {
    return new Map<string, Profile>();
  }

  const { data, error } = await supabase.from("profiles").select("*").in("id", ids);
  if (isRecoverableSetupError(error)) {
    return new Map<string, Profile>();
  }

  assertNoError(error, "Profile konnten nicht geladen werden");

  return new Map((data as Profile[]).map((profile) => [profile.id, profile]));
}

export async function listUserTeams(supabase: AppSupabaseClient, userId: string) {
  const { data: memberships, error: membershipsError } = await supabase
    .from("team_members")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active");

  if (isRecoverableSetupError(membershipsError)) {
    return [] satisfies TeamWithMembership[];
  }

  assertNoError(membershipsError, "Mitgliedschaften konnten nicht geladen werden");

  const teamMemberships = (memberships as TeamMember[]) ?? [];
  const teamIds = teamMemberships.map((membership) => membership.team_id);

  if (teamIds.length === 0) {
    return [] satisfies TeamWithMembership[];
  }

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .in("id", teamIds)
    .order("name", { ascending: true });

  if (isRecoverableSetupError(teamsError)) {
    return [] satisfies TeamWithMembership[];
  }

  assertNoError(teamsError, "Teams konnten nicht geladen werden");

  const membershipByTeam = new Map(teamMemberships.map((membership) => [membership.team_id, membership]));

  return ((teams as Team[]) ?? []).map((team) => ({
    ...team,
    membership: membershipByTeam.get(team.id)!
  }));
}

export async function getTeamById(supabase: AppSupabaseClient, teamId: string) {
  const { data, error } = await supabase.from("teams").select("*").eq("id", teamId).maybeSingle();
  if (isRecoverableSetupError(error)) {
    return null;
  }

  assertNoError(error, "Team konnte nicht geladen werden");
  return (data as Team | null) ?? null;
}

export async function listTeamMembersDetailed(supabase: AppSupabaseClient, teamId: string) {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: true });

  if (isRecoverableSetupError(error)) {
    return [] satisfies MemberWithProfile[];
  }

  assertNoError(error, "Mitglieder konnten nicht geladen werden");

  const memberships = (data as TeamMember[]) ?? [];
  const profilesMap = await getProfilesMap(
    supabase,
    memberships.map((membership) => membership.user_id)
  );

  return memberships.map((membership) => ({
    ...membership,
    profile: profilesMap.get(membership.user_id) ?? null
  })) satisfies MemberWithProfile[];
}

export async function listTeamInvites(supabase: AppSupabaseClient, teamId: string) {
  const { data, error } = await supabase
    .from("team_invites")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  if (isRecoverableSetupError(error)) {
    return [] satisfies TeamInvite[];
  }

  assertNoError(error, "Einladungslinks konnten nicht geladen werden");
  return ((data as TeamInvite[]) ?? []) as TeamInvite[];
}

export async function getPublicInvite(supabase: AppSupabaseClient, inviteCode: string) {
  const { data, error } = await supabase
    .from("team_invites")
    .select("*")
    .eq("code", inviteCode)
    .maybeSingle();

  if (isRecoverableSetupError(error)) {
    return null;
  }

  assertNoError(error, "Einladung konnte nicht geladen werden");
  return (data as TeamInvite | null) ?? null;
}

export async function listTeamEvents(supabase: AppSupabaseClient, teamId: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("team_id", teamId)
    .order("starts_at", { ascending: true });

  if (isRecoverableSetupError(error)) {
    return [] satisfies EventRecord[];
  }

  assertNoError(error, "Termine konnten nicht geladen werden");
  return ((data as EventRecord[]) ?? []) as EventRecord[];
}

export async function getEventById(supabase: AppSupabaseClient, eventId: string) {
  const { data, error } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
  if (isRecoverableSetupError(error)) {
    return null;
  }

  assertNoError(error, "Termin konnte nicht geladen werden");
  return (data as EventRecord | null) ?? null;
}

export async function listEventResponses(supabase: AppSupabaseClient, eventId: string) {
  const { data, error } = await supabase
    .from("event_responses")
    .select("*")
    .eq("event_id", eventId)
    .order("responded_at", { ascending: true });

  if (isRecoverableSetupError(error)) {
    return [] satisfies EventResponseRecord[];
  }

  assertNoError(error, "Antworten konnten nicht geladen werden");
  return ((data as EventResponseRecord[]) ?? []) as EventResponseRecord[];
}

export async function listTeamTasks(supabase: AppSupabaseClient, teamId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  if (isRecoverableSetupError(error)) {
    return [] satisfies TaskWithRelations[];
  }

  assertNoError(error, "Aufgaben konnten nicht geladen werden");

  const tasks = ((data as TaskRecord[]) ?? []) as TaskRecord[];
  const profilesMap = await getProfilesMap(
    supabase,
    tasks.map((task) => task.assigned_to ?? "").filter(Boolean)
  );
  const eventsMap = new Map(
    (await listTeamEvents(supabase, teamId))
      .filter((event) => tasks.some((task) => task.event_id === event.id))
      .map((event) => [event.id, event])
  );

  return tasks.map((task) => ({
    ...task,
    assignee: task.assigned_to ? profilesMap.get(task.assigned_to) ?? null : null,
    event: task.event_id ? eventsMap.get(task.event_id) ?? null : null
  })) satisfies TaskWithRelations[];
}

export async function listUserNotifications(supabase: AppSupabaseClient, userId: string, limit = 6) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (isRecoverableSetupError(error)) {
    return [] satisfies NotificationRecord[];
  }

  assertNoError(error, "Benachrichtigungen konnten nicht geladen werden");
  return ((data as NotificationRecord[]) ?? []) as NotificationRecord[];
}

export async function getEventResponseCounts(
  supabase: AppSupabaseClient,
  eventId: string,
  teamId: string
) {
  const [responses, members] = await Promise.all([
    listEventResponses(supabase, eventId),
    listTeamMembersDetailed(supabase, teamId)
  ]);

  const counts = responses.reduce<EventResponseCounts>(
    (accumulator, response) => {
      accumulator[response.status] += 1;
      return accumulator;
    },
    {
      yes: 0,
      no: 0,
      maybe: 0,
      pending: 0
    }
  );

  counts.pending = members.filter(
    (member) => member.status === "active" && !responses.some((response) => response.user_id === member.user_id)
  ).length;

  return counts;
}

export async function getDashboardData(supabase: AppSupabaseClient, userId: string) {
  const teams = await listUserTeams(supabase, userId);
  const teamIds = teams.map((team) => team.id);
  const notifications = await listUserNotifications(supabase, userId);

  if (teamIds.length === 0) {
    return {
      teams,
      notifications,
      todayEvents: [] as EventRecord[],
      nextTrainings: [] as EventRecord[],
      nextGames: [] as EventRecord[],
      pendingResponses: [] as EventWithTeam[],
      assignedTasks: [] as TaskWithRelations[]
    };
  }

  const { data: eventsData, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .in("team_id", teamIds)
    .gte("starts_at", startOfDay(addDays(new Date(), -1)).toISOString())
    .lte("starts_at", endOfDay(addDays(new Date(), 30)).toISOString())
    .order("starts_at", { ascending: true });

  if (isRecoverableSetupError(eventsError)) {
    return {
      teams,
      notifications,
      todayEvents: [] as EventRecord[],
      nextTrainings: [] as EventRecord[],
      nextGames: [] as EventRecord[],
      pendingResponses: [] as EventWithTeam[],
      assignedTasks: [] as TaskWithRelations[]
    };
  }

  assertNoError(eventsError, "Dashboard-Termine konnten nicht geladen werden");

  const events = ((eventsData as EventRecord[]) ?? []) as EventRecord[];
  const eventIds = events.map((event) => event.id);

  let responses: EventResponseRecord[] = [];
  if (eventIds.length > 0) {
    const { data: responseData, error: responseError } = await supabase
      .from("event_responses")
      .select("*")
      .eq("user_id", userId)
      .in("event_id", eventIds);

    if (isRecoverableSetupError(responseError)) {
      responses = [];
    } else {
      assertNoError(responseError, "Dashboard-Antworten konnten nicht geladen werden");
      responses = ((responseData as EventResponseRecord[]) ?? []) as EventResponseRecord[];
    }
  }

  const { data: taskData, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .in("team_id", teamIds)
    .eq("status", "open")
    .eq("assigned_to", userId)
    .order("due_at", { ascending: true });

  if (isRecoverableSetupError(taskError)) {
    return {
      teams,
      notifications,
      todayEvents: events.filter((event) => {
        const eventDate = new Date(event.starts_at);
        const now = new Date();
        return eventDate.toDateString() === now.toDateString();
      }),
      nextTrainings: events.filter((event) => event.type === "training").slice(0, 3),
      nextGames: events.filter((event) => event.type === "game").slice(0, 3),
      pendingResponses: [] as EventWithTeam[],
      assignedTasks: [] as TaskWithRelations[]
    };
  }

  assertNoError(taskError, "Dashboard-Aufgaben konnten nicht geladen werden");

  const assignedTasksRaw = ((taskData as TaskRecord[]) ?? []) as TaskRecord[];
  const eventMap = new Map(events.map((event) => [event.id, event]));

  const assignedTasks = assignedTasksRaw.map((task) => ({
    ...task,
    assignee: null,
    event: task.event_id ? eventMap.get(task.event_id) ?? null : null
  })) satisfies TaskWithRelations[];

  const responseMap = new Map(responses.map((response) => [response.event_id, response]));
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const todayEvents = events.filter((event) => {
    const eventDate = new Date(event.starts_at);
    const now = new Date();
    return eventDate.toDateString() === now.toDateString();
  });

  return {
    teams,
    notifications,
    todayEvents,
    nextTrainings: events.filter((event) => event.type === "training").slice(0, 3),
    nextGames: events.filter((event) => event.type === "game").slice(0, 3),
    pendingResponses: events
      .filter((event) => new Date(event.starts_at).getTime() >= Date.now())
      .filter((event) => !responseMap.has(event.id))
      .slice(0, 5)
      .map((event) => ({
        ...event,
        team: teamMap.get(event.team_id) ?? null,
        response: null
      })) satisfies EventWithTeam[],
    assignedTasks
  };
}
