import { ACTION_ORDER, SEVERITY_ORDER, ruleFor, storeFromSource } from "./catalog";
import { MIMVO_VERSION, SCHEMA_VERSION } from "./rules.generated";
import { actionPlan, flaggedCount, flaggedPct, ruleCounts, severityCounts, sortFindings } from "./report";
import { findingFingerprint } from "./sha256";
import type { Action, Finding, Scan, ScanError, Severity } from "./types";

/*
 * Conversion between the dashboard's Scan and the mimvo JSON report
 * (`mimvo scan ... --json findings.json`, or `report.model_dump_json()`).
 *
 * Export writes exactly the layout the package writes, so a report from the
 * demo can be read back with `ScanReport.model_validate_json`. Import reads
 * schema 2.x (mimvo) and 1.x (MemorySec, the project's previous name).
 */

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

/** One `ScanFinding`, keys in the package's order. */
export function findingToJson(f: Finding) {
  return {
    id: f.record,
    type: f.rule,
    severity: f.severity,
    detectors: f.detectors,
    snippet: f.snippet,
    action: f.action,
    owasp: f.owasp,
    message: f.message,
    check: f.check,
    title: f.title,
    remediation: f.remediation,
    cwe: f.cwe,
    evidence: f.evidence,
    fingerprint: f.fingerprint,
    confidence: f.confidence,
  };
}

/** The full `ScanReport` JSON, computed fields included, as `--json` writes it. */
export function reportToJson(scan: Scan) {
  const counts = severityCounts(scan.findings);
  const plan = actionPlan(scan.findings);
  return {
    schema_version: SCHEMA_VERSION,
    mimvo_version: scan.mimvoVersion || MIMVO_VERSION,
    total: scan.records,
    findings: scan.findings.map(findingToJson),
    source: scan.source,
    sample: scan.sample,
    generated_at: scan.generatedAt,
    duration_seconds: scan.durationSeconds,
    checks: scan.checks,
    errors: scan.errors.map((e) => ({
      check: e.check,
      detector: e.detector,
      error_type: e.errorType,
      message: e.message,
      records: e.records,
      record_ids: e.recordIds,
    })),
    records_with_errors: scan.recordsWithErrors,
    complete: scan.errors.length === 0,
    flagged: flaggedCount(scan.findings),
    flagged_pct: flaggedPct(scan),
    by_severity: Object.fromEntries(SEVERITY_ORDER.filter((s) => counts[s] > 0).map((s) => [s, counts[s]])),
    by_rule: Object.fromEntries(ruleCounts(scan.findings)),
    by_action: Object.fromEntries(ACTION_ORDER.filter((a) => plan[a].length > 0).map((a) => [a, plan[a].length])),
  };
}

export function buildReportJson(scan: Scan) {
  return JSON.stringify(reportToJson(scan), null, 2);
}

export function reportFileName(scan: Scan) {
  return scan.origin === "imported" && scan.fileName ? scan.fileName : `mimvo-${scan.id}.json`;
}

/* ------------------------------------------------------------------ */
/* Import                                                              */
/* ------------------------------------------------------------------ */

export const MAX_REPORT_BYTES = 50 * 1024 * 1024;

export class ReportImportError extends Error {}

export interface ImportResult {
  scan: Scan;
  /** Findings dropped because a required field was missing or invalid. */
  skipped: number;
  /** Set when the file was written by MemorySec, the project's earlier name. */
  legacy: boolean;
}

const SEVERITIES = new Set<string>(SEVERITY_ORDER);
const ACTIONS = new Set<string>(ACTION_ORDER);

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const strList = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

