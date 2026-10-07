export type Severity = "critical" | "high" | "medium" | "low";

export type CategoryId =
  | "poisoning"
  | "injection"
  | "pii"
  | "contradiction"
  | "amplification"
  | "flooding"
  | "escalation";

/** Recommended remediation. MemorySec never applies these itself: connections are read-only. */
export type RemediationAction = "Delete" | "Quarantine" | "Review";

export type StoreId = "chroma" | "qdrant" | "pgvector" | "pinecone" | "jsonl";

export type RiskLevel = "Critical" | "High" | "Medium" | "Low" | "Clean";

export interface DetectorHit {
  name: string;
  short: string;
  confidence: number;
}

export interface ContextRow {
  label: string;
  value: string;
  mono?: boolean;
}

export interface Finding {
  id: string;
  scanId: string;
  severity: Severity;
  category: CategoryId;
  headline: string;
  summary: string;
  record: string;
  recordKind: "record" | "cluster" | "window";
  source: string;
  detectors: DetectorHit[];
  action: RemediationAction;
  actionDetail: string;
  /** Evidence with secrets and personal data already masked. */
  masked: string;
  conflict?: { record: string; text: string };
  context?: ContextRow[];
  /** Seconds between detection and "now" in the demo. */
  detectedSec: number;
  created: string;
  owasp: string;
}

export interface ActivityPoint {
  t: string;
  writes: number;
}

export interface Scan {
  id: string;
  name: string;
  workspace: string;
  store: StoreId;
  resource: string;
  endpoint: string;
  records: number;
  duration: string;
  completed: string;
  completedLong: string;
  status: "Completed";
  scanners: CategoryId[];
  findings: Finding[];
  activity: ActivityPoint[];
  spike?: { index: number; label: string; detail: string };
}

export interface FindingFilters {
  severity: Severity | "all";
  category: CategoryId | "all";
  query: string;
}
