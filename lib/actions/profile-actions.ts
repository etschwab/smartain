"use server";

import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase-server";
import { isRecoverableSetupError } from "@/lib/supabase-errors";

function getString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function getNullableString(formData: FormData, name: string) {
  const value = getString(formData, name);
  return value.length > 0 ? value : null;
}

function getNullableNumber(formData: FormData, name: string) {
  const value = getString(formData, name);

  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function updateProfileAction(formData: FormData) {
  const { supabase, user } = await requireProfile("/dashboard");
  const fullName = getNullableString(formData, "full_name");

  const payloads = [
    {
      full_name: fullName,
      phone: getNullableString(formData, "phone"),
      jersey_number: getNullableNumber(formData, "jersey_number"),
      position: getNullableString(formData, "position"),
      birthday: getNullableString(formData, "birthday"),
      emergency_contact_name: getNullableString(formData, "emergency_contact_name"),
      emergency_contact_phone: getNullableString(formData, "emergency_contact_phone"),
      email: user.email ?? null
    },
    {
      full_name: fullName,
      email: user.email ?? null
    },
    {
      full_name: fullName
    }
  ] as const;

  for (const payload of payloads) {
    const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);

    if (!error) {
      redirect("/dashboard?toast=profile-updated");
    }

    if (!isRecoverableSetupError(error)) {
      throw new Error(error.message);
    }
  }

  redirect("/dashboard?toast=profile-updated");
}

export async function markNotificationsReadAction() {
  const { supabase, user } = await requireProfile("/dashboard");
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);

  if (isRecoverableSetupError(error)) {
    redirect("/dashboard");
  }

  if (error) {
    throw new Error(error.message);
  }

  redirect("/dashboard?toast=notifications-read");
}
