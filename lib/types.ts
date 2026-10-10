/*
 * The dashboard's data model mirrors the mimvo package's report
 * (`mimvo scan --json`, schema 2.0): a ScanReport with ScanFinding rows.
 * Field names that differ are noted; `lib/report-io.ts` converts both ways.
 */

/** `mimvo.Severity`. From least to most serious: info, low, medium, high, critical. */
export type Severity = "critical" | "high" | "medium" | "low" | "info";

/** `mimvo.Action`. Recommended only: mimvo never changes the store. */
export type Action = "delete" | "quarantine" | "review";

/** The three built-in checks. Custom checks show up under their own name. */
export type CheckId = "secrets" | "injection" | "poisoning";

/** Scan sources the CLI supports (`mimvo scan <source>`). */
export type StoreId = "chroma" | "qdrant" | "pgvector" | "pinecone" | "langchain" | "mem0" | "jsonl";

export type RiskLevel = "Critical" | "High" | "Medium" | "Low" | "Info" | "Clean";

/** One entry of the rule catalogue (`mimvo/rules.py`). */
export interface RuleMeta {
  id: string;
  title: string;
  check: string;
  severity: Severity;
  action: Action;
  summary: string;
  /** The sentence the check writes to `ScanFinding.message`. */
  message: string;
  remediation: readonly string[];
  owaspId: string;
  owasp: string;
  owaspUrl: string;
  cwe: readonly string[];
}

export interface ContextRow {
  label: string;
  value: string;
  mono?: boolean;
}

/**
 * One `ScanFinding`. The package calls the record id `id` and the rule id
 * `type`; here `id` is the dashboard's unique key, `record` is the record id
 * and `rule` is the finding code.
 */
export interface Finding {
  /** Unique within the dashboard: `${scanId}:${fingerprint}`. */
  id: string;
  scanId: string;
  /** `ScanFinding.id`: id of the stored record. */
  record: string;
  /** `ScanFinding.type`: finding code, which is the rule id. */
  rule: string;
  title: string;
  check: string;
  severity: Severity;
  /** Combined detector confidence, 0 to 1. `null` when no detector scored its hit. */
  confidence: number | null;
  action: Action;
  detectors: string[];
  /** Short, secret-masked excerpt of the record. */
  snippet: string;
  message: string;
  /** Masked evidence: kinds, matched phrases, scores, cluster ids. Never raw secrets. */
  evidence: Record<string, unknown>;
  remediation: string[];
  owasp: string;
  cwe: string[];
  fingerprint: string;
  /* Demo-only enrichment. Imported reports leave these empty. */
  namespace?: string;
  created?: string;
  context?: ContextRow[];
}

/** `ScanError`: a check or detector that failed. Never a finding. */
export interface ScanError {
  check: string;
  detector: string | null;
  errorType: string;
  message: string;
  records: number;
  recordIds: string[];
}

export type ScanOrigin = "demo" | "simulated" | "imported";

export interface Scan {
  id: string;
  name: string;
  workspace: string;
  origin: ScanOrigin;
  /** `null` when an imported report's source is not one of the CLI sources. */
  store: StoreId | null;
  /** `ScanReport.source`, such as `qdrant:agent_memory`. */
  source: string;
  resource: string;
  endpoint: string;
  /** `ScanReport.total`: records read. */
  records: number;
  sample: number | null;
  durationSeconds: number | null;
  generatedAt: string | null;
  completed: string;
  completedLong: string;
  /** `ScanReport.checks`: each check that ran, mapped to its detectors. */
  checks: Record<string, string[]>;
  findings: Finding[];
  errors: ScanError[];
  recordsWithErrors: number;
  mimvoVersion: string;
  schemaVersion: string;
  fileName?: string;
}

export interface FindingFilters {
  severity: Severity | "all";
  rule: string | "all";
  query: string;
}
