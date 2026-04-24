import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/supabase-server";

type CalendarEvent = {
  id: string;
  title: string;
  starts_at: string;
  location: string | null;
  type: "Training" | "Spiel";
};

export default async function CalendarPage() {
  const { supabase } = await requireUser();
  const [{ data: trainings, error: trainingsError }, { data: matches, error: matchesError }] = await Promise.all([
    supabase.from("trainings").select("id, title, starts_at, location"),
    supabase.from("matches").select("id, opponent, starts_at, location")
  ]);

  if (trainingsError || matchesError) {
    throw new Error(trainingsError?.message ?? matchesError?.message ?? "Kalender konnte nicht geladen werden.");
  }

  const events: CalendarEvent[] = [
    ...(trainings ?? []).map((training) => ({
      id: training.id,
      title: training.title,
      starts_at: training.starts_at,
      location: training.location,
      type: "Training" as const
    })),
    ...(matches ?? []).map((match) => ({
      id: match.id,
      title: match.opponent,
      starts_at: match.starts_at,
      location: match.location,
      type: "Spiel" as const
    }))
  ].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Kalender</h1>
      <p className="mt-2 text-slate-600">Alle Trainings und Spiele in einer einfachen Terminliste.</p>
      <div className="card mt-8">
        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={`${event.type}-${event.id}`} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-brand-600">{event.type}</p>
                    <p className="text-lg font-semibold text-slate-900">{event.title}</p>
                  </div>
                  <p className="text-sm text-slate-500">
                    {new Date(event.starts_at).toLocaleString("de-CH", {
                      dateStyle: "full",
                      timeStyle: "short"
                    })}
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{event.location ?? "Ort folgt"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">Noch keine Termine vorhanden.</p>
        )}
      </div>
    </AppShell>
  );
}
