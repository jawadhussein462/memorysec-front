import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("flex min-w-0 flex-col rounded-lg border bg-card", className)}>
      <header className="flex items-start justify-between gap-4 px-5 pt-4">
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold leading-tight">{title}</h2>
          {description && <p className="mt-1 text-[12.5px] leading-snug text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </header>
      <div className={cn("flex-1 px-5 pb-5 pt-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function PageHeading({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 @2xl:flex-row @2xl:items-end @2xl:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="type-display text-[22px] font-semibold leading-tight">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
