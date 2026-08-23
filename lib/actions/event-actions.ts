"use server";

import { redirect } from "next/navigation";
import { addWeeks } from "date-fns";
import { requireProfile, requireTeamAccess, requireTeamManager } from "@/lib/supabase-server";
import { getUserFacingSupabaseError, isRecoverableSetupError } from "@/lib/supabase-errors";

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
    if (isRecoverableSetupError(error)) {
      return;
    }

    throw new Error(getUserFacingSupabaseError(error, "Die Benachrichtigungen konnten nicht erstellt werden."));
  }
}

export async function createEventAction(teamId: string, formData: FormData) {
  const { supabase, profile, user } = await requireTeamManager(teamId, `/teams/${teamId}/events/new`);
  const title = getString(formData, "title");
  const type = getString(formData, "type");
  const startsAt = getString(formData, "starts_at");
  const endsAt = getString(formData, "ends_at");

  if (!title || !type || !startsAt || !endsAt) {
    throw new Error("Bitte fülle alle Pflichtfelder für den Termin aus.");
  }

  if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
    throw new Error("Die Endzeit muss nach der Startzeit liegen.");
  }

  const recurrenceCount = Math.min(52, Math.max(1, Number.parseInt(getString(formData, "recurrence_count") || "1", 10) || 1));
  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);
  const payloads = Array.from({ length: recurrenceCount }, (_, index) => ({
    team_id: teamId,
    title,
    type,
    starts_at: addWeeks(startDate, index).toISOString(),
    ends_at: addWeeks(endDate, index).toISOString(),
    location: getNullableString(formData, "location"),
    description: getNullableString(formData, "description"),
    response_deadline: getNullableString(formData, "response_deadline")
      ? new Date(getString(formData, "response_deadline")).toISOString()
      : null,
    max_participants: getNullableString(formData, "max_participants")
      ? Number.parseInt(getString(formData, "max_participants"), 10)
      : null,
    created_by: user.id
  }));

  const { data: events, error } = await supabase
    .from("events")
    .insert(payloads)
    .select("*")
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(getUserFacingSupabaseError(error, "Der Termin konnte nicht erstellt werden."));
  }

  let membersResult = await supabase
    .from("team_members")
    .select("user_id")
    .eq("team_id", teamId)
    .eq("status", "active");

  if (isRecoverableSetupError(membersResult.error)) {
    membersResult = await supabase.from("team_members").select("user_id").eq("team_id", teamId);
  }

  if (membersResult.error) {
    throw new Error(getUserFacingSupabaseError(membersResult.error, "Die Teammitglieder konnten nicht geladen werden."));
  }

  const titlePrefix =
    type === "training" ? "Neues Training" : type === "game" ? "Neues Spiel" : "Neuer Termin";

  await createNotificationsForUsers(
    supabase,
    (((membersResult.data as Array<{ user_id: string }>) ?? []).map((member) => member.user_id).filter((memberId) => memberId !== user.id)),
    {
      team_id: teamId,
      event_id: events?.[0]?.id ?? null,
      type: "event_created",
      title: titlePrefix,
      body: `${profile.full_name ?? "Trainer"} hat "${title}"${recurrenceCount > 1 ? ` als Serie mit ${recurrenceCount} Terminen` : ""} geplant.`,
      action_path: recurrenceCount > 1 ? `/teams/${teamId}/events` : `/teams/${teamId}/events/${events?.[0]?.id}`
    }
  );

  redirect(recurrenceCount > 1 ? `/teams/${teamId}/events?toast=events-created` : `/teams/${teamId}/events/${events?.[0]?.id}?toast=event-created`);
}

function parseCsvLine(line: string, delimiter: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"' && quoted) { current += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === delimiter && !quoted) { values.push(current.trim()); current = ""; }
    else current += character;
  }
  values.push(current.trim());
  return values;
}

export async function importEventsCsvAction(teamId: string, formData: FormData) {
  const { supabase, user } = await requireTeamManager(teamId, `/teams/${teamId}/events`);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Bitte wähle eine CSV-Datei aus.");
  if (file.size > 2_000_000) throw new Error("Die CSV-Datei darf maximal 2 MB groß sein.");

  const content = (await file.text()).replace(/^\uFEFF/, "");
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) throw new Error("Die CSV-Datei enthält keine Termine.");
  if (lines.length > 501) throw new Error("Pro Import sind maximal 500 Termine möglich.");
  const delimiter = lines[0].includes(";") ? ";" : ",";
  const headers = parseCsvLine(lines[0], delimiter).map((header) => header.toLowerCase().trim());
  const required = ["title", "starts_at", "ends_at"];
  if (!required.every((column) => headers.includes(column))) throw new Error("Erforderliche CSV-Spalten: title, starts_at, ends_at.");

  const rows = lines.slice(1).map((line, rowIndex) => {
    const values = parseCsvLine(line, delimiter);
    const value = (column: string) => values[headers.indexOf(column)]?.trim() ?? "";
    const startsAt = new Date(value("starts_at"));
    const endsAt = new Date(value("ends_at"));
    const type = value("type") || "training";
    if (!value("title") || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
      throw new Error(`Ungültige Daten in CSV-Zeile ${rowIndex + 2}.`);
    }
    if (!["training", "game", "meeting", "event"].includes(type)) throw new Error(`Ungültiger Typ in CSV-Zeile ${rowIndex + 2}.`);
    return {
      team_id: teamId,
      title: value("title"),
      type,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      location: value("location") || null,
      description: value("description") || null,
      created_by: user.id
    };
  });

  const { error } = await supabase.from("events").insert(rows);
  if (error) throw new Error(getUserFacingSupabaseError(error, "Die Termine konnten nicht importiert werden."));
  redirect(`/teams/${teamId}/events?toast=events-imported`);
}