function parseFinding(raw: unknown, scanId: string, index: number): Finding | null {
  if (!isObject(raw)) return null;
  const record = str(raw.id);
  const rule = str(raw.type);
  const severity = str(raw.severity);
  const action = str(raw.action);
  if (!record || !rule || !SEVERITIES.has(severity) || !ACTIONS.has(action)) return null;
  const meta = ruleFor(rule);
  const fingerprint = str(raw.fingerprint) || findingFingerprint(record, rule);
  const confidence = num(raw.confidence);
  return {
    id: `${scanId}:${fingerprint}:${index}`,
    scanId,
    record,
    rule,
    title: str(raw.title) || meta.title,
    check: str(raw.check) || meta.check,
    severity: severity as Severity,
    confidence: confidence === null ? null : Math.min(1, Math.max(0, confidence)),
    action: action as Action,
    detectors: strList(raw.detectors),
    snippet: str(raw.snippet),
    message: str(raw.message) || meta.summary,
    evidence: isObject(raw.evidence) ? raw.evidence : {},
    remediation: strList(raw.remediation).length ? strList(raw.remediation) : [...meta.remediation],
    owasp: str(raw.owasp) || meta.owasp,
    cwe: strList(raw.cwe).length ? strList(raw.cwe) : [...meta.cwe],
    fingerprint,
  };
}

function parseError(raw: unknown): ScanError | null {
  if (!isObject(raw) || typeof raw.check !== "string") return null;
  return {
    check: raw.check,
    detector: typeof raw.detector === "string" ? raw.detector : null,
    errorType: str(raw.error_type, "Error"),
    message: str(raw.message),
    records: num(raw.records) ?? 0,
    recordIds: strList(raw.record_ids),
  };
}

function relativeFrom(iso: string | null) {
  if (!iso) return { short: "Imported", long: "at an unknown time" };
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return { short: "Imported", long: "at an unknown time" };
  const d = new Date(t);
  const long = d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  return { short: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }), long: `on ${long} UTC` };
}

/** Parse the text of a mimvo `--json` report into a Scan. Nothing leaves the browser. */
export function parseReport(text: string, fileName = "report.json"): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new ReportImportError("This file is not valid JSON. Pass the file written by --json, not the HTML or SARIF report.");
  }
  if (!isObject(data)) throw new ReportImportError("Expected a JSON object with a findings list.");
  if (data.version === "2.1.0" && Array.isArray(data.runs)) {
    throw new ReportImportError("This is a SARIF file. Open the file written by --json instead.");
  }
  if (!Array.isArray(data.findings) || num(data.total) === null) {
    throw new ReportImportError("This does not look like a mimvo report: it has no total or findings list.");
  }

  const schema = str(data.schema_version, "unknown");
  const legacy = typeof data.memorysec_version === "string" && typeof data.mimvo_version !== "string";
  const major = Number.parseInt(schema, 10);
  if (Number.isFinite(major) && major > Number.parseInt(SCHEMA_VERSION, 10)) {
    throw new ReportImportError(
      `Report schema ${schema} is newer than this dashboard understands (${SCHEMA_VERSION}). Update the dashboard or re-export with this mimvo version.`,
    );
  }

  const id = `import_${Math.random().toString(16).slice(2, 8)}`;
  let skipped = 0;
  const findings: Finding[] = [];
  data.findings.forEach((raw, i) => {
    const f = parseFinding(raw, id, i);
    if (f) findings.push(f);
    else skipped++;
  });

  const source = str(data.source);
  const { store, resource } = storeFromSource(source);
  const generatedAt = typeof data.generated_at === "string" ? data.generated_at : null;
  const when = relativeFrom(generatedAt);
  const checks: Record<string, string[]> = {};
  if (isObject(data.checks)) for (const [k, v] of Object.entries(data.checks)) checks[k] = strList(v);
  const errors = Array.isArray(data.errors) ? data.errors.map(parseError).filter((e): e is ScanError => e !== null) : [];
  const name = fileName.replace(/\.json$/i, "");

  return {
    skipped,
    legacy,
    scan: {
      id,
      name,
      workspace: "Imported report",
      origin: "imported",
      store,
      source: source || fileName,
      resource,
      endpoint: "",
      records: num(data.total) ?? 0,
      sample: num(data.sample),
      durationSeconds: num(data.duration_seconds),
      generatedAt,
      completed: when.short,
      completedLong: when.long,
      checks,
      findings: sortFindings(findings),
      errors,
      recordsWithErrors: num(data.records_with_errors) ?? 0,
      mimvoVersion: str(data.mimvo_version) || str(data.memorysec_version) || "unknown",
      schemaVersion: schema,
      fileName,
    },
  };
}
