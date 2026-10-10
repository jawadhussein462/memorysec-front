"use client";

import { ACTION_ORDER, actions } from "@/lib/catalog";
import { actionPlan } from "@/lib/report";
import type { Action, Finding } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";
import { Panel } from "./panel";

const ACCENT: Record<Action, string> = {
  delete: "before:bg-sev-critical",
  quarantine: "before:bg-sev-high",
  review: "before:bg-info",
};

const SHOWN = 6;

/**
 * The triage plan the HTML report opens with (`ScanReport.action_plan()`):
 * every flagged record once, under the strongest action any of its findings needs.
 */
export function ActionPlanPanel({
  findings,
  onRecord,
  className,
}: {
  findings: Finding[];
  onRecord?: (record: string) => void;
  className?: string;
}) {
  const plan = actionPlan(findings);

  return (
    <Panel
      title="What to do"
      description="Each flagged record is listed once, under the strongest action its findings call for. Mimvo never applies them."
      className={className}
    >
      <ul className="grid grid-cols-1 gap-3 @3xl:grid-cols-3">
        {ACTION_ORDER.map((a) => {
          const meta = actions[a];
          const Icon = meta.icon;
          const ids = plan[a];
          return (
            <li
              key={a}
              className={cn(
                "relative overflow-hidden rounded-lg border bg-background/40 px-4 pb-4 pt-5 before:absolute before:inset-x-0 before:top-0 before:h-[3px]",
                ACCENT[a],
              )}
            >
              <div className="flex items-center gap-2 text-[13px] font-medium">
                <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                {meta.label}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="type-display text-[28px] font-semibold leading-none tabular">{formatNumber(ids.length)}</span>
                <span className="text-[12.5px] text-muted-foreground">{ids.length === 1 ? "record" : "records"}</span>
              </div>
              <p className="mt-2 text-[12.5px] leading-snug text-muted-foreground">{meta.meaning}</p>
              {ids.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`Records to ${a}`}>
                  {ids.slice(0, SHOWN).map((id) => (
                    <li key={id}>
                      <button
                        type="button"
                        disabled={!onRecord}
                        onClick={() => onRecord?.(id)}
                        className="rounded-[4px] border bg-card px-1.5 py-0.5 font-mono text-[11px] transition-colors enabled:hover:border-foreground/30 disabled:cursor-default"
                      >
                        {id}
                      </button>
                    </li>
                  ))}
                  {ids.length > SHOWN && (
                    <li className="px-1 py-0.5 font-mono text-[11px] text-muted-foreground">+{formatNumber(ids.length - SHOWN)}</li>
                  )}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
