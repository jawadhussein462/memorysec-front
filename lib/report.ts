import { ACTION_ORDER, RULE_ORDER, SEVERITY_ORDER, actions, severities, stores } from "./catalog";
import type { Action, Finding, FindingFilters, RiskLevel, Scan, Severity } from "./types";

/*
 * Selectors over a Scan. Each one matches the ScanReport property of the
 * same name in the mimvo package, so the dashboard and the CLI's HTML,
 * JSON and Markdown reports always agree on the numbers.
 */

export const EMPTY_FILTERS: FindingFilters = { severity: "all", rule: "all", query: "" };

export function emptySeverityCounts(): Record<Severity, number> {
  return { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
}

/** Findings per severity (`ScanReport.by_severity`, with zeros kept). */
export function severityCounts(findings: Finding[]) {
  const counts = emptySeverityCounts();
  for (const f of findings) counts[f.severity]++;
  return counts;
}

/** Findings per rule id, most frequent first (`ScanReport.by_rule`). */
export function ruleCounts(findings: Finding[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const f of findings) counts.set(f.rule, (counts.get(f.rule) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function ruleSeverityMatrix(findings: Finding[]) {
  const matrix = new Map<string, Record<Severity, number>>();
  for (const f of findings) {
    const row = matrix.get(f.rule) ?? emptySeverityCounts();
    row[f.severity]++;
    matrix.set(f.rule, row);
  }
  return matrix;
}

/** Rules in catalogue order, then any custom codes. */
export function orderedRules(ids: Iterable<string>) {
  const set = new Set(ids);
  const known = RULE_ORDER.filter((r) => set.has(r));
  const custom = [...set].filter((r) => !RULE_ORDER.includes(r)).sort();
  return [...known, ...custom];
}

/** Distinct records with at least one finding (`ScanReport.flagged`). */
export function flaggedCount(findings: Finding[]) {
  return new Set(findings.map((f) => f.record)).size;
}

/** `ScanReport.flagged_pct`: rounded to two decimals. */
export function flaggedPct(scan: Pick<Scan, "findings" | "records">) {
  if (!scan.records) return 0;
  return Math.round((10000 * flaggedCount(scan.findings)) / scan.records) / 100;
}

/** `ScanReport.action_plan()`: each flagged record once, under the strongest action it needs. */
export function actionPlan(findings: Finding[]): Record<Action, string[]> {
  const strongest = new Map<string, Action>();
  for (const f of findings) {
    const current = strongest.get(f.record);
    if (!current || actions[f.action].precedence > actions[current].precedence) strongest.set(f.record, f.action);
  }
  const plan: Record<Action, string[]> = { delete: [], quarantine: [], review: [] };
  for (const [record, action] of strongest) plan[action].push(record);
  return plan;
}

/** `ScanReport.worst_severity()`. */
export function topSeverity(findings: Finding[]): Severity | null {
  const c = severityCounts(findings);
  return SEVERITY_ORDER.find((s) => c[s] > 0) ?? null;
}

export function riskLevel(findings: Finding[]): RiskLevel {
  const top = topSeverity(findings);
  return top ? (severities[top].label as RiskLevel) : "Clean";
}

/** `ScanReport.complete`. */
export function isComplete(scan: Pick<Scan, "errors">) {
  return scan.errors.length === 0;
}

/** Findings sorted the way mimvo writes them: most severe first, then most confident. */
export function sortFindings(findings: Finding[]) {
  return [...findings].sort(
    (a, b) =>
      severities[b.severity].rank - severities[a.severity].rank ||
      (b.confidence ?? 0) - (a.confidence ?? 0) ||
      a.record.localeCompare(b.record),
  );
}

export function formatDuration(seconds: number | null) {
  if (seconds === null || !Number.isFinite(seconds)) return "—";
  if (seconds < 1) return `${Math.max(1, Math.round(seconds * 1000))} ms`;
  if (seconds < 60) return `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export function formatConfidence(c: number | null) {
  return c === null ? "—" : c.toFixed(2);
}

export function detectorCount(scan: Pick<Scan, "checks">) {
  return Object.values(scan.checks).reduce((n, d) => n + d.length, 0);
}

/** `scan.source` as the CLI writes it, such as `qdrant:agent_memory`. */
export function sourceLabel(scan: Pick<Scan, "source">) {
  return scan.source || "unknown source";
}

export function detectorSummary(f: Finding) {
  return f.detectors.join(" + ") || "—";
}

export function filterFindings(findings: Finding[], filters: FindingFilters) {
  const q = filters.query.trim().toLowerCase();
  return findings.filter((f) => {
    if (filters.severity !== "all" && f.severity !== filters.severity) return false;
    if (filters.rule !== "all" && f.rule !== filters.rule) return false;
    if (!q) return true;
    return (
      f.record.toLowerCase().includes(q) ||
      f.rule.toLowerCase().includes(q) ||
      f.title.toLowerCase().includes(q) ||
      f.snippet.toLowerCase().includes(q) ||
      f.check.toLowerCase().includes(q) ||
      f.detectors.some((d) => d.toLowerCase().includes(q))
    );
  });
}

/** The `mimvo scan` command that reproduces a scan, with the report flags. */
export function scanCommand(scan: Pick<Scan, "store" | "resource" | "endpoint">) {
  if (!scan.store) return "mimvo scan jsonl export.jsonl \\\n  --report report.html \\\n  --json findings.json";
  const meta = stores[scan.store];
  const values: Record<string, string> = { ...meta.demo, [meta.resourceKey]: scan.resource };
  if (meta.endpointKey !== meta.resourceKey) values[meta.endpointKey] = scan.endpoint;
  return `${meta.command(values)} \\\n  --report report.html \\\n  --json findings.json`;
}

export { ACTION_ORDER };
