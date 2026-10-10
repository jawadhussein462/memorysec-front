"use client";

import { CircleAlert, Clock, Lock, ScanSearch } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";
import { SeverityMeter } from "@/components/security/severity";
import { SEVERITY_ORDER, severities } from "@/lib/catalog";
import { useMounted } from "@/lib/hooks";
import { detectorCount, isComplete, severityCounts } from "@/lib/report";
import type { Scan, Severity } from "@/lib/types";
import { cn, formatPercent } from "@/lib/utils";
import { Panel } from "./panel";

const SIZE = 176;

export function PosturePanel({
  scan,
  activeSeverity = "all",
  onSeverity,
  animate = true,
  className,
}: {
  scan: Scan;
  activeSeverity?: Severity | "all";
  onSeverity?: (s: Severity) => void;
  animate?: boolean;
  className?: string;
}) {
  const mounted = useMounted();
  const counts = severityCounts(scan.findings);
  const total = scan.findings.length;
  const data = SEVERITY_ORDER.filter((s) => counts[s] > 0).map((s) => ({ name: s, value: counts[s] }));
  // Info only appears when a scan produced it, to keep the common case to four rows.
  const levels = SEVERITY_ORDER.filter((s) => s !== "info" || counts.info > 0);
  const checkCount = Object.keys(scan.checks).length;

  return (
    <Panel
      title="Findings by severity"
      description="Severity comes from the rule, lowered one step below 0.6 confidence. Select a level to filter."
      className={cn("@container", className)}
    >
      <div className="flex flex-col items-center gap-6 @md:flex-row">
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          {mounted && total > 0 ? (
            <PieChart width={SIZE} height={SIZE}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={84}
                paddingAngle={1.6}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={animate}
                animationDuration={650}
              >
                {data.map((d) => (
                  <Cell
                    key={d.name}
                    fill={severities[d.name].fill}
                    fillOpacity={activeSeverity === "all" || activeSeverity === d.name ? 1 : 0.22}
                  />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={73}
                fill="none"
                strokeWidth={22}
                className={total === 0 ? "stroke-safe/70" : "stroke-muted"}
              />
            </svg>
          )}
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="type-display text-[34px] font-semibold leading-none tabular">{total}</div>
              <div className="mt-1.5 text-xs text-muted-foreground">{total === 1 ? "finding" : "findings"}</div>
            </div>
          </div>
        </div>

        <ul className="w-full min-w-0 flex-1 space-y-0.5" aria-label="Findings by severity">
          {levels.map((s) => {
            const active = activeSeverity === s;
            return (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => onSeverity?.(s)}
                  disabled={!onSeverity || counts[s] === 0}
                  aria-pressed={active}
                  className={cn(
                    "grid w-full grid-cols-[minmax(0,1fr)_auto_3.5rem] items-center gap-x-3 gap-y-1.5 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors enabled:hover:bg-accent/60 disabled:cursor-default",
                    active && "bg-accent",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <SeverityMeter severity={s} />
                    {severities[s].label}
                  </span>
                  <span className="font-mono tabular">{counts[s]}</span>
                  <span className="text-right font-mono text-xs tabular text-muted-foreground">
                    {formatPercent(counts[s], total, 0)}
                  </span>
                  <span className="col-span-3 h-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className={cn("block h-full rounded-full", severities[s].bar)}
                      style={{ width: total ? `${(counts[s] / total) * 100}%` : "0%" }}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-4 text-[12.5px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ScanSearch className="size-3.5" aria-hidden="true" />
          <span className="text-foreground">
            {checkCount} {checkCount === 1 ? "check" : "checks"} · {detectorCount(scan)} detectors
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" aria-hidden="true" />
          Scanned {scan.completedLong}
        </span>
        {isComplete(scan) ? (
          <span className="inline-flex items-center gap-1.5">
            <Lock className="size-3.5" aria-hidden="true" />
            Read-only
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sev-medium">
            <CircleAlert className="size-3.5" aria-hidden="true" />
            Incomplete
          </span>
        )}
      </div>
    </Panel>
  );
}
