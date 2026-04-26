import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type StatsCardProps = {
  title: string;
  value: string;
  description: string;
  icon?: ReactNode;
};

export function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <Card className="overflow-hidden p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold">{value}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {icon ? <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">{icon}</div> : null}
      </div>
    </Card>
  );
}
