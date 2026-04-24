import { AppShell } from "@/components/app-shell";
import { createMatch } from "@/lib/actions";
import { requireUser } from "@/lib/supabase-server";

export default async function MatchesPage() {
  const { supabase } = await requireUser();
  const [{ data: matches, error: matchesError }, { data: teams, error: teamsError }] = await Promise.all([
    supabase.from("matches").select("id, team_id, opponent, starts_at, location, home_away").order("starts_at", { ascending: true }),
    supabase.from("teams").select("id, name").order("name", { ascending: true })
  ]);

  if (matchesError || teamsError) {
    throw new Error(matchesError?.message ?? teamsError?.message ?? "Spiele konnten nicht geladen werden.");
  }

  const teamNameById = new Map((teams ?? []).map((team) => [team.id, team.name]));

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Spiele</h1>
      <p className="mt-2 text-slate-600">Erstelle Spieltermine mit Gegner, Ort und Heim oder Auswaerts.</p>
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,28rem),minmax(0,1fr)]">
        <div className="card">
          <h2 className="text-xl font-semibold">Spiel erstellen</h2>
          <form action={createMatch} className="mt-5 space-y-4">
            <input className="input" name="opponent" placeholder="Gegner" required />
            <input className="input" name="starts_at" type="datetime-local" required />
            <input className="input" name="location" placeholder="Ort" />
            <select className="input" name="home_away" defaultValue="home">
              <option value="home">Heimspiel</option>
              <option value="away">Auswaertsspiel</option>
            </select>
            <select className="input" name="team_id" defaultValue="" required>
              <option value="" disabled>Team auswaehlen</option>
              {(teams ?? []).map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <button className="btn" type="submit" disabled={!teams || teams.length === 0}>Speichern</button>
          </form>
          {(!teams || teams.length === 0) && (
            <p className="mt-4 text-sm text-amber-700">Bitte zuerst ein Team anlegen.</p>
          )}
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold">Geplante Spiele</h2>
          {matches && matches.length > 0 ? (
            <div className="mt-5 space-y-3">
              {matches.map((match) => (
                <div key={match.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <p className="text-lg font-semibold text-slate-900">{match.opponent}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(match.starts_at).toLocaleString("de-CH", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {teamNameById.get(match.team_id) ?? "Kein Team"} · {match.home_away === "away" ? "Auswaerts" : "Heim"} · {match.location ?? "Ort folgt"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-slate-600">Noch keine Spiele vorhanden.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
