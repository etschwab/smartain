import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/submit-button";
import { createTeamAction } from "@/lib/actions";
import { teamColorOptions } from "@/lib/constants";
import { requireProfile } from "@/lib/supabase-server";

export default async function NewTeamPage() {
  await requireProfile("/teams/new");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="section-kicker">Neues Team</p>
        <h1 className="mt-2 text-4xl font-semibold">Lege einen neuen Teamraum an.</h1>
        <p className="mt-3 text-muted-foreground">Name, Sportart, Saison und Grundfarbe bilden die Basis fuer euren gemeinsamen Teambereich.</p>
      </div>

      <Card className="p-8">
        <form action={createTeamAction} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input name="name" placeholder="Teamname, z. B. U17 Frauen" required />
            <Input name="sport" placeholder="Sportart, z. B. Fussball" required />
            <Input name="season" placeholder="Saison, z. B. 2026/27" required />
            <Input name="logo_url" placeholder="Optional: Logo-URL" />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-semibold">Teamfarbe</label>
            <div className="flex flex-wrap gap-3">
              {teamColorOptions.map((color) => (
                <label key={color} className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm">
                  <input type="radio" name="theme_color" value={color} defaultChecked={color === teamColorOptions[0]} />
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
                  {color}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button asChild variant="secondary">
              <Link href="/teams">Abbrechen</Link>
            </Button>
            <SubmitButton pendingLabel="Team wird erstellt...">Team erstellen</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
