"use server";

import { redirect } from "next/navigation";
import { getUserFacingSupabaseError } from "@/lib/supabase-errors";
import { requireTeamAccess, requireTeamManager } from "@/lib/supabase-server";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optional(formData: FormData, key: string) {
  return text(formData, key) || null;
}

function finish(teamId: string, toast: string, section: string) {
  redirect(`/teams/${teamId}/organize?toast=${toast}#${section}`);
}

type TeamSupabase = Awaited<ReturnType<typeof requireTeamAccess>>["supabase"];

async function notifyTeam(
  supabase: TeamSupabase,
  teamId: string,
  actorId: string,
  payload: { type: string; title: string; body: string; actionPath: string }
) {
  const { data: members } = await supabase.from("team_members").select("user_id").eq("team_id", teamId).eq("status", "active");
  const rows = ((members as Array<{ user_id: string }> | null) ?? [])
    .filter((member) => member.user_id !== actorId)
    .map((member) => ({
      user_id: member.user_id,
      team_id: teamId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      action_path: payload.actionPath
    }));
  if (rows.length) await supabase.from("notifications").insert(rows);
}

export async function createTeamUpdateAction(teamId: string, kind: "news" | "message", formData: FormData) {
  const context = kind === "news"
    ? await requireTeamManager(teamId, `/teams/${teamId}/organize`)
    : await requireTeamAccess(teamId, `/teams/${teamId}/organize`);
  const body = text(formData, "body");
  const title = kind === "news" ? text(formData, "title") : null;

  if (!body || (kind === "news" && !title)) throw new Error("Bitte fülle Titel und Inhalt vollständig aus.");
  if (body.length > 4000 || (title?.length ?? 0) > 140) throw new Error("Der Beitrag ist zu lang.");

  const { error } = await context.supabase.from("team_updates").insert({
    team_id: teamId,
    author_id: context.user.id,
    kind,
    title,
    body,
    is_pinned: kind === "news" && formData.get("is_pinned") === "on"
  });
  if (error) throw new Error(getUserFacingSupabaseError(error, "Der Beitrag konnte nicht gespeichert werden."));
  if (kind === "news") {
    await notifyTeam(context.supabase, teamId, context.user.id, {
      type: "team_news",
      title: title ?? "Neue Team-News",
      body: body.slice(0, 180),
      actionPath: `/teams/${teamId}/organize#news`
    });
  }
  finish(teamId, kind === "news" ? "news-created" : "message-sent", kind === "news" ? "news" : "chat");
}

export async function deleteTeamUpdateAction(teamId: string, updateId: string, section: string) {
  const { supabase, user, membership } = await requireTeamAccess(teamId, `/teams/${teamId}/organize`);
  const { data } = await supabase.from("team_updates").select("author_id").eq("id", updateId).eq("team_id", teamId).maybeSingle();
  if (!data || (data.author_id !== user.id && !["owner", "coach"].includes(membership.role))) {
    throw new Error("Du darfst diesen Beitrag nicht löschen.");
  }
  const { error } = await supabase.from("team_updates").delete().eq("id", updateId).eq("team_id", teamId);
  if (error) throw new Error(getUserFacingSupabaseError(error, "Der Beitrag konnte nicht gelöscht werden."));
  finish(teamId, "entry-removed", section);
}

export async function createPollAction(teamId: string, formData: FormData) {
  const { supabase, user } = await requireTeamManager(teamId, `/teams/${teamId}/organize`);
  const question = text(formData, "question");
  const options = text(formData, "options").split(/[,\n]/).map((value) => value.trim()).filter(Boolean);
  if (!question || options.length < 2) throw new Error("Eine Abstimmung braucht eine Frage und mindestens zwei Optionen.");

  const { data: poll, error } = await supabase.from("polls").insert({
    team_id: teamId,
    question,
    description: optional(formData, "description"),
    closes_at: optional(formData, "closes_at") ? new Date(text(formData, "closes_at")).toISOString() : null,
    created_by: user.id
  }).select("id").single();
  if (error) throw new Error(getUserFacingSupabaseError(error, "Die Abstimmung konnte nicht erstellt werden."));

  const { error: optionsError } = await supabase.from("poll_options").insert(
    options.slice(0, 10).map((label, position) => ({ poll_id: poll.id, label, position }))
  );
  if (optionsError) {
    await supabase.from("polls").delete().eq("id", poll.id);
    throw new Error(getUserFacingSupabaseError(optionsError, "Die Antwortmöglichkeiten konnten nicht gespeichert werden."));
  }
  await notifyTeam(supabase, teamId, user.id, {
    type: "poll_created",
    title: "Neue Abstimmung",
    body: question,
    actionPath: `/teams/${teamId}/organize#polls`
  });
  finish(teamId, "poll-created", "polls");
}

