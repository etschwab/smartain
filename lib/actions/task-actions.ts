"use server";

import { redirect } from "next/navigation";
import { requireProfile, requireTeamAccess, requireTeamManager } from "@/lib/supabase-server";

function getString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function getNullableString(formData: FormData, name: string) {
  const value = getString(formData, name);
  return value.length > 0 ? value : null;
}

export async function createTaskAction(teamId: string, formData: FormData) {
  const { supabase, user } = await requireTeamManager(teamId, `/teams/${teamId}/tasks`);

  const title = getString(formData, "title");
  if (!title) {
    throw new Error("Bitte gib einen Titel fuer die Aufgabe ein.");
  }

  const assignedTo = getNullableString(formData, "assigned_to");

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      team_id: teamId,
      event_id: getNullableString(formData, "event_id"),
      title,
      description: getNullableString(formData, "description"),
      assigned_to: assignedTo,
      created_by: user.id,
      due_at: getNullableString(formData, "due_at")
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (assignedTo) {
    const { error: notificationError } = await supabase.from("notifications").insert({
      user_id: assignedTo,
      team_id: teamId,
      task_id: task.id,
      type: "task_created",
      title: "Neue Aufgabe",
      body: `Dir wurde "${task.title}" zugewiesen.`,
      action_path: `/teams/${teamId}/tasks`
    });

    if (notificationError) {
      throw new Error(notificationError.message);
    }
  }

  redirect(`/teams/${teamId}/tasks?toast=task-created`);
}

export async function updateTaskStatusAction(teamId: string, taskId: string, formData: FormData) {
  const { supabase, user, membership } = await requireTeamAccess(teamId, `/teams/${teamId}/tasks`);
  const nextStatus = getString(formData, "status");
  const { data: task, error: taskError } = await supabase.from("tasks").select("*").eq("id", taskId).single();

  if (taskError) {
    throw new Error(taskError.message);
  }

  if (!(membership.role === "owner" || membership.role === "coach" || task.assigned_to === user.id)) {
    throw new Error("Du darfst diesen Aufgabenstatus nicht aendern.");
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      status: nextStatus,
      completed_at: nextStatus === "done" ? new Date().toISOString() : null
    })
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/teams/${teamId}/tasks?toast=task-updated`);
}

export async function deleteTaskAction(teamId: string, taskId: string) {
  const { supabase } = await requireTeamManager(teamId, `/teams/${teamId}/tasks`);
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/teams/${teamId}/tasks?toast=task-removed`);
}
