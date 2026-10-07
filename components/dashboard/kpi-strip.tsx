import type { ReactNode } from "react";
import { CircleCheck, Lock } from "lucide-react";
import { SeverityMeter } from "@/components/security/severity";
import { InfoTip } from "@/components/ui/tooltip";
import { riskTone, severities } from "@/lib/catalog";
import { riskLevel, severityCounts, topSeverity } from "@/lib/report";
import type { Scan } from "@/lib/types";
import { cn, formatNumber, formatPercent } from "@/lib/utils";

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
  const flagged = scan.findings.length;
  const risk = riskLevel(scan.findings, scan.records);
  const tone = riskTone[risk];
  const top = topSeverity(scan.findings);

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border @lg:grid-cols-2 @4xl:grid-cols-4">
      <Kpi
        label="Records scanned"
        value={formatNumber(scan.records)}
        context={
          <span className="inline-flex items-center gap-1.5">
            <Lock className="size-3" aria-hidden="true" />
            Read-only · {scan.duration}
          </span>
        }
      />
      <Kpi
        label="Records flagged"
        value={formatNumber(flagged)}
        context={flagged ? `${counts.critical} critical · ${counts.high} high · ${counts.medium + counts.low} other` : "Nothing to review"}
      />
      <Kpi
        label="Flag rate"
        value={formatPercent(flagged, scan.records)}
        context={`${formatPercent(scan.records - flagged, scan.records)} of records clean`}
        tip="Share of scanned records with at least one finding."
      />
      <Kpi
        label="Overall risk"
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
            ? `Driven by ${counts[top]} ${severities[top].label.toLowerCase()} finding${counts[top] === 1 ? "" : "s"}`
            : `All ${scan.scanners.length} scanners passed`
        }
        tip="The most severe finding level present, adjusted for how much of the store is affected."
      />
    </div>
  );
}
