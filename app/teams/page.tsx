import { AppShell } from "@/components/app-shell";
import { createTeam } from "@/lib/actions";
import { requireUser } from "@/lib/supabase-server";

export default async function TeamsPage() {
  const { supabase } = await requireUser();
  const { data: teams, error } = await supabase
    .from("teams")
    .select("id, name, age_group, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Teams</h1>
      <p className="mt-2 text-slate-600">Erstelle Mannschaften wie U13, U15 oder 1. Team.</p>
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,28rem),minmax(0,1fr)]">
        <div className="card">
          <h2 className="text-xl font-semibold">Team erstellen</h2>
          <form action={createTeam} className="mt-5 space-y-4">
            <input className="input" name="name" placeholder="Teamname, z.B. U15" required />
            <input className="input" name="age_group" placeholder="Altersgruppe, z.B. Jahrgang 2011" />
            <button className="btn" type="submit">Speichern</button>
          </form>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold">Bestehende Teams</h2>
          {teams && teams.length > 0 ? (
            <div className="mt-5 space-y-3">
              {teams.map((team) => (
                <div key={team.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <p className="text-lg font-semibold text-slate-900">{team.name}</p>
                    <p className="text-sm text-slate-500">{team.age_group ?? "ohne Altersgruppe"}</p>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{team.id}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-slate-600">Noch keine Teams vorhanden.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
