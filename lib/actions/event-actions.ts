"use server";

import { addMinutes, addWeeks } from "date-fns";
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

  if (getString(formData, "save_as_template") === "yes") {
    const templateName = getString(formData, "template_name") || title;
    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60_000);
    const { error: templateError } = await supabase.from("event_templates").upsert({
      team_id: teamId,
      name: templateName,
      title,
      type,
      source_starts_at: startDate.toISOString(),
      duration_minutes: durationMinutes,
      location: getNullableString(formData, "location"),
      description: getNullableString(formData, "description"),
      created_by: user.id
    }, { onConflict: "team_id,name" });

    if (templateError) {
      throw new Error(getUserFacingSupabaseError(templateError, "Die Vorlage konnte nicht gespeichert werden."));
    }
  }

  redirect(recurrenceCount > 1 ? `/teams/${teamId}/events?toast=events-created` : `/teams/${teamId}/events/${events?.[0]?.id}?toast=event-created`);
}

export async function createEventFromTemplateAction(teamId: string, templateId: string) {
  const { supabase, user } = await requireTeamManager(teamId, `/teams/${teamId}/events`);
  const { data: template, error: templateError } = await supabase
    .from("event_templates")
    .select("*")
    .eq("id", templateId)
    .eq("team_id", teamId)
    .single();

  if (templateError || !template) {
    throw new Error(getUserFacingSupabaseError(templateError, "Die Vorlage wurde nicht gefunden."));
  }

  let startsAt = new Date(template.source_starts_at);
  while (startsAt.getTime() <= Date.now()) startsAt = addWeeks(startsAt, 1);

  for (let attempt = 0; attempt < 104; attempt += 1) {
    const { data: existing, error: existingError } = await supabase
      .from("events")
      .select("id")
      .eq("team_id", teamId)
      .eq("starts_at", startsAt.toISOString())
      .maybeSingle();

    if (existingError) {
      throw new Error(getUserFacingSupabaseError(existingError, "Der nächste freie Termin konnte nicht geprüft werden."));
    }

    if (!existing) break;
    startsAt = addWeeks(startsAt, 1);
  }

  const endsAt = addMinutes(startsAt, template.duration_minutes);
  const { data: event, error } = await supabase.from("events").insert({
    team_id: teamId,
    title: template.title,
    type: template.type,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    location: template.location,
    description: template.description,
    created_by: user.id
  }).select("id").single();

  if (error || !event) {
    throw new Error(getUserFacingSupabaseError(error, "Der Termin konnte nicht aus der Vorlage erstellt werden."));
  }

  redirect(`/teams/${teamId}/events/${event.id}?toast=event-from-template-created`);
}

export async function deleteEventTemplateAction(teamId: string, templateId: string) {
  const { supabase } = await requireTeamManager(teamId, `/teams/${teamId}/events`);
  const { error } = await supabase.from("event_templates").delete().eq("id", templateId).eq("team_id", teamId);
  if (error) throw new Error(getUserFacingSupabaseError(error, "Die Vorlage konnte nicht gelöscht werden."));
  redirect(`/teams/${teamId}/events?toast=event-template-deleted`);
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
