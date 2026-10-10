"use client";

import { X } from "lucide-react";
import { SEVERITY_ORDER, checkIcon, ruleFor, severities } from "@/lib/catalog";
import { orderedRules, ruleSeverityMatrix } from "@/lib/report";
import type { Finding } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Panel } from "./panel";

/**
 * Findings per rule (finding code), the dashboard form of `ScanReport.by_rule`.
 * Rows follow the rule catalogue: secrets, injection, then poisoning.
 */
export function RulePanel({
  findings,
  active = "all",
  onSelect,
  limit,
  className,
}: {
  findings: Finding[];
  active?: string | "all";
  onSelect?: (rule: string | "all") => void;
  /** Show only the most frequent rules (the landing-page preview). */
  limit?: number;
  className?: string;
}) {
  const matrix = ruleSeverityMatrix(findings);
  const all = orderedRules(matrix.keys()).map((id) => {
    const counts = matrix.get(id)!;
    return { id, counts, total: SEVERITY_ORDER.reduce((n, s) => n + counts[s], 0) };
  });
  const keep = limit ? new Set([...all].sort((a, b) => b.total - a.total).slice(0, limit).map((r) => r.id)) : null;
  const rows = keep ? all.filter((r) => keep.has(r.id)) : all;
  const hidden = all.length - rows.length;
  const max = Math.max(1, ...all.map((r) => r.total));

  return (
    <Panel
      title="Findings by rule"
      description="Each rule is a finding code with its own severity, action and fix steps. Select one to filter."
      className={className}
      actions={
        active !== "all" && onSelect ? (
          <button
            type="button"
            onClick={() => onSelect("all")}
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border px-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3" aria-hidden="true" />
            Clear
          </button>
        ) : null
      }
      bodyClassName="pt-2"
    >
      {rows.length === 0 ? (
        <p className="px-2.5 py-6 text-center text-[13px] text-muted-foreground">No rule fired on this scan.</p>
      ) : (
        <ul className="space-y-0.5">
          {rows.map(({ id, counts, total }) => {
            const rule = ruleFor(id);
            const Icon = checkIcon(rule.check);
            const isActive = active === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  disabled={!onSelect}
                  onClick={() => onSelect?.(isActive ? "all" : id)}
                  aria-pressed={isActive}
                  className={cn(
                    "grid w-full grid-cols-[minmax(0,1fr)_3rem] items-center gap-x-4 gap-y-1.5 rounded-md px-2.5 py-2 text-left transition-colors enabled:hover:bg-accent/60 disabled:cursor-default",
                    isActive && "bg-accent",
                    active !== "all" && !isActive && "opacity-55",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2 text-[13px]">
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="truncate">{rule.title}</span>
                    <code className="hidden truncate font-mono text-[11px] text-muted-foreground @md:inline">{id}</code>
                  </span>
                  <span className="text-right font-mono text-[13px] tabular">{total}</span>
                  <span className="col-span-2 flex h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <span className="flex h-full" style={{ width: `${(total / max) * 100}%` }}>
                      {SEVERITY_ORDER.map((s) =>
                        counts[s] ? (
                          <span
                            key={s}
                            className={cn("h-full first:rounded-l-full last:rounded-r-full", severities[s].bar)}
                            style={{ width: `${(counts[s] / total) * 100}%` }}
                          />
                        ) : null,
                      )}
                    </span>
                  </span>
                  <span className="sr-only">
                    {SEVERITY_ORDER.filter((s) => counts[s]).map((s) => `${counts[s]} ${s}`).join(", ")}
                  </span>
                </button>
              </li>
            );
          })}
          {hidden > 0 && (
            <li className="px-2.5 pt-1.5 text-[12px] text-muted-foreground">
              + {hidden} more {hidden === 1 ? "rule" : "rules"}
            </li>
          )}
        </ul>
      )}
    </Panel>
  );
}
