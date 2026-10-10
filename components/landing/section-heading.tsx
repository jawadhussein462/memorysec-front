import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function SectionHeading({
  title,
  children,
  className,
  id,
  eyebrow,
}: {
  title: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
  eyebrow?: string;
}) {
  return (
    <Reveal className={cn("grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end lg:gap-16", className)}>
      <div>
        {eyebrow && (
          <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>
        )}
        <h2 id={id} className="type-display max-w-[17ch] text-[2rem] font-semibold leading-[1.05] sm:text-[2.6rem] lg:text-[2.85rem]">
          {title}
        </h2>
      </div>
      {children && <div className="max-w-xl text-[16px] leading-[1.65] text-muted-foreground lg:pb-1.5">{children}</div>}
    </Reveal>
  );
}
