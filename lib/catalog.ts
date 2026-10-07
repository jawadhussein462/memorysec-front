import {
  ArchiveX,
  ChevronsUp,
  Eye,
  Files,
  FlaskConical,
  GitCompare,
  KeyRound,
  Syringe,
  Trash2,
  Waves,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId, RemediationAction, RiskLevel, Severity, StoreId } from "./types";

/* ------------------------------------------------------------------ */
/* Severity                                                            */
/* ------------------------------------------------------------------ */

export const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

export interface SeverityMeta {
  label: string;
  rank: number;
  text: string;
  soft: string;
  border: string;
  bar: string;
  fill: string;
}

export const severities: Record<Severity, SeverityMeta> = {
  critical: {
    label: "Critical",
    rank: 4,
    text: "text-sev-critical",
    soft: "bg-sev-critical/10",
    border: "border-sev-critical/30",
    bar: "bg-sev-critical",
    fill: "hsl(var(--sev-critical))",
  },
  high: {
    label: "High",
    rank: 3,
    text: "text-sev-high",
    soft: "bg-sev-high/10",
    border: "border-sev-high/30",
    bar: "bg-sev-high",
    fill: "hsl(var(--sev-high))",
  },
  medium: {
    label: "Medium",
    rank: 2,
    text: "text-sev-medium",
    soft: "bg-sev-medium/10",
    border: "border-sev-medium/30",
    bar: "bg-sev-medium",
    fill: "hsl(var(--sev-medium))",
  },
  low: {
    label: "Low",
    rank: 1,
    text: "text-sev-low",
    soft: "bg-sev-low/10",
    border: "border-sev-low/30",
    bar: "bg-sev-low",
    fill: "hsl(var(--sev-low))",
  },
};

export const riskTone: Record<RiskLevel, { text: string; soft: string; border: string; severity?: Severity }> = {
  Critical: { text: "text-sev-critical", soft: "bg-sev-critical/10", border: "border-sev-critical/30", severity: "critical" },
  High: { text: "text-sev-high", soft: "bg-sev-high/10", border: "border-sev-high/30", severity: "high" },
  Medium: { text: "text-sev-medium", soft: "bg-sev-medium/10", border: "border-sev-medium/30", severity: "medium" },
  Low: { text: "text-sev-low", soft: "bg-sev-low/10", border: "border-sev-low/30", severity: "low" },
  Clean: { text: "text-safe", soft: "bg-safe/10", border: "border-safe/30" },
};

/* ------------------------------------------------------------------ */
/* Scan categories                                                     */
/* ------------------------------------------------------------------ */

export const OWASP = {
  memory: "ASI06 · Memory & Context Poisoning",
  privilege: "ASI03 · Identity & Privilege Abuse",
  disclosure: "LLM02:2025 · Sensitive Information Disclosure",
};

export const CATEGORY_ORDER: CategoryId[] = [
  "poisoning",
  "injection",
  "pii",
  "contradiction",
  "amplification",
  "flooding",
  "escalation",
];

export interface CategoryMeta {
  id: CategoryId;
  /** Chart and filter label. */
  label: string;
  /** Finding title used in tables and the detail drawer. */
  finding: string;
  /** Scanner toggle label. */
  scanner: string;
  /** Landing page card title. */
  landing: string;
  /** CLI scanner key. */
  key: string;
  icon: LucideIcon;
  description: string;
  owasp: string;
}

export const categories: Record<CategoryId, CategoryMeta> = {
  poisoning: {
    id: "poisoning",
    label: "Memory poisoning",
    finding: "Memory poisoning",
    scanner: "Memory poisoning",
    landing: "Poisoned facts",
    key: "poisoning",
    icon: FlaskConical,
    description: "Attacker-controlled or false facts inserted into long-term agent memory.",
    owasp: OWASP.memory,
  },
  injection: {
    id: "injection",
    label: "Persistent injection",
    finding: "Persistent prompt injection",
    scanner: "Persistent prompt injection",
    landing: "Persistent prompt injection",
    key: "injection",
    icon: Syringe,
    description: "Hidden instructions stored in memory that try to steer future model behavior.",
    owasp: OWASP.memory,
  },
  pii: {
    id: "pii",
    label: "PII / privacy leakage",
    finding: "PII leakage",
    scanner: "PII / privacy leakage",
    landing: "PII / privacy leakage",
    key: "pii",
    icon: KeyRound,
    description: "Secrets, tokens, credentials, or personal data stored where they should not be.",
    owasp: OWASP.disclosure,
  },
  contradiction: {
    id: "contradiction",
    label: "Contradictory memory",
    finding: "Contradictory memory",
    scanner: "Contradictory memory",
    landing: "Contradictory memory",
    key: "contradiction",
    icon: GitCompare,
    description: "Stored facts or instructions that conflict with trusted existing memories.",
    owasp: OWASP.memory,
  },
  amplification: {
    id: "amplification",
    label: "Duplicate / amplification",
    finding: "Amplification attack",
    scanner: "Duplicate / amplification",
    landing: "Duplicate / amplification",
    key: "amplification",
    icon: Files,
    description: "Near-duplicate malicious memories repeated to win retrieval and gain influence.",
    owasp: OWASP.memory,
  },
  flooding: {
    id: "flooding",
    label: "Memory flooding",
    finding: "Memory flooding",
    scanner: "Memory flooding",
    landing: "Memory flooding",
    key: "flooding",
    icon: Waves,
    description: "Abnormal write volume or repetitive content that crowds useful context out of memory.",
    owasp: OWASP.memory,
  },
  escalation: {
    id: "escalation",
    label: "Authority / scope escalation",
    finding: "Authority escalation",
    scanner: "Authority / scope escalation",
    landing: "Authority / scope escalation",
    key: "escalation",
    icon: ChevronsUp,
    description: "Memories that grant themselves authority, change policy, or cross user and tenant boundaries.",
    owasp: OWASP.privilege,
  },
};

