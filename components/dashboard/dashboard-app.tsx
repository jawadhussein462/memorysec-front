"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { initialScans } from "@/lib/demo-data";
import { EMPTY_FILTERS, buildReportJson, scanCommand, sourceLabel } from "@/lib/report";
import type { Finding, FindingFilters, Scan, StoreId } from "@/lib/types";
import { copyText, downloadFile, formatNumber } from "@/lib/utils";
import { FindingSheet } from "./finding-sheet";
import { FindingsTable } from "./findings-table";
import { IntegrationsView } from "./integrations-view";
import { NewScanDialog } from "./new-scan-dialog";
import { PageHeading } from "./panel";
import { ReportBody } from "./report-body";
import { ScanDetail, ScansList } from "./scans-view";
import { SidebarContent, VIEWS, type DashboardView } from "./sidebar";
import { TopBar } from "./top-bar";

export function DashboardApp() {
  const [view, setView] = useState<DashboardView>("overview");
  const [scans, setScans] = useState<Scan[]>(initialScans);
  const [activeScanId, setActiveScanId] = useState(initialScans[0].id);
  const [detailScanId, setDetailScanId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Finding | null>(null);
  const [findingOpen, setFindingOpen] = useState(false);
  const [reviewed, setReviewed] = useState<Set<string>>(() => new Set());
  const [newScanOpen, setNewScanOpen] = useState(false);
  const [preset, setPreset] = useState<StoreId | null>(null);
  const [scanning, setScanning] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [findingFilters, setFindingFilters] = useState<FindingFilters>(EMPTY_FILTERS);

  const activeScan = scans.find((s) => s.id === activeScanId) ?? scans[0];
  const detailScan = detailScanId ? (scans.find((s) => s.id === detailScanId) ?? null) : null;
  const selectedScan = selected ? scans.find((s) => s.id === selected.scanId) : undefined;
  const contextScan = view === "scans" && detailScan ? detailScan : activeScan;

  const reviewedInActive = useMemo(
    () => activeScan.findings.filter((f) => reviewed.has(f.id)).length,
    [activeScan, reviewed],
  );

  /* URL hash <-> view, so links like /dashboard#findings land on the right screen. */
  useEffect(() => {
    const apply = () => {
      const hash = window.location.hash.replace("#", "");
      if ((VIEWS as string[]).includes(hash)) {
        setView(hash as DashboardView);
        setDetailScanId(null);
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  useEffect(() => setFindingFilters(EMPTY_FILTERS), [activeScanId]);

  useEffect(() => {
    if (!reportLoading) return;
    const t = setTimeout(() => setReportLoading(false), 650);
    return () => clearTimeout(t);
  }, [reportLoading]);

  const setHash = (v: DashboardView) => {
    if (window.location.hash !== `#${v}`) window.history.replaceState(null, "", `#${v}`);
  };

  const navigate = useCallback((v: DashboardView) => {
    setView(v);
    setDetailScanId(null);
    setNavOpen(false);
    setHash(v);
    window.scrollTo({ top: 0 });
  }, []);

  const openScan = (id: string) => {
    setView("scans");
    setDetailScanId(id);
    setHash("scans");
    window.scrollTo({ top: 0 });
  };

  const openFinding = (f: Finding) => {
    setSelected(f);
    setFindingOpen(true);
  };

  const toggleReviewed = (id: string) =>
    setReviewed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const openNewScan = (store: StoreId | null = null) => {
    setPreset(store);
    setNewScanOpen(true);
  };

  const exportReport = (scan: Scan = contextScan) => {
    const filename = `memorysec-${scan.id}.json`;
    downloadFile(filename, buildReportJson(scan));
    toast.success("Report exported", {
      description: `${filename} · ${scan.findings.length} findings, secrets masked`,
    });
  };

  const copyCommand = async () => {
    const ok = await copyText(scanCommand(contextScan));
    if (ok) toast.success("CLI command copied", { description: `Re-runs this scan against ${sourceLabel(contextScan)}` });
    else toast.error("Couldn't access the clipboard", { description: "Your browser blocked clipboard access." });
  };

  const onScanComplete = (scan: Scan) => {
    setScans((prev) => [scan, ...prev]);
    setActiveScanId(scan.id);
    setNewScanOpen(false);
    setReportLoading(true);
    openScan(scan.id);
    toast.success("Scan completed", {
      description: `${formatNumber(scan.records)} records scanned · ${scan.findings.length} flagged`,
    });
  };

  let content: ReactNode;
  if (view === "overview") {
    content = (
      <div className="space-y-5">
        <PageHeading
          title="Overview"
          description={
            <>
              {activeScan.name} · <span className="font-mono text-[12.5px]">{sourceLabel(activeScan)}</span> · scanned{" "}
              {activeScan.completedLong}
            </>
          }
        />
        <ReportBody
          scan={activeScan}
          reviewed={reviewed}
          onSelect={openFinding}
          onNewScan={() => openNewScan()}
          loading={reportLoading}
        />
      </div>
    );
  } else if (view === "findings") {
    content = (
      <div className="space-y-5">
        <PageHeading
          title="Findings"
          description={
            <>
              {activeScan.findings.length} findings from {activeScan.name}
              {reviewedInActive > 0 && ` · ${reviewedInActive} reviewed`}. Actions are recommendations and are never
              applied to the store.
            </>
          }
        />
        <FindingsTable
          findings={activeScan.findings}
          filters={findingFilters}
          onFiltersChange={setFindingFilters}
          onSelect={openFinding}
          reviewed={reviewed}
          pageSize={25}
          scrollable
          title="All findings"
        />
        <p className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
          <Lock className="size-3.5" aria-hidden="true" />
          Evidence is masked before it reaches this view. Raw secrets never leave the scanner.
        </p>
      </div>
    );
  } else if (view === "scans") {
    content = detailScan ? (
      <ScanDetail
        scan={detailScan}
        reviewed={reviewed}
        loading={reportLoading && detailScan.id === activeScanId}
        onBack={() => setDetailScanId(null)}
        onSelect={openFinding}
        onExport={() => exportReport(detailScan)}
        onNewScan={() => openNewScan()}
      />
    ) : (
      <ScansList scans={scans} onOpen={openScan} onNewScan={() => openNewScan()} />
    );
  } else {
    content = <IntegrationsView onScanSource={(store) => openNewScan(store)} />;
  }

  const sidebarProps = {
    view,
    onNavigate: navigate,
    findingsCount: activeScan.findings.length,
    workspace: activeScan.workspace,
    source: sourceLabel(activeScan),
  };

  return (
    <div className="@container/shell min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r bg-card/40 @5xl/shell:block">
          <SidebarContent {...sidebarProps} />
        </aside>

        <div className="@container/main flex min-w-0 flex-1 flex-col">
          <TopBar
            workspace={activeScan.workspace}
            source={sourceLabel(activeScan)}
            scanning={scanning}
            onMenu={() => setNavOpen(true)}
            onNewScan={() => openNewScan()}
            onExport={() => exportReport()}
            onCopyCommand={copyCommand}
            onViewScan={() => openScan(contextScan.id)}
          />
          <main id="main" className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 @2xl/main:px-6 @2xl/main:py-7">
            {content}
          </main>
        </div>
      </div>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="p-0" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
          <SidebarContent {...sidebarProps} />
        </SheetContent>
      </Sheet>

      <FindingSheet
        finding={selected}
        scan={selectedScan}
        open={findingOpen}
        onOpenChange={setFindingOpen}
        reviewed={selected ? reviewed.has(selected.id) : false}
        onToggleReviewed={toggleReviewed}
      />

      <NewScanDialog
        open={newScanOpen}
        onOpenChange={setNewScanOpen}
        preset={preset}
        onRunningChange={setScanning}
        onComplete={onScanComplete}
      />

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            color: "hsl(var(--popover-foreground))",
            fontFamily: "var(--font-sans)",
          },
        }}
      />
    </div>
  );
}
