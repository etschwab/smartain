import Link from "next/link";
import { Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/submit-button";
import { StatsCard } from "@/components/stats-card";
import { updateProfileAction } from "@/lib/actions";
import { getDashboardData } from "@/lib/data";
import { requireProfile } from "@/lib/supabase-server";
import { formatDateLabel, getDisplayName, getRoleLabel, getTeamAccentColor } from "@/lib/utils";

export default async function ProfilePage() {
  const { supabase, user, profile } = await requireProfile("/profile");
  const dashboard = await getDashboardData(supabase, user.id);
  const primaryTeam = dashboard.teams[0] ?? null;

  return (
    <div className="page-stack">
      <Card className="relative overflow-hidden border-red-200/70 bg-[linear-gradient(135deg,hsl(var(--card)),hsl(var(--accent)/0.58))] p-8 dark:border-red-500/15">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/14 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 flex-none items-center justify-center rounded-[24px] bg-primary text-xl font-black text-primary-foreground shadow-[0_18px_42px_-24px_hsl(var(--primary)/0.8)]">
              {getDisplayName(profile.full_name, profile.email).slice(0, 2).toUpperCase()}
            </div>
            <div className="max-w-3xl">
              <p className="section-kicker">Profil</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                {getDisplayName(profile.full_name, profile.email)}
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Deine Kontaktdaten und Spielerinfos helfen Coaches, Eltern und Teamleitung im richtigen Moment schneller
                zu handeln.
              </p>
            </div>
          </div>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Zurück zum Dashboard</Link>
          </Button>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Teams" value={String(dashboard.teams.length)} description="aktive Mitgliedschaften" icon={<ShieldCheck className="h-5 w-5" />} />
        <StatsCard title="Zusagen" value={String(dashboard.pendingResponses.length)} description="offene Antworten" icon={<UserRound className="h-5 w-5" />} />
        <StatsCard title="Aufgaben" value={String(dashboard.assignedTasks.length)} description="persönliche To-dos" icon={<Phone className="h-5 w-5" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="p-6">
          <div>
            <p className="section-kicker">Kontaktdaten</p>
            <h2 className="mt-2 text-2xl font-semibold">Profil bearbeiten</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Diese Angaben bleiben in deinem Teamkontext sichtbar und machen Organisation, Rückfragen und Notfälle
              einfacher.
            </p>
          </div>
          <form action={updateProfileAction} className="mt-6 grid gap-4 sm:grid-cols-2">
            <Input name="full_name" placeholder="Vollständiger Name" defaultValue={profile.full_name ?? ""} />
            <Input name="phone" placeholder="Telefonnummer" defaultValue={profile.phone ?? ""} />
            <Input name="jersey_number" type="number" placeholder="Rückennummer" defaultValue={profile.jersey_number ?? ""} />
            <Input name="position" placeholder="Position" defaultValue={profile.position ?? ""} />
            <Input name="birthday" type="date" defaultValue={profile.birthday ?? ""} />
            <Input name="emergency_contact_name" placeholder="Notfallkontakt Name" defaultValue={profile.emergency_contact_name ?? ""} />
            <div className="sm:col-span-2">
              <Input
                name="emergency_contact_phone"
                placeholder="Notfallkontakt Telefonnummer"
                defaultValue={profile.emergency_contact_phone ?? ""}
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <SubmitButton pendingLabel="Profil wird gespeichert...">Profil speichern</SubmitButton>
            </div>
          </form>
        </Card>

        <div className="grid gap-6">
          <Card className="p-6">
            <p className="section-kicker">Account</p>
            <h2 className="mt-2 text-2xl font-semibold">Login und Sicherheit</h2>
            <div className="mt-5 space-y-3">
              <div className="rounded-[26px] border border-border bg-background/72 p-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">E-Mail</p>
                    <p className="font-semibold">{profile.email ?? user.email ?? "Keine E-Mail hinterlegt"}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[26px] border border-border bg-background/72 p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Account erstellt</p>
                    <p className="font-semibold">{formatDateLabel(profile.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <p className="section-kicker">Teamrolle</p>
            <h2 className="mt-2 text-2xl font-semibold">Aktueller Kontext</h2>
            {primaryTeam ? (
              <Link
                href={`/teams/${primaryTeam.id}`}
                className="mt-5 flex items-center justify-between rounded-[26px] border border-border bg-background/72 p-4 transition-colors hover:border-primary/30"
              >
                <span className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: getTeamAccentColor(primaryTeam.theme_color) }} />
                  <span>
                    <span className="block font-semibold">{primaryTeam.name}</span>
                    <span className="text-sm text-muted-foreground">{primaryTeam.sport} · Saison {primaryTeam.season}</span>
                  </span>
                </span>
                <Badge variant="outline">{getRoleLabel(primaryTeam.membership.role)}</Badge>
              </Link>
            ) : (
              <div className="mt-5 rounded-[26px] border border-dashed border-border bg-background/50 p-5 text-sm text-muted-foreground">
                Du bist noch in keinem Team. Erstelle ein Team oder öffne einen Einladungslink.
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
