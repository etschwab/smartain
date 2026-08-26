"use server";

import { addWeeks } from "date-fns";
import { redirect } from "next/navigation";
import { requireTeamManager } from "@/lib/supabase-server";
import { getUserFacingSupabaseError } from "@/lib/supabase-errors";

function getString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function getNullableString(formData: FormData, name: string) {
  const value = getString(formData, name);
  return value.length > 0 ? value : null;
}

export async function createEventAction(teamId: string, formData: FormData) {
  const { supabase, user } = await requireTeamManager(teamId, `/teams/${teamId}/events/new`);
  const title = getString(formData, "title");
  const type = getString(formData, "type");
  const startsAt = getString(formData, "starts_at");
  const endsAt = getString(formData, "ends_at");

  if (!title || !type || !startsAt || !endsAt) throw new Error("Bitte fülle alle Pflichtfelder aus.");
  if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) throw new Error("Die Endzeit muss nach der Startzeit liegen.");

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
    created_by: user.id
  }));

  const { data: events, error } = await supabase.from("events").insert(payloads).select("id").order("starts_at", { ascending: true });
  if (error) throw new Error(getUserFacingSupabaseError(error, "Der Termin konnte nicht erstellt werden."));

  redirect(recurrenceCount > 1 ? `/teams/${teamId}/events?toast=events-created` : `/teams/${teamId}/events/${events?.[0]?.id}?toast=event-created`);
}

export async function updateEventAction(teamId: string, eventId: string, formData: FormData) {
  const { supabase, user } = await requireTeamManager(teamId, `/teams/${teamId}/events/${eventId}`);
  const title = getString(formData, "title");
  const type = getString(formData, "type");
  const startsAt = getString(formData, "starts_at");
  const endsAt = getString(formData, "ends_at");

  if (!title || !type || !startsAt || !endsAt) throw new Error("Bitte fülle alle Pflichtfelder aus.");
  if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) throw new Error("Die Endzeit muss nach der Startzeit liegen.");

  const { error } = await supabase.from("events").update({
    title,
    type,
    starts_at: new Date(startsAt).toISOString(),
    ends_at: new Date(endsAt).toISOString(),
    location: getNullableString(formData, "location"),
    description: getNullableString(formData, "description"),
    created_by: user.id
  }).eq("id", eventId).eq("team_id", teamId);

  if (error) throw new Error(getUserFacingSupabaseError(error, "Der Termin konnte nicht gespeichert werden."));
  redirect(`/teams/${teamId}/events/${eventId}?toast=event-updated`);
}

export async function deleteEventAction(teamId: string, eventId: string) {
  const { supabase } = await requireTeamManager(teamId, `/teams/${teamId}/events/${eventId}`);
  const { error } = await supabase.from("events").delete().eq("id", eventId).eq("team_id", teamId);
  if (error) throw new Error(getUserFacingSupabaseError(error, "Der Termin konnte nicht gelöscht werden."));
  redirect(`/teams/${teamId}/events?toast=event-removed`);
}

export async function toggleEventCancellationAction(teamId: string, eventId: string, cancel: boolean) {
  const { supabase } = await requireTeamManager(teamId, `/teams/${teamId}/events/${eventId}`);
  const { error } = await supabase.from("events").update({ is_cancelled: cancel }).eq("id", eventId).eq("team_id", teamId);
  if (error) throw new Error(getUserFacingSupabaseError(error, "Der Terminstatus konnte nicht geändert werden."));
  redirect(`/teams/${teamId}/events/${eventId}?toast=${cancel ? "event-cancelled" : "event-reactivated"}`);
}
