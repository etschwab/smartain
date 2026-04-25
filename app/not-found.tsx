import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="content-wrap flex min-h-screen items-center justify-center py-20">
      <Card className="w-full max-w-xl p-10 text-center">
        <p className="section-kicker">404</p>
        <h1 className="mt-3 text-4xl font-semibold">Diese Seite wurde nicht gefunden.</h1>
        <p className="mt-4 text-muted-foreground">
          Vielleicht wurde der Link verschoben oder der Invite ist nicht mehr aktiv.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link href="/">Zur Startseite</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Zum Dashboard</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
