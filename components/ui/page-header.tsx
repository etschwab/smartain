import type { ReactNode } from "react";

type PageHeaderProps = {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ kicker, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {kicker ? <p className="section-kicker">{kicker}</p> : null}
        <h1 className="mt-2 text-4xl font-semibold">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
    </div>
  );
}
