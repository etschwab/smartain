import { NextResponse } from "next/server";
import { getTeamById, listTeamEvents } from "@/lib/data";
import { getMembershipForUser, getOptionalUser } from "@/lib/supabase-server";

function icsEscape(value?: string | null) {
  return (value ?? "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function icsDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export async function GET(_: Request, context: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await context.params;
  const { supabase, user } = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const membership = await getMembershipForUser(supabase, teamId, user.id);
  if (!membership || membership.status !== "active") return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });

  const [team, events] = await Promise.all([getTeamById(supabase, teamId), listTeamEvents(supabase, teamId)]);
  if (!team) return NextResponse.json({ error: "Team nicht gefunden" }, { status: 404 });

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Smartrain//Teamkalender//DE",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${icsEscape(team.name)}`,
    ...events.flatMap((event) => [
      "BEGIN:VEVENT",
      `UID:${event.id}@smartrain`,
      `DTSTAMP:${icsDate(event.updated_at)}`,
      `DTSTART:${icsDate(event.starts_at)}`,
      `DTEND:${icsDate(event.ends_at)}`,
      `SUMMARY:${icsEscape(event.title)}`,
      `DESCRIPTION:${icsEscape(event.description)}`,
      `LOCATION:${icsEscape(event.location)}`,
      "END:VEVENT"
    ]),
    "END:VCALENDAR"
  ];

  const fileName = `${team.name.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "") || "team"}-kalender.ics`;
  return new NextResponse(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
