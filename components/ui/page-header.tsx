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
        <h1 className="mt-3 text-5xl font-semibold leading-[0.92] tracking-[-0.055em] sm:text-6xl">{title}</h1>
        {description ? <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
    </div>
  );
}
