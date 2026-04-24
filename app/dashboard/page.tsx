import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { requireUser } from "@/lib/supabase-server";

type EventItem = {
  id: string;
  title: string;
  starts_at: string;
  location: string | null;
  kind: "Training" | "Spiel";
};

export default async function DashboardPage() {
  const { supabase } = await requireUser();

  const [
    { count: teamsCount, error: teamsError },
    { count: playersCount, error: playersError },
    { count: trainingsCount, error: trainingsError },
    { count: matchesCount, error: matchesError },
    { data: trainings, error: trainingsListError },
    { data: matches, error: matchesListError }
  ] = await Promise.all([
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("players").select("*", { count: "exact", head: true }),
    supabase.from("trainings").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("trainings").select("id, title, starts_at, location").order("starts_at", { ascending: true }).limit(3),
    supabase.from("matches").select("id, opponent, starts_at, location").order("starts_at", { ascending: true }).limit(3)
  ]);

  const errors = [teamsError, playersError, trainingsError, matchesError, trainingsListError, matchesListError].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors[0]?.message ?? "Dashboard-Daten konnten nicht geladen werden.");
  }

  const nextEvents: EventItem[] = [
    ...(trainings ?? []).map((training) => ({
      id: training.id,
      title: training.title,
      starts_at: training.starts_at,
      location: training.location,
      kind: "Training" as const
    })),
    ...(matches ?? []).map((match) => ({
      id: match.id,
      title: match.opponent,
      starts_at: match.starts_at,
      location: match.location,
      kind: "Spiel" as const
    }))
  ]
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, 4);

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-slate-600">Ueberblick ueber deinen Verein und die naechsten Termine.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        <StatCard title="Teams" value={String(teamsCount ?? 0)} note="aktive Mannschaften" />
        <StatCard title="Spieler" value={String(playersCount ?? 0)} note="Kader verwalten" />
        <StatCard title="Trainings" value={String(trainingsCount ?? 0)} note="naechste Einheiten" />
        <StatCard title="Spiele" value={String(matchesCount ?? 0)} note="kommende Matches" />
      </div>
      <div className="card mt-8">
        <h2 className="text-xl font-semibold">Naechste Termine</h2>
        {nextEvents.length === 0 ? (
          <p className="mt-4 text-slate-600">Noch keine Trainings oder Spiele vorhanden.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {nextEvents.map((event) => (
              <div key={`${event.kind}-${event.id}`} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-brand-600">{event.kind}</p>
                    <p className="text-lg font-semibold text-slate-900">{event.title}</p>
                  </div>
                  <p className="text-sm text-slate-500">
                    {new Date(event.starts_at).toLocaleString("de-CH", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{event.location ?? "Ort folgt"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
