"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase-server";

function getString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function emptyToNull(value: string) {
  return value.length > 0 ? value : null;
}

function parseOptionalNumber(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function requireAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return supabase;
}

export async function createTeam(formData: FormData) {
  const supabase = await requireAuthenticatedClient();
  const { error } = await supabase.from("teams").insert({
    name: getString(formData, "name"),
    age_group: emptyToNull(getString(formData, "age_group"))
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/teams");
  revalidatePath("/players");
  revalidatePath("/trainings");
  revalidatePath("/matches");
  revalidatePath("/calendar");
}

export async function createPlayer(formData: FormData) {
  const supabase = await requireAuthenticatedClient();
  const { error } = await supabase.from("players").insert({
    first_name: getString(formData, "first_name"),
    last_name: getString(formData, "last_name"),
    position: emptyToNull(getString(formData, "position")),
    number: parseOptionalNumber(getString(formData, "number")),
    team_id: emptyToNull(getString(formData, "team_id"))
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/players");
}

export async function createTraining(formData: FormData) {
  const supabase = await requireAuthenticatedClient();
  const startsAt = getString(formData, "starts_at");
  const { error } = await supabase.from("trainings").insert({
    title: getString(formData, "title"),
    starts_at: new Date(startsAt).toISOString(),
    location: emptyToNull(getString(formData, "location")),
    team_id: getString(formData, "team_id")
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/trainings");
  revalidatePath("/calendar");
}

export async function createMatch(formData: FormData) {
  const supabase = await requireAuthenticatedClient();
  const startsAt = getString(formData, "starts_at");
  const { error } = await supabase.from("matches").insert({
    opponent: getString(formData, "opponent"),
    starts_at: new Date(startsAt).toISOString(),
    location: emptyToNull(getString(formData, "location")),
    home_away: getString(formData, "home_away") || "home",
    team_id: getString(formData, "team_id")
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/matches");
  revalidatePath("/calendar");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
