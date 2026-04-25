import type { EventType, ResponseStatus, TaskStatus, TeamRole } from "./types";

export const managerRoles: TeamRole[] = ["owner", "coach"];

export const teamRoleOptions: Array<{ value: TeamRole; label: string }> = [
  { value: "owner", label: "Owner" },
  { value: "coach", label: "Coach" },
  { value: "player", label: "Spieler" },
  { value: "parent", label: "Elternteil" }
];

export const eventTypeOptions: Array<{ value: EventType; label: string }> = [
  { value: "training", label: "Training" },
  { value: "game", label: "Spiel" },
  { value: "meeting", label: "Besprechung" },
  { value: "event", label: "Event" }
];

export const responseStatusOptions: Array<{ value: ResponseStatus; label: string }> = [
  { value: "yes", label: "Zusage" },
  { value: "no", label: "Absage" },
  { value: "maybe", label: "Vielleicht" }
];

export const taskStatusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: "open", label: "Offen" },
  { value: "done", label: "Erledigt" }
];

export const teamColorOptions = [
  "#3b82f6",
  "#2563eb",
  "#7c3aed",
  "#8b5cf6",
  "#06b6d4",
  "#14b8a6",
  "#22c55e",
  "#f97316",
  "#ef4444",
  "#111827"
];

export const toastMessages: Record<string, string> = {
  "team-created": "Team erstellt",
  "team-updated": "Team gespeichert",
  "profile-updated": "Profil aktualisiert",
  "invite-created": "Einladungslink erstellt",
  "invite-regenerated": "Einladungslink erneuert",
  "invite-updated": "Einladungslink aktualisiert",
  "joined-team": "Du bist dem Team beigetreten",
  "member-updated": "Mitgliedsrolle aktualisiert",
  "member-removed": "Mitglied entfernt",
  "event-created": "Termin erstellt",
  "response-saved": "Antwort gespeichert",
  "task-created": "Aufgabe erstellt",
  "task-updated": "Aufgabe aktualisiert",
  "task-removed": "Aufgabe entfernt",
  "notifications-read": "Benachrichtigungen aktualisiert",
  "database-setup-needed": "Supabase ist noch nicht vollstaendig eingerichtet"
};
