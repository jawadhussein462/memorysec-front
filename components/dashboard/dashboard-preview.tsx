"use client";

import { initialScans } from "@/lib/demo-data";
import { EMPTY_FILTERS, sourceLabel } from "@/lib/report";
import { FindingsTable } from "./findings-table";
import { KpiStrip } from "./kpi-strip";
import { PageHeading } from "./panel";
import { PosturePanel } from "./posture-panel";
import { RulePanel } from "./rule-panel";
import { SidebarContent } from "./sidebar";
import { TopBar } from "./top-bar";

const noop = () => {};

/**
 * Static composition of the real dashboard components for the landing page.
 * Rendered at a fixed 1280px width; container queries make it lay out exactly
 * like /dashboard on a desktop, whatever the visitor's viewport.
 */
export function DashboardPreview({ width = 1280, height = 880 }: { width?: number; height?: number }) {
  const scan = initialScans[0];
  return (
    <div className="theme-dark @container/shell flex overflow-hidden bg-background text-foreground" style={{ width, height }}>
      <aside className="w-60 shrink-0 border-r bg-card/40">
        <SidebarContent
          view="overview"
          onNavigate={noop}
          findingsCount={scan.findings.length}
          workspace={scan.workspace}
          source={sourceLabel(scan)}
          preview
        />
      </aside>
      <div className="@container/main flex min-w-0 flex-1 flex-col">
        <TopBar workspace={scan.workspace} source={sourceLabel(scan)} scanning={false} preview />
        <div className="space-y-4 px-6 py-6">
          <PageHeading
            title="Overview"
            description={
              <>
                {scan.name} · <span className="font-mono text-[12.5px]">{sourceLabel(scan)}</span> · scanned {scan.completedLong}
              </>
            }
          />
          <KpiStrip scan={scan} />
          <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-2">
            <PosturePanel scan={scan} animate={false} />
            <RulePanel findings={scan.findings} limit={5} />
          </div>
          <FindingsTable
            findings={scan.findings}
            filters={EMPTY_FILTERS}
            onFiltersChange={noop}
            preview
            pageSize={6}
            title="Findings"
          />
        </div>
      </div>
    </div>
  );
}