/* ------------------------------------------------------------------ */
/* Recommended actions                                                 */
/* ------------------------------------------------------------------ */

export const actions: Record<RemediationAction, { icon: LucideIcon; meaning: string }> = {
  Delete: { icon: Trash2, meaning: "Remove the record from the memory store." },
  Quarantine: { icon: ArchiveX, meaning: "Keep the record, but exclude it from retrieval until verified." },
  Review: { icon: Eye, meaning: "Have an owner confirm whether the record should stay." },
};

/* ------------------------------------------------------------------ */
/* Memory stores                                                       */
/* ------------------------------------------------------------------ */

export interface StoreField {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
  secret?: boolean;
  hint?: string;
}

export interface StoreMeta {
  id: StoreId;
  name: string;
  slug: string;
  monogram: string;
  kind: string;
  noun: string;
  description: string;
  access: string;
  fields: StoreField[];
  demo: Record<string, string>;
  resourceKey: string;
  endpointKey: string;
  flags: { flag: string; description: string }[];
  python: string;
  command: (values: Record<string, string>) => string;
}

export const STORE_ORDER: StoreId[] = ["chroma", "qdrant", "pgvector", "pinecone", "jsonl"];

export const stores: Record<StoreId, StoreMeta> = {
  chroma: {
    id: "chroma",
    name: "Chroma",
    slug: "chroma",
    monogram: "Ch",
    kind: "Local or HTTP",
    noun: "collection",
    description: "Scan a local persist directory or a Chroma server.",
    access: "Reads records with get(). Never calls add, update, upsert, or delete.",
    fields: [
      { key: "path", label: "Persist directory or URL", placeholder: "./chroma_db", required: true },
      { key: "collection", label: "Collection", placeholder: "agent_memory", required: true },
    ],
    demo: { path: "./chroma_db", collection: "agent_memory" },
    resourceKey: "collection",
    endpointKey: "path",
    flags: [
      { flag: "--path", description: "Persist directory, or an http:// URL for a Chroma server." },
      { flag: "--collection", description: "Collection to scan." },
      { flag: "--report", description: "Write an HTML report to this path." },
    ],
    python: `from memorysec import Scanner
from memorysec.sources import ChromaSource

source = ChromaSource(path="./chroma_db", collection="agent_memory")
report = Scanner().scan(source)
report.write_html("report.html")`,
    command: (v) => `memorysec scan chroma \\\n  --path ${v.path || "./chroma_db"} \\\n  --collection ${v.collection || "agent_memory"}`,
  },
  qdrant: {
    id: "qdrant",
    name: "Qdrant",
    slug: "qdrant",
    monogram: "Qd",
    kind: "HTTP / gRPC",
    noun: "collection",
    description: "Scan points and payloads in a Qdrant collection.",
    access: "Reads points and payloads with scroll. Never upserts or deletes points.",
    fields: [
      { key: "url", label: "Server URL", placeholder: "http://localhost:6333", required: true },
      { key: "collection", label: "Collection", placeholder: "agent_memory", required: true },
      {
        key: "apiKey",
        label: "API key",
        placeholder: "Optional for local instances",
        secret: true,
        hint: "Use a read-only key for Qdrant Cloud. Keys stay in this browser tab.",
      },
    ],
    demo: { url: "http://localhost:6333", collection: "agent_memory", apiKey: "" },
    resourceKey: "collection",
    endpointKey: "url",
    flags: [
      { flag: "--url", description: "Qdrant server URL." },
      { flag: "--collection", description: "Collection to scan." },
      { flag: "--api-key", description: "Read-only API key. Also read from QDRANT_API_KEY." },
      { flag: "--report", description: "Write an HTML report to this path." },
    ],
    python: `from memorysec import Scanner
from memorysec.sources import QdrantSource

source = QdrantSource(url="http://localhost:6333", collection="agent_memory")
report = Scanner().scan(source)
report.write_html("report.html")`,
    command: (v) =>
      `memorysec scan qdrant \\\n  --url ${v.url || "http://localhost:6333"} \\\n  --collection ${v.collection || "agent_memory"}`,
  },
  pgvector: {
    id: "pgvector",
    name: "Postgres / pgvector",
    slug: "pgvector",
    monogram: "pg",
    kind: "Postgres DSN",
    noun: "table",
    description: "Scan a memory table in Postgres with the pgvector extension.",
    access: "Runs SELECT queries only. Connect with a role limited to SELECT.",
    fields: [
      { key: "dsn", label: "Connection string", placeholder: "postgresql://localhost/app", required: true },
      { key: "table", label: "Table", placeholder: "memories", required: true },
      { key: "textColumn", label: "Text column", placeholder: "content", required: true },
    ],
    demo: { dsn: "postgresql://localhost/app", table: "memories", textColumn: "content" },
    resourceKey: "table",
    endpointKey: "dsn",
    flags: [
      { flag: "--dsn", description: "Postgres connection string. Use a SELECT-only role." },
      { flag: "--table", description: "Table that stores agent memories." },
      { flag: "--text-column", description: "Column holding the memory text." },
      { flag: "--report", description: "Write an HTML report to this path." },
    ],
    python: `from memorysec import Scanner
from memorysec.sources import PgvectorSource

source = PgvectorSource(
    dsn="postgresql://localhost/app",
    table="memories",
    text_column="content",
)
report = Scanner().scan(source)
report.write_html("security-report.html")`,
    command: (v) =>
      `memorysec scan pgvector \\\n  --dsn ${v.dsn || "postgresql://localhost/app"} \\\n  --table ${v.table || "memories"} \\\n  --text-column ${v.textColumn || "content"}`,
  },
  pinecone: {
    id: "pinecone",
    name: "Pinecone",
    slug: "pinecone",
    monogram: "Pc",
    kind: "Serverless index",
    noun: "index",
    description: "Scan vectors and metadata in a Pinecone index namespace.",
    access: "Lists and fetches vectors with metadata. Never upserts or deletes.",
    fields: [
      { key: "index", label: "Index", placeholder: "agent-memory", required: true },
      { key: "namespace", label: "Namespace", placeholder: "production" },
      {
        key: "apiKey",
        label: "API key",
        placeholder: "Read-scoped API key",
        secret: true,
        required: true,
        hint: "Use a key scoped to read access. Keys stay in this browser tab.",
      },
    ],
    demo: { index: "agent-memory", namespace: "production", apiKey: "demo-read-only" },
    resourceKey: "index",
    endpointKey: "namespace",
    flags: [
      { flag: "--index", description: "Pinecone index name." },
      { flag: "--namespace", description: "Namespace to scan. Defaults to all namespaces." },
      { flag: "--report", description: "Write an HTML report to this path." },
    ],
    python: `from memorysec import Scanner
from memorysec.sources import PineconeSource

# Reads PINECONE_API_KEY from the environment.
source = PineconeSource(index="agent-memory", namespace="production")
report = Scanner().scan(source)
report.write_html("report.html")`,
    command: (v) =>
      `memorysec scan pinecone \\\n  --index ${v.index || "agent-memory"} \\\n  --namespace ${v.namespace || "production"}`,
  },
  jsonl: {
    id: "jsonl",
    name: "JSONL",
    slug: "jsonl",
    monogram: "{}",
    kind: "File export",
    noun: "file",
    description: "Scan a newline-delimited JSON export of any memory store.",
    access: "Reads the export line by line. The file is opened read-only.",
    fields: [
      { key: "file", label: "Export file", placeholder: "./exports/agent_memory.jsonl", required: true },
      { key: "textField", label: "Text field", placeholder: "text", required: true },
    ],
    demo: { file: "./exports/agent_memory.jsonl", textField: "text" },
    resourceKey: "file",
    endpointKey: "file",
    flags: [
      { flag: "--file", description: "Path to the .jsonl export." },
      { flag: "--text-field", description: "JSON field holding the memory text." },
      { flag: "--report", description: "Write an HTML report to this path." },
    ],
    python: `from memorysec import Scanner
from memorysec.sources import JsonlSource

source = JsonlSource(path="./exports/agent_memory.jsonl", text_field="text")
report = Scanner().scan(source)
report.write_html("report.html")`,
    command: (v) =>
      `memorysec scan jsonl \\\n  --file ${v.file || "./exports/agent_memory.jsonl"} \\\n  --text-field ${v.textField || "text"}`,
  },
};
