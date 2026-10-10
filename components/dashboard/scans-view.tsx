"use client";

import { ArrowLeft, ChevronRight, Download, FileUp, Lock, Plus } from "lucide-react";
import { RiskBadge } from "@/components/security/severity";
import { StoreGlyph } from "@/components/security/store-glyph";
import { Button } from "@/components/ui/button";
import { stores } from "@/lib/catalog";
import { flaggedCount, formatDuration, isComplete, riskLevel, sourceLabel } from "@/lib/report";
import type { Finding, Scan } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { PageHeading } from "./panel";
import { ReportBody } from "./report-body";

function StatusDot({ scan }: { scan: Scan }) {
  const complete = isComplete(scan);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={complete ? "size-1.5 rounded-full bg-safe" : "size-1.5 rounded-full bg-sev-medium"} aria-hidden="true" />
      {complete ? "Complete" : "Incomplete"}
    </span>
  );
}

export function ScansList({
  scans,
  onOpen,
  onNewScan,
  onImport,
}: {
  scans: Scan[];
  onOpen: (id: string) => void;
  onNewScan: () => void;
  onImport: () => void;
}) {
  return (
    <div className="space-y-5">
      <PageHeading
        title="Scans"
        description="Each scan is a read-only pass over one memory source. Reports stay in this browser."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={onImport}>
              <FileUp />
              Open report
            </Button>
            <Button size="sm" onClick={onNewScan}>
              <Plus />
              New scan
            </Button>
          </>
        }
      />
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="scrollbar-thin relative overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b text-[11.5px] text-muted-foreground">
                <th scope="col" className="py-2.5 pl-4 pr-3 font-medium">Scan</th>
                <th scope="col" className="py-2.5 pr-3 font-medium">Source</th>
                <th scope="col" className="py-2.5 pr-3 text-right font-medium">Records</th>
                <th scope="col" className="py-2.5 pr-3 text-right font-medium">Flagged</th>
                <th scope="col" className="py-2.5 pr-3 font-medium">Worst</th>
                <th scope="col" className="py-2.5 pr-3 font-medium">Status</th>
                <th scope="col" className="py-2.5 pr-3 font-medium">Completed</th>
                <th scope="col" className="w-10 py-2.5 pr-4"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => (
                <tr
                  key={scan.id}
                  tabIndex={0}
                  onClick={() => onOpen(scan.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onOpen(scan.id);
                    }
                  }}
                  aria-label={`Open scan ${scan.name}, ${scan.completedLong}`}
                  className="group cursor-pointer border-b transition-colors last:border-0 hover:bg-accent/45 focus-visible:bg-accent/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <td className="py-3 pl-4 pr-3">
                    <div className="flex items-center gap-2 text-[13.5px] font-medium">
                      <span className="max-w-[220px] truncate">{scan.name}</span>
                      {scan.origin === "imported" && (
                        <span className="rounded-[3px] border border-info/30 bg-info/10 px-1 font-mono text-[10px] font-normal text-info">
                          imported
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11.5px] text-muted-foreground">{scan.id}</div>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="inline-flex max-w-[260px] items-center gap-2 font-mono text-[12px]">
                      <StoreGlyph store={scan.store} size="sm" />
                      <span className="truncate">{sourceLabel(scan)}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right font-mono text-[12.5px] tabular">{formatNumber(scan.records)}</td>
                  <td className="py-3 pr-3 text-right font-mono text-[12.5px] tabular">{formatNumber(flaggedCount(scan.findings))}</td>
                  <td className="py-3 pr-3">
                    <RiskBadge risk={riskLevel(scan.findings)} />
                  </td>
                  <td className="py-3 pr-3 text-[12.5px]">
                    <StatusDot scan={scan} />
                  </td>
                  <td className="py-3 pr-3 text-[12.5px] text-muted-foreground">{scan.completed}</td>
                  <td className="py-3 pr-4 text-right">
                    <ChevronRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[12.5px] text-muted-foreground">
        Demo history. With the CLI, each run writes its own report: pass <code className="font-mono">--json findings.json</code>{" "}
        and open the file here with Open report. It is read in this browser and never uploaded.
      </p>
    </div>
  );
}

export function ScanDetail({
  scan,
  reviewed,
  loading,
  onBack,
  onSelect,
  onExport,
  onNewScan,
}: {
  scan: Scan;
  reviewed: Set<string>;
  loading: boolean;
  onBack: () => void;
  onSelect: (f: Finding) => void;
  onExport: () => void;
  onNewScan: () => void;
}) {
  const store = scan.store ? stores[scan.store] : null;
  const meta = [
    { label: "Source", value: store ? store.name : "Unknown source" },
    { label: store ? store.noun[0].toUpperCase() + store.noun.slice(1) : "Label", value: store ? scan.resource : sourceLabel(scan), mono: true },
    {
      label: "Mode",
      value: (
        <span className="inline-flex items-center gap-1.5">
          <Lock className="size-3.5 text-muted-foreground" aria-hidden="true" />
          Read-only
        </span>
      ),
    },
    { label: "Records", value: formatNumber(scan.records), mono: true },
    { label: "Duration", value: formatDuration(scan.durationSeconds), mono: true },
    { label: "Status", value: <StatusDot scan={scan} /> },
  ];

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        All scans
      </button>

      <PageHeading
        title={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {scan.name}
            <RiskBadge risk={riskLevel(scan.findings)} />
          </span>
        }
        description={
          <span className="font-mono text-[12px]">
            {scan.id} · {scan.origin === "imported" ? `scanned ${scan.completedLong}` : `completed ${scan.completedLong}`} · mimvo{" "}
            {scan.mimvoVersion} · schema {scan.schemaVersion}
          </span>
        }
        actions={
          <Button variant="secondary" size="sm" onClick={onExport}>
            <Download />
            Export report
          </Button>
        }
      />

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border @md:grid-cols-3 @4xl:grid-cols-6">
        {meta.map((m) => (
          <div key={m.label} className="bg-card px-4 py-3">
            <dt className="text-[11.5px] text-muted-foreground">{m.label}</dt>
            <dd className={m.mono ? "mt-1 truncate font-mono text-[13px]" : "mt-1 text-[13px]"}>{m.value}</dd>
          </div>
        ))}
      </dl>

      <ReportBody scan={scan} reviewed={reviewed} onSelect={onSelect} onNewScan={onNewScan} loading={loading} />
    </div>
  );
}
