import { AppShell } from "@/components/app-shell";
import { createPlayer } from "@/lib/actions";
import { requireUser } from "@/lib/supabase-server";

export default async function PlayersPage() {
  const { supabase } = await requireUser();
  const [{ data: players, error: playersError }, { data: teams, error: teamsError }] = await Promise.all([
    supabase.from("players").select("id, team_id, first_name, last_name, position, number, created_at").order("created_at", { ascending: false }),
    supabase.from("teams").select("id, name").order("name", { ascending: true })
  ]);

  if (playersError || teamsError) {
    throw new Error(playersError?.message ?? teamsError?.message ?? "Spieler konnten nicht geladen werden.");
  }

  const teamNameById = new Map((teams ?? []).map((team) => [team.id, team.name]));

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Spieler</h1>
      <p className="mt-2 text-slate-600">Fuege Spieler zu deinem Kader hinzu.</p>
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,28rem),minmax(0,1fr)]">
        <div className="card">
          <h2 className="text-xl font-semibold">Spieler hinzufuegen</h2>
          <form action={createPlayer} className="mt-5 space-y-4">
            <input className="input" name="first_name" placeholder="Vorname" required />
            <input className="input" name="last_name" placeholder="Nachname" required />
            <input className="input" name="position" placeholder="Position" />
            <input className="input" name="number" placeholder="Rueckennummer" type="number" min="1" />
            <select className="input" name="team_id" defaultValue="">
              <option value="">Noch keinem Team zuweisen</option>
              {(teams ?? []).map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <button className="btn" type="submit">Speichern</button>
          </form>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold">Spielerliste</h2>
          {players && players.length > 0 ? (
            <div className="mt-5 space-y-3">
              {players.map((player) => (
                <div key={player.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <p className="text-lg font-semibold text-slate-900">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="text-sm text-slate-500">{player.number ? `#${player.number}` : "ohne Nummer"}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {player.position ?? "Position folgt"} · {player.team_id ? teamNameById.get(player.team_id) ?? "Unbekanntes Team" : "Kein Team"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-slate-600">Noch keine Spieler vorhanden.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
