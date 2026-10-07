import { CATEGORY_ORDER, SEVERITY_ORDER, categories, stores } from "./catalog";
import { PRODUCTION_ACTIVITY, PRODUCTION_SEEDS, PRODUCTION_SPIKE, materializeFindings } from "./demo-data";
import type { CategoryId, Finding, FindingFilters, RiskLevel, Scan, Severity, StoreId } from "./types";

export const EMPTY_FILTERS: FindingFilters = { severity: "all", category: "all", query: "" };

export function severityCounts(findings: Finding[]) {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) counts[f.severity]++;
  return counts;
}

export function categoryCounts(findings: Finding[]) {
  const counts = Object.fromEntries(CATEGORY_ORDER.map((c) => [c, 0])) as Record<CategoryId, number>;
  for (const f of findings) counts[f.category]++;
  return counts;
}

export function categorySeverityMatrix(findings: Finding[]) {
  const matrix = Object.fromEntries(
    CATEGORY_ORDER.map((c) => [c, { critical: 0, high: 0, medium: 0, low: 0 }]),
  ) as Record<CategoryId, Record<Severity, number>>;
  for (const f of findings) matrix[f.category][f.severity]++;
  return matrix;
}

export function riskLevel(findings: Finding[], records: number): RiskLevel {
  if (!findings.length) return "Clean";
  const c = severityCounts(findings);
  if (c.critical >= 25 || findings.length / Math.max(records, 1) > 0.02) return "Critical";
  if (c.critical > 0 || c.high > 0) return "High";
  if (c.medium > 0) return "Medium";
  return "Low";
}

export function topSeverity(findings: Finding[]): Severity | null {
  const c = severityCounts(findings);
  return SEVERITY_ORDER.find((s) => c[s] > 0) ?? null;
}

export function relativeTime(sec: number) {
  if (sec < 60) return "just now";
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function sourceLabel(scan: Pick<Scan, "store" | "resource">) {
  return `${stores[scan.store].slug} / ${scan.resource}`;
}

export function detectorSummary(f: Finding) {
  return f.detectors.map((d) => d.short).join(" + ");
}

export function filterFindings(findings: Finding[], filters: FindingFilters) {
  const q = filters.query.trim().toLowerCase();
  return findings.filter((f) => {
    if (filters.severity !== "all" && f.severity !== filters.severity) return false;
    if (filters.category !== "all" && f.category !== filters.category) return false;
    if (!q) return true;
    return (
      f.record.toLowerCase().includes(q) ||
      f.headline.toLowerCase().includes(q) ||
      f.source.toLowerCase().includes(q) ||
      categories[f.category].finding.toLowerCase().includes(q) ||
      categories[f.category].label.toLowerCase().includes(q) ||
      f.detectors.some((d) => d.name.toLowerCase().includes(q))
    );
  });
}

export function scanCommand(scan: Pick<Scan, "store" | "resource" | "endpoint">) {
  const meta = stores[scan.store];
  const values: Record<string, string> = { ...meta.demo, [meta.resourceKey]: scan.resource };
  if (meta.endpointKey !== meta.resourceKey) values[meta.endpointKey] = scan.endpoint;
  return `${meta.command(values)} \\\n  --report report.html`;
}

/* ------------------------------------------------------------------ */
/* JSON output                                                         */
/* ------------------------------------------------------------------ */

export function findingToJson(f: Finding, scan?: Scan) {
  return {
    id: f.id,
    scan_id: f.scanId,
    severity: f.severity,
    category: categories[f.category].key,
    finding: categories[f.category].finding,
    headline: f.headline,
    record_id: f.record,
    record_kind: f.recordKind,
    source: scan ? `${stores[scan.store].slug}/${f.source}` : f.source,
    detectors: f.detectors.map((d) => ({ name: d.name, confidence: d.confidence })),
    detectors_agreed: f.detectors.length,
    evidence_masked: f.masked,
    conflicts_with: f.conflict ? { record_id: f.conflict.record, text: f.conflict.text } : undefined,
    explanation: f.summary,
    recommended_action: f.action.toLowerCase(),
    recommended_action_detail: f.actionDetail,
    action_applied: false,
    created: f.created,
    owasp: f.owasp,
  };
}

export function buildReportJson(scan: Scan) {
  const counts = severityCounts(scan.findings);
  return JSON.stringify(
    {
      generator: "memorysec (demo dashboard)",
      note: "Demo data. MemorySec connections are read-only; recommended actions are not applied.",
      scan: {
        id: scan.id,
        name: scan.name,
        source: { type: stores[scan.store].slug, resource: scan.resource },
        mode: "read-only",
        records_scanned: scan.records,
        records_flagged: scan.findings.length,
        duration: scan.duration,
        scanners: scan.scanners.map((c) => categories[c].key),
        secrets_masked: true,
      },
      summary: {
        overall_risk: riskLevel(scan.findings, scan.records).toLowerCase(),
        severity: counts,
        categories: Object.fromEntries(
          Object.entries(categoryCounts(scan.findings)).map(([k, v]) => [categories[k as CategoryId].key, v]),
        ),
      },
      findings: scan.findings.map((f) => findingToJson(f, scan)),
    },
    null,
    2,
  );
}

/* ------------------------------------------------------------------ */
/* Simulated scans (New scan flow)                                     */
/* ------------------------------------------------------------------ */

export interface ScanPlan {
  store: StoreId;
  values: Record<string, string>;
  scanners: CategoryId[];
}

export const DEMO_RECORD_COUNT = 48291;

export function planResource(plan: ScanPlan) {
  const meta = stores[plan.store];
  const raw = (plan.values[meta.resourceKey] || meta.demo[meta.resourceKey] || "memory").trim();
  return plan.store === "jsonl" ? raw.split("/").pop() || raw : raw;
}

export function planEndpoint(plan: ScanPlan) {
  const meta = stores[plan.store];
  return (plan.values[meta.endpointKey] || meta.demo[meta.endpointKey] || "").trim();
}

/** Findings the demo dataset yields for the selected scanners. */
export function planFindingSeeds(plan: ScanPlan) {
  return PRODUCTION_SEEDS.filter((s) => plan.scanners.includes(s.category));
}

export function createScanFromPlan(plan: ScanPlan): Scan {
  const id = `scan_${Math.random().toString(16).slice(2, 8)}`;
  const resource = planResource(plan);
  const seeds = planFindingSeeds(plan).map((s) => ({
    ...s,
    source: s.source === "agent_memory" ? resource : s.source,
    detectedSec: Math.max(4, Math.round(s.detectedSec * 0.22)),
  }));
  return {
    id,
    name: "Production Agent Memory",
    workspace: "Production Agent",
    store: plan.store,
    resource,
    endpoint: planEndpoint(plan),
    records: DEMO_RECORD_COUNT,
    duration: "1m 43s",
    completed: "Just now",
    completedLong: "just now",
    status: "Completed",
    scanners: [...plan.scanners],
    findings: materializeFindings(seeds, id),
    activity: PRODUCTION_ACTIVITY,
    spike: plan.scanners.includes("flooding") ? PRODUCTION_SPIKE : undefined,
  };
}
