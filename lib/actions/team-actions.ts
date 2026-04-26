"use server";

import { redirect } from "next/navigation";
import { requireProfile, requireTeamAccess, requireTeamManager } from "@/lib/supabase-server";
import { managerRoles } from "@/lib/constants";
import { isRecoverableSetupError } from "@/lib/supabase-errors";

function getString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function getNullableString(formData: FormData, name: string) {
  const value = getString(formData, name);
  return value.length > 0 ? value : null;
}

async function createTeamInviteInternal(
  supabase: Awaited<ReturnType<typeof requireProfile>>["supabase"],
  teamId: string,
  createdBy: string,
  role: string,
  expiresAt: string | null
) {
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("name, sport")
    .eq("id", teamId)
    .single();

  if (teamError) {
    throw new Error(teamError.message);
  }

  const { data: invite, error } = await supabase
    .from("team_invites")
    .insert({
      team_id: teamId,
      team_name: team.name,
      team_sport: team.sport,
      role,
      created_by: createdBy,
      expires_at: expiresAt
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return invite;
}

async function assertNotLastOwner(
  supabase: Awaited<ReturnType<typeof requireProfile>>["supabase"],
  teamId: string,
  memberId: string
) {
  const { data: member, error: memberError } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", memberId)
    .single();

  if (memberError) {
    throw new Error(memberError.message);
  }

  if (member.role !== "owner") {
    return member;
  }

  const { count, error: ownersError } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId)
    .eq("role", "owner")
    .eq("status", "active");

  if (ownersError) {
    throw new Error(ownersError.message);
  }

  if ((count ?? 0) <= 1) {
    throw new Error("Mindestens ein Owner muss im Team verbleiben.");
  }

  return member;
}

export async function createTeamAction(formData: FormData) {
  const { supabase, user } = await requireProfile("/teams/new");

  const name = getString(formData, "name");
  const sport = getString(formData, "sport");
  const season = getString(formData, "season");
  const themeColor = getString(formData, "theme_color") || "#4f46e5";

  if (!name || !sport || !season) {
    throw new Error("Bitte fuelle Name, Sportart und Saison aus.");
  }

  let teamResult = await supabase
    .from("teams")
    .insert({
      name,
      sport,
      season,
      theme_color: themeColor,
      logo_url: getNullableString(formData, "logo_url"),
      created_by: user.id
    })
    .select("*")
    .single();

  if (isRecoverableSetupError(teamResult.error)) {
    teamResult = await supabase
      .from("teams")
      .insert({
        name,
        age_group: season || sport
      })
      .select("*")
      .single();
  }

  if (teamResult.error) {
    throw new Error(teamResult.error.message);
  }

  const team = teamResult.data;

  let membershipResult = await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: user.id,
    role: "owner",
    status: "active"
  });

  if (isRecoverableSetupError(membershipResult.error)) {
    membershipResult = await supabase.from("team_members").insert({
      team_id: team.id,
      user_id: user.id,
      role: "owner"
    });
  }

  if (membershipResult.error) {
    throw new Error(membershipResult.error.message);
  }

  try {
    await createTeamInviteInternal(supabase, team.id, user.id, "player", null);
  } catch (error) {
    if (!isRecoverableSetupError(error instanceof Error ? error : String(error))) {
      throw error;
    }
  }

  redirect(`/teams/${team.id}?toast=team-created`);
}

export async function updateTeamSettingsAction(teamId: string, formData: FormData) {
  const { supabase } = await requireTeamManager(teamId, `/teams/${teamId}/settings`);

  const payload = {
    name: getString(formData, "name"),
    sport: getString(formData, "sport"),
    season: getString(formData, "season"),
    theme_color: getString(formData, "theme_color") || "#4f46e5",
    logo_url: getNullableString(formData, "logo_url")
  };

  if (!payload.name || !payload.sport || !payload.season) {
    throw new Error("Bitte fuelle Name, Sportart und Saison aus.");
  }

  const { error } = await supabase.from("teams").update(payload).eq("id", teamId);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/teams/${teamId}/settings?toast=team-updated`);
}

export async function createInviteAction(teamId: string, formData: FormData) {
  const { supabase, user } = await requireTeamManager(teamId, `/teams/${teamId}/settings`);
  await createTeamInviteInternal(
    supabase,
    teamId,
    user.id,
    getString(formData, "role") || "player",
    getNullableString(formData, "expires_at")
  );

  redirect(`/teams/${teamId}/settings?toast=invite-created`);
}

export async function regenerateInviteAction(teamId: string, inviteId: string) {
  const { supabase, user } = await requireTeamManager(teamId, `/teams/${teamId}/settings`);
  const { data: invite, error } = await supabase.from("team_invites").select("*").eq("id", inviteId).single();

  if (error) {
    throw new Error(error.message);
  }

  const { error: disableError } = await supabase.from("team_invites").update({ is_active: false }).eq("id", inviteId);

  if (disableError) {
    throw new Error(disableError.message);
  }

  await createTeamInviteInternal(supabase, teamId, user.id, invite.role, invite.expires_at);
  redirect(`/teams/${teamId}/settings?toast=invite-regenerated`);
}

export async function toggleInviteAction(teamId: string, inviteId: string, nextActive: boolean) {
  const { supabase } = await requireTeamManager(teamId, `/teams/${teamId}/settings`);
  const { error } = await supabase.from("team_invites").update({ is_active: nextActive }).eq("id", inviteId);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/teams/${teamId}/settings?toast=invite-updated`);
}

export async function joinTeamAction(inviteCode: string) {
  const { supabase } = await requireProfile(`/join/${inviteCode}`);
  const { data, error } = await supabase.rpc("join_team_with_invite", {
    invite_code: inviteCode
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/teams/${data}?toast=joined-team`);
}

export async function updateMemberRoleAction(teamId: string, memberId: string, formData: FormData) {
  const { supabase } = await requireTeamManager(teamId, `/teams/${teamId}/members`);
  const role = getString(formData, "role");

  if (!role) {
    throw new Error("Bitte waehle eine Rolle.");
  }

  const member = await assertNotLastOwner(supabase, teamId, memberId);

  if (!managerRoles.includes(member.role) && role === "owner") {
    const { count, error: ownerCountError } = await supabase
      .from("team_members")
      .select("*", { count: "exact", head: true })
      .eq("team_id", teamId)
      .eq("role", "owner")
      .eq("status", "active");

    if (ownerCountError) {
      throw new Error(ownerCountError.message);
    }

    if ((count ?? 0) >= 3) {
      throw new Error("Bitte halte den Owner-Kreis klein und vergebe stattdessen Coach.");
    }
  }

  const { error } = await supabase.from("team_members").update({ role }).eq("id", memberId);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/teams/${teamId}/members?toast=member-updated`);
}

export async function removeMemberAction(teamId: string, memberId: string) {
  const { supabase } = await requireTeamManager(teamId, `/teams/${teamId}/members`);
  await assertNotLastOwner(supabase, teamId, memberId);

  const { error } = await supabase.from("team_members").delete().eq("id", memberId);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/teams/${teamId}/members?toast=member-removed`);
}
