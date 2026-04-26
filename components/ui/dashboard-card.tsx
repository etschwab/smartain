import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type DashboardCardProps = {
  title: string;
  value: string;
  description: string;
  icon?: ReactNode;
};

export function DashboardCard({ title, value, description, icon }: DashboardCardProps) {
  return (
    <Card className="overflow-hidden p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-3 text-3xl font-semibold">{value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        {icon ? <div className="rounded-2xl border border-primary/10 bg-primary/10 p-3 text-primary">{icon}</div> : null}
      </div>
    </Card>
  );
}
