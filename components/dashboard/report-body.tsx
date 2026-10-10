"use client";

import { useEffect, useRef, useState } from "react";
import { CircleAlert, CircleCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EMPTY_FILTERS } from "@/lib/report";
import type { Finding, FindingFilters, Scan, Severity } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { ActionPlanPanel } from "./action-plan-panel";
import { FindingsTable } from "./findings-table";
import { KpiStrip } from "./kpi-strip";
import { PosturePanel } from "./posture-panel";
import { RulePanel } from "./rule-panel";

export function ReportBody({
  scan,
  reviewed,
  onSelect,
  onNewScan,
  loading = false,
}: {
  scan: Scan;
  reviewed: Set<string>;
  onSelect: (f: Finding) => void;
  onNewScan: () => void;
  loading?: boolean;
}) {
  const [filters, setFilters] = useState<FindingFilters>(EMPTY_FILTERS);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => setFilters(EMPTY_FILTERS), [scan.id]);

  const revealTable = () => {
    const el = tableRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top > window.innerHeight - 180) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }
  };

  const onSeverity = (s: Severity) => {
    setFilters((f) => ({ ...f, severity: f.severity === s ? "all" : s }));
    revealTable();
  };
  const onRule = (r: string | "all") => {
    setFilters((f) => ({ ...f, rule: r }));
    if (r !== "all") revealTable();
  };
  const onRecord = (record: string) => {
    setFilters({ ...EMPTY_FILTERS, query: record });
    revealTable();
  };

  if (loading) return <ReportSkeleton />;

  const checkCount = Object.keys(scan.checks).length;

  return (
    <div className="space-y-4">
      <KpiStrip scan={scan} />
      {scan.errors.length > 0 && <IncompleteNotice scan={scan} />}

      {scan.findings.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border bg-card px-6 py-16 text-center">
          <span className="grid size-11 place-items-center rounded-lg border border-safe/30 bg-safe/10 text-safe">
            <CircleCheck className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-[15px] font-semibold">No findings in this scan</h2>
          <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
            {formatNumber(scan.records)} records went through {checkCount} {checkCount === 1 ? "check" : "checks"} with no
            finding. Nothing to review, quarantine, or delete. Re-scan after the agent writes new memories.
          </p>
          <Button variant="secondary" size="sm" className="mt-5" onClick={onNewScan}>
            <Plus />
            New scan
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-2 @6xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <PosturePanel scan={scan} activeSeverity={filters.severity} onSeverity={onSeverity} />
            <RulePanel findings={scan.findings} active={filters.rule} onSelect={onRule} />
          </div>
          <ActionPlanPanel findings={scan.findings} onRecord={onRecord} />
          <div ref={tableRef} className="scroll-mt-20">
            <FindingsTable
              findings={scan.findings}
              filters={filters}
              onFiltersChange={setFilters}
              onSelect={onSelect}
              reviewed={reviewed}
              title="Findings"
            />
          </div>
        </>
      )}
    </div>
  );
}

/** A check or detector failed. mimvo marks the report incomplete and never turns a failure into a finding. */
function IncompleteNotice({ scan }: { scan: Scan }) {
  return (
    <div role="status" className="rounded-lg border border-sev-medium/35 bg-sev-medium/[0.07] px-4 py-3.5">
      <div className="flex items-start gap-3">
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-sev-medium" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium">
            Scan incomplete: {formatNumber(scan.recordsWithErrors)} {scan.recordsWithErrors === 1 ? "record" : "records"} not
            fully checked
          </p>
          <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
            A failed detector is never a finding and adds nothing to the action plan. A record with no finding may not have
            been fully checked. The CLI exits 2 on an incomplete scan unless you pass --allow-incomplete.
          </p>
          <ul className="mt-2.5 space-y-1 font-mono text-[12px]">
            {scan.errors.slice(0, 5).map((e, i) => (
              <li key={i} className="break-words">
                {e.check}
                {e.detector ? `/${e.detector}` : ""} raised <span className="text-sev-medium">{e.errorType}</span> on{" "}
                {formatNumber(e.records)} {e.records === 1 ? "record" : "records"}
                {e.message && <span className="text-muted-foreground"> · {e.message}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading report">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border @lg:grid-cols-2 @4xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 bg-card px-5 py-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-2">
        <div className="flex items-center gap-6 rounded-lg border bg-card p-5">
          <Skeleton className="size-[176px] shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6" />
            ))}
          </div>
        </div>
        <div className="space-y-3 rounded-lg border bg-card p-5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-6" />
          ))}
        </div>
      </div>
      <div className="space-y-2 rounded-lg border bg-card p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9" />
        ))}
      </div>
    </div>
  );
}
