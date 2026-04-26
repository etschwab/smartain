import { clsx, type ClassValue } from "clsx";
import { format, isToday, isTomorrow } from "date-fns";
import { de } from "date-fns/locale";
import { twMerge } from "tailwind-merge";
import {
  eventTypeLabels,
  memberStatusLabels,
  responseStatusLabels,
  taskStatusLabels,
  teamRoleLabels
} from "./constants";
import type { EventType, MemberStatus, ResponseStatus, TaskStatus, TeamRole } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateLabel(value: string | Date, pattern = "dd. MMM yyyy") {
  return format(new Date(value), pattern, { locale: de });
}

export function formatTimeLabel(value: string | Date) {
  return format(new Date(value), "HH:mm", { locale: de });
}

export function formatDateTimeLabel(value: string | Date) {
  const date = new Date(value);

  if (isToday(date)) {
    return `Heute, ${format(date, "HH:mm", { locale: de })}`;
  }

  if (isTomorrow(date)) {
    return `Morgen, ${format(date, "HH:mm", { locale: de })}`;
  }

  return format(date, "dd. MMM yyyy, HH:mm", { locale: de });
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function buildJoinPath(inviteCode: string) {
  return `/join/${inviteCode}`;
}

export function getDisplayName(name?: string | null, fallback?: string | null) {
  if (name && name.trim().length > 0) {
    return name;
  }

  if (fallback && fallback.trim().length > 0) {
    return fallback;
  }

  return "Unbekannt";
}

export function isFutureDate(value: string | Date) {
  return new Date(value).getTime() > Date.now();
}

export function getRoleLabel(role: TeamRole) {
  return teamRoleLabels[role] ?? role;
}

export function getMemberStatusLabel(status: MemberStatus) {
  return memberStatusLabels[status] ?? status;
}

export function getEventTypeLabel(type: EventType) {
  return eventTypeLabels[type] ?? type;
}

export function getResponseStatusLabel(status: ResponseStatus) {
  return responseStatusLabels[status] ?? status;
}

export function getTaskStatusLabel(status: TaskStatus) {
  return taskStatusLabels[status] ?? status;
}

export function toDateTimeLocalValue(value?: string | null) {
  if (!value) {
    return "";
  }

  return format(new Date(value), "yyyy-MM-dd'T'HH:mm");
}