export async function votePollAction(teamId: string, pollId: string, formData: FormData) {
  const { supabase, user } = await requireTeamAccess(teamId, `/teams/${teamId}/organize`);
  const optionId = text(formData, "option_id");
  if (!optionId) throw new Error("Bitte wähle eine Antwort aus.");
  const { data: option } = await supabase.from("poll_options").select("id, poll_id").eq("id", optionId).eq("poll_id", pollId).maybeSingle();
  if (!option) throw new Error("Diese Antwortmöglichkeit existiert nicht mehr.");
  const { error } = await supabase.from("poll_votes").upsert(
    { poll_id: pollId, option_id: optionId, user_id: user.id },
    { onConflict: "poll_id,user_id" }
  );
  if (error) throw new Error(getUserFacingSupabaseError(error, "Deine Stimme konnte nicht gespeichert werden."));
  finish(teamId, "vote-saved", "polls");
}

export async function createAbsenceAction(teamId: string, formData: FormData) {
  const { supabase, user } = await requireTeamAccess(teamId, `/teams/${teamId}/organize`);
  const startsOn = text(formData, "starts_on");
  const endsOn = text(formData, "ends_on");
  if (!startsOn || !endsOn || endsOn < startsOn) throw new Error("Bitte gib einen gültigen Abwesenheitszeitraum an.");
  const { error } = await supabase.from("absences").insert({
    team_id: teamId,
    user_id: user.id,
    starts_on: startsOn,
    ends_on: endsOn,
    reason: text(formData, "reason") || "other",
    note: optional(formData, "note")
  });
  if (error) throw new Error(getUserFacingSupabaseError(error, "Die Abwesenheit konnte nicht gespeichert werden."));
  finish(teamId, "absence-created", "absences");
}

export async function deleteAbsenceAction(teamId: string, absenceId: string) {
  const { supabase } = await requireTeamAccess(teamId, `/teams/${teamId}/organize`);
  const { error } = await supabase.from("absences").delete().eq("id", absenceId).eq("team_id", teamId);
  if (error) throw new Error(getUserFacingSupabaseError(error, "Die Abwesenheit konnte nicht gelöscht werden."));
  finish(teamId, "absence-removed", "absences");
}

export async function createCarpoolAction(teamId: string, formData: FormData) {
  const { supabase, user } = await requireTeamAccess(teamId, `/teams/${teamId}/organize`);
  const seats = Number.parseInt(text(formData, "seats"), 10);
  const meetingPoint = text(formData, "meeting_point");
  if (!meetingPoint || !Number.isInteger(seats) || seats < 1 || seats > 20) throw new Error("Bitte gib Treffpunkt und eine gültige Anzahl Plätze an.");
  const departure = optional(formData, "departure_at");
  const { error } = await supabase.from("carpools").insert({
    team_id: teamId,
    event_id: optional(formData, "event_id"),
    driver_id: user.id,
    seats,
    meeting_point: meetingPoint,
    departure_at: departure ? new Date(departure).toISOString() : null,
    note: optional(formData, "note")
  });
  if (error) throw new Error(getUserFacingSupabaseError(error, "Die Fahrgemeinschaft konnte nicht erstellt werden."));
  finish(teamId, "carpool-created", "carpools");
}