export async function updateEventAction(teamId: string, eventId: string, formData: FormData) {
  const { supabase, user } = await requireTeamManager(teamId, `/teams/${teamId}/events/${eventId}`);
  const title = getString(formData, "title");
  const type = getString(formData, "type");
  const startsAt = getString(formData, "starts_at");
  const endsAt = getString(formData, "ends_at");

  if (!title || !type || !startsAt || !endsAt) {
    throw new Error("Bitte fülle alle Pflichtfelder für den Termin aus.");
  }

  if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
    throw new Error("Die Endzeit muss nach der Startzeit liegen.");
  }

  const { error } = await supabase
    .from("events")
    .update({
      title,
      type,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      location: getNullableString(formData, "location"),
      description: getNullableString(formData, "description"),
      response_deadline: getNullableString(formData, "response_deadline")
        ? new Date(getString(formData, "response_deadline")).toISOString()
        : null,
      max_participants: getNullableString(formData, "max_participants")
        ? Number.parseInt(getString(formData, "max_participants"), 10)
        : null,
      created_by: user.id
    })
    .eq("id", eventId)
    .eq("team_id", teamId);

  if (error) {
    throw new Error(getUserFacingSupabaseError(error, "Der Termin konnte nicht gespeichert werden."));
  }

  redirect(`/teams/${teamId}/events/${eventId}?toast=event-updated`);
}

export async function deleteEventAction(teamId: string, eventId: string) {
  const { supabase } = await requireTeamManager(teamId, `/teams/${teamId}/events/${eventId}`);
  const { error } = await supabase.from("events").delete().eq("id", eventId).eq("team_id", teamId);

  if (error) {
    throw new Error(getUserFacingSupabaseError(error, "Der Termin konnte nicht gelöscht werden."));
  }

  redirect(`/teams/${teamId}/events?toast=event-removed`);
}

export async function toggleEventCancellationAction(teamId: string, eventId: string, cancel: boolean) {
  const { supabase, user } = await requireTeamManager(teamId, `/teams/${teamId}/events/${eventId}`);
  const { data: event, error } = await supabase
    .from("events")
    .update({ is_cancelled: cancel })
    .eq("id", eventId)
    .eq("team_id", teamId)
    .select("title")
    .single();
  if (error) throw new Error(getUserFacingSupabaseError(error, "Der Terminstatus konnte nicht geändert werden."));

  const { data: members } = await supabase.from("team_members").select("user_id").eq("team_id", teamId).eq("status", "active");
  await createNotificationsForUsers(
    supabase,
    ((members as Array<{ user_id: string }> | null) ?? []).map((member) => member.user_id).filter((id) => id !== user.id),
    {
      team_id: teamId,
      event_id: eventId,
      type: cancel ? "event_cancelled" : "event_reactivated",
      title: cancel ? "Termin abgesagt" : "Termin findet wieder statt",
      body: `„${event.title}“ wurde ${cancel ? "abgesagt" : "reaktiviert"}.`,
      action_path: `/teams/${teamId}/events/${eventId}`
    }
  );
  redirect(`/teams/${teamId}/events/${eventId}?toast=${cancel ? "event-cancelled" : "event-reactivated"}`);
}

export async function respondToEventAction(teamId: string, eventId: string, formData: FormData) {
  const { supabase, profile, user } = await requireTeamAccess(teamId, `/teams/${teamId}/events/${eventId}`);
  const status = getString(formData, "status");

  if (!status) {
    throw new Error("Bitte wähle eine Antwort aus.");
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("response_deadline, max_participants, is_cancelled")
    .eq("id", eventId)
    .eq("team_id", teamId)
    .single();
  if (eventError) throw new Error(getUserFacingSupabaseError(eventError, "Der Termin konnte nicht geprüft werden."));
  if (event.is_cancelled) throw new Error("Dieser Termin wurde abgesagt.");
  if (event.response_deadline && new Date(event.response_deadline).getTime() < Date.now()) {
    throw new Error("Die Antwortfrist für diesen Termin ist abgelaufen.");
  }
  if (status === "yes" && event.max_participants) {
    const { count, error: countError } = await supabase
      .from("event_responses")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("status", "yes")
      .neq("user_id", user.id);
    if (countError) throw new Error(getUserFacingSupabaseError(countError, "Die freien Plätze konnten nicht geprüft werden."));
    if ((count ?? 0) >= event.max_participants) throw new Error("Für diesen Termin sind bereits alle Plätze vergeben.");
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
    throw new Error(getUserFacingSupabaseError(error, "Die Rückmeldung konnte nicht gespeichert werden."));
  }

  let managersResult = await supabase
    .from("team_members")
    .select("user_id, role")
    .eq("team_id", teamId)
    .eq("status", "active");

  if (isRecoverableSetupError(managersResult.error)) {
    managersResult = await supabase.from("team_members").select("user_id, role").eq("team_id", teamId);
  }

  if (managersResult.error) {
    throw new Error(getUserFacingSupabaseError(managersResult.error, "Die Teamleitung konnte nicht geladen werden."));
  }

  const managerIds = (((managersResult.data as Array<{ user_id: string; role: string }>) ?? [])
    .filter((member) => member.user_id !== user.id && (member.role === "owner" || member.role === "coach"))
    .map((member) => member.user_id));

  await createNotificationsForUsers(supabase, managerIds, {
    team_id: teamId,
    event_id: eventId,
    type: "response_submitted",
    title: "Neue Rückmeldung",
    body: `${profile.full_name ?? profile.email ?? "Mitglied"} hat auf einen Termin geantwortet.`,
    action_path: `/teams/${teamId}/events/${eventId}`
  });

  redirect(`/teams/${teamId}/events/${eventId}?toast=response-saved`);
}
