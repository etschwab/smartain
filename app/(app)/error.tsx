"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-2xl p-8 text-center">
      <p className="section-kicker">Fehler</p>
      <h2 className="mt-3 text-3xl font-semibold">Etwas ist schiefgelaufen.</h2>
      <p className="mt-3 text-muted-foreground">
        Bitte versuche die Aktion erneut. Wenn das Problem bleibt, pruefe zuerst das aktuelle Supabase-Schema.
      </p>
      <div className="mt-6 flex justify-center">
        <Button onClick={() => reset()}>Erneut versuchen</Button>
      </div>
    </Card>
  );
}
