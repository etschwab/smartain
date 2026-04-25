"use server";

import { redirect } from "next/navigation";
import { requireProfile, requireTeamAccess, requireTeamManager } from "@/lib/supabase-server";
import { buildJoinPath } from "@/lib/utils";

function getString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function getNullableString(formData: FormData, name: string) {
  const value = getString(formData, name);
  return value.length > 0 ? value : null;
}

async function createNotificationsForUsers(
  supabase: Awaited<ReturnType<typeof requireProfile>>["supabase"],
  userIds: string[],
  payload: {
    team_id: string;
    event_id?: string | null;
    task_id?: string | null;
    type: string;
    title: string;
    body: string;
    action_path?: string | null;
  }
) {
  const rows = userIds.map((userId) => ({
    user_id: userId,
    team_id: payload.team_id,
    event_id: payload.event_id ?? null,
    task_id: payload.task_id ?? null,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    action_path: payload.action_path ?? null
  }));

  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase.from("notifications").insert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createEventAction(teamId: string, formData: FormData) {
  const { supabase, profile, user } = await requireTeamManager(teamId, `/teams/${teamId}/events/new`);
  const title = getString(formData, "title");
  const type = getString(formData, "type");
  const startsAt = getString(formData, "starts_at");
  const endsAt = getString(formData, "ends_at");

  if (!title || !type || !startsAt || !endsAt) {
    throw new Error("Bitte fuelle alle Pflichtfelder fuer den Termin aus.");
  }

  if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
    throw new Error("Die Endzeit muss nach der Startzeit liegen.");
  }

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      team_id: teamId,
      title,
      type,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      location: getNullableString(formData, "location"),
      description: getNullableString(formData, "description"),
      created_by: user.id
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { data: members, error: memberError } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("team_id", teamId)
    .eq("status", "active");

  if (memberError) {
    throw new Error(memberError.message);
  }

  const titlePrefix =
    type === "training" ? "Neues Training" : type === "game" ? "Neues Spiel" : "Neuer Termin";

  await createNotificationsForUsers(
    supabase,
    ((members as Array<{ user_id: string }>) ?? []).map((member) => member.user_id).filter((memberId) => memberId !== user.id),
    {
      team_id: teamId,
      event_id: event.id,
      type: "event_created",
      title: titlePrefix,
      body: `${profile.full_name ?? "Trainer"} hat "${event.title}" geplant.`,
      action_path: `/teams/${teamId}/events/${event.id}`
    }
  );

  redirect(`/teams/${teamId}/events/${event.id}?toast=event-created`);
}

export async function respondToEventAction(teamId: string, eventId: string, formData: FormData) {
  const { supabase, profile, user } = await requireTeamAccess(teamId, `/teams/${teamId}/events/${eventId}`);
  const status = getString(formData, "status");

  if (!status) {
    throw new Error("Bitte waehle eine Antwort aus.");
  }

  const { error } = await supabase.from("event_responses").upsert(
    {
      event_id: eventId,
      user_id: user.id,
      status,
      comment: getNullableString(formData, "comment"),
      responded_at: new Date().toISOString()
    },
    {
      onConflict: "event_id,user_id"
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  const { data: managers, error: managersError } = await supabase
    .from("team_members")
    .select("user_id, role")
    .eq("team_id", teamId)
    .eq("status", "active");

  if (managersError) {
    throw new Error(managersError.message);
  }

  const managerIds = ((managers as Array<{ user_id: string; role: string }>) ?? [])
    .filter((member) => member.user_id !== user.id && (member.role === "owner" || member.role === "coach"))
    .map((member) => member.user_id);

  await createNotificationsForUsers(supabase, managerIds, {
    team_id: teamId,
    event_id: eventId,
    type: "response_submitted",
    title: "Neue Rueckmeldung",
    body: `${profile.full_name ?? profile.email ?? "Mitglied"} hat auf einen Termin geantwortet.`,
    action_path: `/teams/${teamId}/events/${eventId}`
  });

  redirect(`/teams/${teamId}/events/${eventId}?toast=response-saved`);
}
