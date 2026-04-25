import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { joinTeamAction } from "@/lib/actions";
import { getPublicInvite } from "@/lib/data";
import { getOptionalUser } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type JoinPageProps = {
  params: Promise<{
    inviteCode: string;
  }>;
};

export default async function JoinPage({ params }: JoinPageProps) {
  const { inviteCode } = await params;
  const { supabase, user } = await getOptionalUser();
  const invite = await getPublicInvite(supabase, inviteCode);

  if (!invite || !invite.is_active) {
    return (
      <main className="content-wrap py-16">
        <EmptyState
          title="Einladungslink nicht verfuegbar"
          description="Dieser Join-Link ist nicht mehr aktiv oder wurde bereits deaktiviert."
          action={
            <Button asChild>
              <Link href="/">Zur Startseite</Link>
            </Button>
          }
        />
      </main>
    );
  }

  if (user) {
    const { data: membership } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("team_id", invite.team_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membership) {
      redirect(`/teams/${invite.team_id}`);
    }
  }

  return (
    <main className="content-wrap py-16">
      <Card className="mx-auto max-w-2xl p-8">
        <p className="section-kicker">Teambeitritt</p>
        <h1 className="mt-3 text-4xl font-semibold">{invite.team_name}</h1>
        <p className="mt-3 text-muted-foreground">
          Du wurdest eingeladen, dem Team beizutreten. Nach dem Login oder Signup wird dein Beitritt direkt abgeschlossen.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Badge>{invite.team_sport}</Badge>
          <Badge variant="outline">Rolle nach Join: {invite.role}</Badge>
          <Badge variant={invite.is_active ? "success" : "muted"}>{invite.is_active ? "Aktiver Invite" : "Inaktiv"}</Badge>
        </div>

        {user ? (
          <form action={joinTeamAction.bind(null, invite.code)} className="mt-8">
            <Button type="submit" size="lg">
              Jetzt Team beitreten
            </Button>
          </form>
        ) : (
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={`/login?next=${encodeURIComponent(`/join/${invite.code}`)}`}>Login und beitreten</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={`/signup?next=${encodeURIComponent(`/join/${invite.code}`)}`}>Signup und beitreten</Link>
            </Button>
          </div>
        )}
      </Card>
    </main>
  );
}
