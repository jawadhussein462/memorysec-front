import type { ReactNode } from "react";
import { CircleCheck, Lock } from "lucide-react";
import { SeverityMeter } from "@/components/security/severity";
import { InfoTip } from "@/components/ui/tooltip";
import { riskTone, severities } from "@/lib/catalog";
import { flaggedCount, flaggedPct, formatDuration, riskLevel, severityCounts, topSeverity } from "@/lib/report";
import type { Scan } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

function Kpi({ label, value, context, tip }: { label: string; value: ReactNode; context: ReactNode; tip?: string }) {
  return (
    <div className="min-w-0 bg-card px-5 py-4">
      <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
        {label}
        {tip && <InfoTip label={`About ${label.toLowerCase()}`}>{tip}</InfoTip>}
      </div>
      <div className="type-display mt-2.5 text-[28px] font-semibold leading-none tabular">{value}</div>
      <div className="mt-2.5 truncate text-[12.5px] text-muted-foreground">{context}</div>
    </div>
  );
}

export function KpiStrip({ scan }: { scan: Scan }) {
  const counts = severityCounts(scan.findings);
  const flagged = flaggedCount(scan.findings);
  const pct = flaggedPct(scan);
  const risk = riskLevel(scan.findings);
  const tone = riskTone[risk];
  const top = topSeverity(scan.findings);
  const findings = scan.findings.length;

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border @lg:grid-cols-2 @4xl:grid-cols-4">
      <Kpi
        label="Records scanned"
        value={formatNumber(scan.records)}
        context={
          <span className="inline-flex items-center gap-1.5">
            <Lock className="size-3" aria-hidden="true" />
            Read-only · {formatDuration(scan.durationSeconds)}
            {scan.sample !== null && ` · sample of ${formatNumber(scan.sample)}`}
          </span>
        }
      />
      <Kpi
        label="Records flagged"
        value={formatNumber(flagged)}
        context={
          findings
            ? `${formatNumber(findings)} finding${findings === 1 ? "" : "s"} · ${counts.critical} critical · ${counts.high} high`
            : "Nothing to review"
        }
        tip="Distinct records with at least one finding (ScanReport.flagged). A record with two problems counts once."
      />
      <Kpi
        label="Flag rate"
        value={`${pct.toFixed(2)}%`}
        context={`${formatNumber(Math.max(0, scan.records - flagged))} records with no finding`}
        tip="Flagged records as a share of records read (ScanReport.flagged_pct)."
      />
      <Kpi
        label="Worst severity"
        value={
          <span className={cn("inline-flex items-center gap-2.5", tone.text)}>
            {tone.severity ? (
              <SeverityMeter severity={tone.severity} className="h-4 gap-[3px] [&>span]:w-1" />
            ) : (
              <CircleCheck className="size-6" aria-hidden="true" />
            )}
            {risk}
          </span>
        }
        context={
          top
            ? `${counts[top]} ${severities[top].label.toLowerCase()} finding${counts[top] === 1 ? "" : "s"}`
            : scan.errors.length
              ? "No findings, but the scan is incomplete"
              : `All ${Object.keys(scan.checks).length} checks passed`
        }
        tip="The most serious severity among the findings (ScanReport.worst_severity()). Use it with --fail-on to gate CI."
      />
    </div>
  );
}