export async function toggleCarpoolRideAction(teamId: string, carpoolId: string) {
  const { supabase, user } = await requireTeamAccess(teamId, `/teams/${teamId}/organize`);
  const { data: existing } = await supabase.from("carpool_riders").select("id").eq("carpool_id", carpoolId).eq("user_id", user.id).maybeSingle();
  if (existing) {
    const { error } = await supabase.from("carpool_riders").delete().eq("id", existing.id);
    if (error) throw new Error(getUserFacingSupabaseError(error, "Der Platz konnte nicht freigegeben werden."));
    finish(teamId, "carpool-left", "carpools");
  }
  const { data: carpool } = await supabase.from("carpools").select("seats, carpool_riders(count)").eq("id", carpoolId).eq("team_id", teamId).single();
  const occupied = Array.isArray(carpool?.carpool_riders) ? Number(carpool.carpool_riders[0]?.count ?? 0) : 0;
  if (!carpool || occupied >= carpool.seats) throw new Error("In dieser Fahrgemeinschaft ist kein Platz mehr frei.");
  const { error } = await supabase.from("carpool_riders").insert({ carpool_id: carpoolId, user_id: user.id });
  if (error) throw new Error(getUserFacingSupabaseError(error, "Der Platz konnte nicht reserviert werden."));
  finish(teamId, "carpool-joined", "carpools");
}

export async function createLedgerEntryAction(teamId: string, formData: FormData) {
  const { supabase, user } = await requireTeamManager(teamId, `/teams/${teamId}/organize`);
  const amount = Number.parseFloat(text(formData, "amount").replace(",", "."));
  const title = text(formData, "title");
  if (!title || !Number.isFinite(amount) || amount <= 0) throw new Error("Bitte gib einen Titel und einen positiven Betrag an.");
  const { error } = await supabase.from("ledger_entries").insert({
    team_id: teamId,
    member_id: optional(formData, "member_id"),
    created_by: user.id,
    kind: text(formData, "kind"),
    title,
    note: optional(formData, "note"),
    amount_cents: Math.round(amount * 100),
    due_on: optional(formData, "due_on")
  });
  if (error) throw new Error(getUserFacingSupabaseError(error, "Der Kasseneintrag konnte nicht erstellt werden."));
  finish(teamId, "ledger-created", "cash");
}

export async function toggleLedgerStatusAction(teamId: string, entryId: string, nextStatus: "open" | "paid") {
  const { supabase } = await requireTeamManager(teamId, `/teams/${teamId}/organize`);
  const { error } = await supabase.from("ledger_entries").update({
    status: nextStatus,
    paid_at: nextStatus === "paid" ? new Date().toISOString() : null
  }).eq("id", entryId).eq("team_id", teamId);
  if (error) throw new Error(getUserFacingSupabaseError(error, "Der Kassenstatus konnte nicht aktualisiert werden."));
  finish(teamId, "ledger-updated", "cash");
}

export async function setLineupEntryAction(teamId: string, eventId: string, formData: FormData) {
  const { supabase, user } = await requireTeamManager(teamId, `/teams/${teamId}/events/${eventId}`);
  const userId = text(formData, "user_id");
  if (!userId) throw new Error("Bitte wähle ein Teammitglied aus.");
  const { error } = await supabase.from("event_lineup").upsert({
    team_id: teamId,
    event_id: eventId,
    user_id: userId,
    position_label: optional(formData, "position_label"),
    is_starter: text(formData, "squad") !== "bench",
    note: optional(formData, "note"),
    created_by: user.id
  }, { onConflict: "event_id,user_id" });
  if (error) throw new Error(getUserFacingSupabaseError(error, "Die Aufstellung konnte nicht gespeichert werden."));
  redirect(`/teams/${teamId}/events/${eventId}?toast=lineup-saved#lineup`);
}

export async function removeLineupEntryAction(teamId: string, eventId: string, entryId: string) {
  const { supabase } = await requireTeamManager(teamId, `/teams/${teamId}/events/${eventId}`);
  const { error } = await supabase.from("event_lineup").delete().eq("id", entryId).eq("event_id", eventId).eq("team_id", teamId);
  if (error) throw new Error(getUserFacingSupabaseError(error, "Der Eintrag konnte nicht entfernt werden."));
  redirect(`/teams/${teamId}/events/${eventId}?toast=lineup-updated#lineup`);
}
