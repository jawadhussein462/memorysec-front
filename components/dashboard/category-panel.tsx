"use client";

import { X } from "lucide-react";
import { CATEGORY_ORDER, SEVERITY_ORDER, categories, severities } from "@/lib/catalog";
import { categorySeverityMatrix } from "@/lib/report";
import type { CategoryId, Finding } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Panel } from "./panel";

export function CategoryPanel({
  findings,
  scanners,
  active = "all",
  onSelect,
  className,
}: {
  findings: Finding[];
  scanners: CategoryId[];
  active?: CategoryId | "all";
  onSelect?: (c: CategoryId | "all") => void;
  className?: string;
}) {
  const matrix = categorySeverityMatrix(findings);
  const rows = CATEGORY_ORDER.map((id) => ({
    id,
    total: SEVERITY_ORDER.reduce((n, s) => n + matrix[id][s], 0),
    enabled: scanners.includes(id),
  })).sort((a, b) => Number(b.enabled) - Number(a.enabled) || b.total - a.total);
  const max = Math.max(1, ...rows.map((r) => r.total));

  return (
    <Panel
      title="Findings by category"
      description="Seven memory risk classes. Select one to filter the findings table."
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
      <ul className="space-y-0.5">
        {rows.map(({ id, total, enabled }) => {
          const meta = categories[id];
          const Icon = meta.icon;
          const isActive = active === id;
          return (
            <li key={id}>
              <button
                type="button"
                disabled={!onSelect || !enabled || total === 0}
                onClick={() => onSelect?.(isActive ? "all" : id)}
                aria-pressed={isActive}
                className={cn(
                  "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 rounded-md px-2.5 py-2 text-left transition-colors enabled:hover:bg-accent/60 disabled:cursor-default",
                  isActive && "bg-accent",
                  active !== "all" && !isActive && "opacity-55",
                )}
              >
                <span className="flex min-w-0 items-center gap-2 text-[13px]">
                  <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate">{meta.label}</span>
                </span>
                <span className="font-mono text-[13px] tabular">
                  {enabled ? total : <span className="text-xs text-muted-foreground">not run</span>}
                </span>
                <span className="col-span-2 flex h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <span className="flex h-full" style={{ width: `${(total / max) * 100}%` }}>
                    {SEVERITY_ORDER.map((s) =>
                      matrix[id][s] ? (
                        <span
                          key={s}
                          className={cn("h-full first:rounded-l-full last:rounded-r-full", severities[s].bar)}
                          style={{ width: `${(matrix[id][s] / total) * 100}%` }}
                        />
                      ) : null,
                    )}
                  </span>
                </span>
                <span className="sr-only">
                  {SEVERITY_ORDER.filter((s) => matrix[id][s]).map((s) => `${matrix[id][s]} ${s}`).join(", ")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
