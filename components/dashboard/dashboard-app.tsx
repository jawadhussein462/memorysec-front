"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FileUp, Lock } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { initialScans } from "@/lib/demo-data";
import { EMPTY_FILTERS, flaggedCount, isComplete, scanCommand, sourceLabel } from "@/lib/report";
import { MAX_REPORT_BYTES, ReportImportError, buildReportJson, parseReport, reportFileName } from "@/lib/report-io";
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
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

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
    const filename = reportFileName(scan);
    downloadFile(filename, buildReportJson(scan));
    toast.success("Report exported", {
      description: `${filename} · mimvo JSON schema ${scan.schemaVersion}, ${scan.findings.length} findings`,
    });
  };

  /* Open a report written by `mimvo scan ... --json`. The file is read here and never uploaded. */
  const importFile = async (file: File) => {
    if (file.size > MAX_REPORT_BYTES) {
      toast.error("Report too large", { description: "Files over 50 MB are not opened in the browser." });
      return;
    }
    try {
      const { scan, skipped, legacy } = parseReport(await file.text(), file.name);
      setScans((prev) => [scan, ...prev]);
      setActiveScanId(scan.id);
      openScan(scan.id);
      const notes = [
        `${formatNumber(scan.records)} records · ${formatNumber(flaggedCount(scan.findings))} flagged`,
        skipped ? `${skipped} invalid findings skipped` : null,
        legacy ? "written by MemorySec (schema 1.x)" : null,
      ].filter(Boolean);
      toast.success(`Opened ${file.name}`, { description: notes.join(" · ") });
    } catch (err) {
      toast.error("Couldn't open this report", {
        description: err instanceof ReportImportError ? err.message : "The file could not be read.",
      });
    }
  };

  const openImport = () => fileInput.current?.click();
  const importFileRef = useRef(importFile);
  importFileRef.current = importFile;

  useEffect(() => {
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
    const over = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      setDragging(true);
    };
    const leave = (e: DragEvent) => {
      if (e.relatedTarget === null) setDragging(false);
    };
    const drop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) void importFileRef.current(file);
    };
    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
    };
  }, []);

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
      description: `${formatNumber(scan.records)} records scanned · ${flaggedCount(scan.findings)} flagged`,
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
              {activeScan.findings.length} findings on {flaggedCount(activeScan.findings)} records from {activeScan.name}
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
          Secret values are masked by mimvo before they reach a report. Raw secrets never leave the scanner.
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
      <ScansList scans={scans} onOpen={openScan} onNewScan={() => openNewScan()} onImport={openImport} />
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
    imported: activeScan.origin === "imported",
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
            complete={isComplete(activeScan)}
            onMenu={() => setNavOpen(true)}
            onNewScan={() => openNewScan()}
            onExport={() => exportReport()}
            onImport={openImport}
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

      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void importFile(file);
        }}
      />

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-[70] grid place-items-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded-xl border border-dashed border-foreground/40 bg-card px-10 py-8 text-center">
            <FileUp className="size-6 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 text-[15px] font-medium">Drop a mimvo JSON report</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">The file written by --json. It is read here, never uploaded.</p>
          </div>
        </div>
      )}

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
