import {
  ArchiveX,
  Eye,
  FlaskConical,
  KeyRound,
  Puzzle,
  Syringe,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { RULES } from "./rules.generated";
import type { Action, CheckId, RiskLevel, RuleMeta, Severity, StoreId } from "./types";

/* ------------------------------------------------------------------ */
/* Severity                                                            */
/* ------------------------------------------------------------------ */

/** Most serious first, the order every mimvo report uses. */
export const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

export interface SeverityMeta {
  label: string;
  /** `Severity.rank` in the package: 0 for info through 4 for critical. */
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
  info: {
    label: "Info",
    rank: 0,
    text: "text-info",
    soft: "bg-info/10",
    border: "border-info/30",
    bar: "bg-info",
    fill: "hsl(var(--info))",
  },
};

export const riskTone: Record<RiskLevel, { text: string; soft: string; border: string; severity?: Severity }> = {
  Critical: { text: "text-sev-critical", soft: "bg-sev-critical/10", border: "border-sev-critical/30", severity: "critical" },
  High: { text: "text-sev-high", soft: "bg-sev-high/10", border: "border-sev-high/30", severity: "high" },
  Medium: { text: "text-sev-medium", soft: "bg-sev-medium/10", border: "border-sev-medium/30", severity: "medium" },
  Low: { text: "text-sev-low", soft: "bg-sev-low/10", border: "border-sev-low/30", severity: "low" },
  Info: { text: "text-info", soft: "bg-info/10", border: "border-info/30", severity: "info" },
  Clean: { text: "text-safe", soft: "bg-safe/10", border: "border-safe/30" },
};

/* ------------------------------------------------------------------ */
/* Checks and rules                                                    */
/* ------------------------------------------------------------------ */

export const CHECK_ORDER: CheckId[] = ["secrets", "injection", "poisoning"];

export interface DetectorMeta {
  /** `BaseDetector.name`, as written in reports. */
  name: string;
  /** Class to import in Python. */
  className: string;
  method: string;
  /** What it needs beyond the core install. Empty for the offline defaults. */
  needs?: string;
  /** Runs in `Mimvo()` with no configuration. */
  default?: boolean;
}

export interface CheckMeta {
  id: CheckId;
  label: string;
  /** Python class, such as `SecretsCheck`. */
  className: string;
  icon: LucideIcon;
  description: string;
  owasp: string;
  detectors: DetectorMeta[];
}

export const checks: Record<CheckId, CheckMeta> = {
  secrets: {
    id: "secrets",
    label: "Secrets and PII",
    className: "SecretsCheck",
    icon: KeyRound,
    description: "API keys, tokens, passwords, private keys and connection strings. Personal data is opt-in.",
    owasp: "LLM02: Sensitive Information Disclosure",
    detectors: [
      { name: "heuristic", className: "HeuristicSecretsDetector", method: "Provider key formats, JWTs, private keys, key=value", default: true },
      { name: "gitleaks", className: "GitleaksDetector", method: "Port of ~20 high-value Gitleaks rules", default: true },
      { name: "entropy", className: "EntropyDetector", method: "High-entropy hex and base64 runs" },
      { name: "presidio", className: "PresidioDetector", method: "Microsoft Presidio analyzer", needs: "[presidio]" },
      { name: "gliner2_pii", className: "GLiNER2PIIDetector", method: "GLiNER2 privacy filter", needs: "[gliner2]" },
    ],
  },
  injection: {
    id: "injection",
    label: "Hidden instructions",
    className: "InjectionCheck",
    icon: Syringe,
    description: "Text aimed at the agent: overrides, fake system messages, task hijacks, persona switches.",
    owasp: "LLM01: Prompt Injection",
    detectors: [
      { name: "heuristic", className: "HeuristicInjectionDetector", method: "Scored phrase rules after deobfuscation", default: true },
      { name: "prompt_guard", className: "PromptGuardDetector", method: "Llama Prompt Guard 2", needs: "[hf]" },
      { name: "protectai_deberta", className: "ProtectAIDeBERTaDetector", method: "ProtectAI DeBERTa v3 classifier", needs: "[hf]" },
      { name: "lakera_guard", className: "LakeraGuardDetector", method: "Lakera Guard API (sends text)", needs: "LAKERA_GUARD_API_KEY" },
    ],
  },
  poisoning: {
    id: "poisoning",
    label: "Poisoned facts",
    className: "PoisoningCheck",
    icon: FlaskConical,
    description: "Claims that switch off a control or redirect payments and data, plus planted near-duplicates.",
    owasp: "ASI06: Memory & Context Poisoning",
    detectors: [
      { name: "heuristic", className: "HeuristicPoisoningDetector", method: "Control-bypass, limit-removal and redirect rules", default: true },
      { name: "trustrag", className: "TrustRAGDetector", method: "Tight clusters of near-paraphrases", default: true },
      { name: "hubness", className: "HubnessDetector", method: "k-occurrence outliers in stored vectors", default: true },
      { name: "temporal_nli", className: "TemporalNLIDetector", method: "NLI contradiction against older neighbours", needs: "nli= callback" },
      { name: "perplexity", className: "PerplexityDetector", method: "Whole-text perplexity under a causal LM", needs: "[hf]" },
      { name: "embedding_consistency", className: "EmbeddingConsistencyDetector", method: "Re-embed the text and compare", needs: "embed= callback" },
    ],
  },
};

/** Detectors `Mimvo()` runs with no configuration, as `ScanReport.checks` lists them. */
export const DEFAULT_CHECKS: Record<CheckId, string[]> = Object.fromEntries(
  CHECK_ORDER.map((c) => [c, checks[c].detectors.filter((d) => d.default).map((d) => d.name)]),
) as Record<CheckId, string[]>;

export function checkMeta(id: string): CheckMeta | null {
  return (checks as Record<string, CheckMeta>)[id] ?? null;
}

export function checkIcon(id: string): LucideIcon {
  return checkMeta(id)?.icon ?? Puzzle;
}

export function checkLabel(id: string): string {
  return checkMeta(id)?.label ?? id;
}

/** Rule ids in report order: by check, then most severe first. */
export const RULE_ORDER: string[] = CHECK_ORDER.flatMap((c) =>
  Object.values(RULES as Record<string, RuleMeta>)
    .filter((r) => r.check === c)
    .sort((a, b) => severities[b.severity].rank - severities[a.severity].rank)
    .map((r) => r.id),
);

/** `rule_for(code)`: the catalogue entry, or the generic rule mimvo uses for custom checks. */
export function ruleFor(code: string): RuleMeta {
  const known = (RULES as Record<string, RuleMeta>)[code];
  if (known) return known;
  const title = code.replace(/[_-]/g, " ");
  return {
    id: code,
    title: title.charAt(0).toUpperCase() + title.slice(1),
    check: "custom",
    severity: "medium",
    action: "review",
    summary: "Raised by a custom check.",
    message: "Raised by a custom check.",
    remediation: ["Review the record against the custom check's documentation."],
    owaspId: "ASI06",
    owasp: "ASI06: Memory & Context Poisoning",
    owaspUrl: "https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications/",
    cwe: [],
  };
}

export function owaspId(owasp: string) {
  return owasp.split(":")[0].trim();
}

export function cweUrl(cwe: string) {
  return `https://cwe.mitre.org/data/definitions/${cwe.split("-")[1]}.html`;
}

/* ------------------------------------------------------------------ */
/* Recommended actions                                                 */
/* ------------------------------------------------------------------ */

/** Strongest first, as in `ScanReport.action_plan()`. */
export const ACTION_ORDER: Action[] = ["delete", "quarantine", "review"];

export const actions: Record<Action, { label: string; icon: LucideIcon; meaning: string; precedence: number }> = {
  delete: {
    label: "Delete",
    icon: Trash2,
    meaning: "Remove these records. Rotate any credential they hold before you delete.",
    precedence: 2,
  },
  quarantine: {
    label: "Quarantine",
    icon: ArchiveX,
    meaning: "Keep these out of retrieval until someone confirms they are true.",
    precedence: 1,
  },
  review: {
    label: "Review",
    icon: Eye,
    meaning: "A person should read these and decide. Most are fine to keep once checked.",
    precedence: 0,
  },
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
  /** `mimvo scan <slug>`. */
  slug: string;
  monogram: string;
  kind: string;
  noun: string;
  description: string;
  access: string;
  /** Optional extra that installs the client, if any (`uv sync --extra <extra>`). */
  extra?: string;
  fields: StoreField[];
  demo: Record<string, string>;
  resourceKey: string;
  endpointKey: string;
  flags: { flag: string; description: string }[];
  python: string;
  command: (values: Record<string, string>) => string;
}

export const STORE_ORDER: StoreId[] = ["chroma", "qdrant", "pgvector", "pinecone", "langchain", "mem0", "jsonl"];

const pyReport = (source: string, label: string) => `report = Mimvo().scan(${source})
report.source = "${label}"
Path("report.html").write_text(render_html(report), encoding="utf-8")`;

const q = (v: string) => (/^[\w./:@-]+$/.test(v) ? v : `'${v.replace(/'/g, "'\\''")}'`);

export const stores: Record<StoreId, StoreMeta> = {
  chroma: {
    id: "chroma",
    name: "Chroma",
    slug: "chroma",
    monogram: "Ch",
    kind: "Persist directory",
    noun: "collection",
    description: "Scan a collection in a local Chroma database. Stored vectors are read too.",
    access: "Reads records with get(). Never calls add, update, upsert, or delete.",
    extra: "chroma",
    fields: [
      { key: "path", label: "Database directory", placeholder: "./chroma_db", required: true },
      { key: "collection", label: "Collection", placeholder: "agent_memory", required: true },
    ],
    demo: { path: "./chroma_db", collection: "agent_memory" },
    resourceKey: "collection",
    endpointKey: "path",
    flags: [
      { flag: "--path", description: "Path to the Chroma database directory." },
      { flag: "--collection", description: "Collection name." },
    ],
    python: `from pathlib import Path

from mimvo import Mimvo
from mimvo.scan import ChromaScanSource, render_html

source = ChromaScanSource(path="./chroma_db", collection="agent_memory")
${pyReport("source", "chroma:agent_memory")}`,
    command: (v) => `mimvo scan chroma \\\n  --path ${q(v.path || "./chroma_db")} \\\n  --collection ${q(v.collection || "agent_memory")}`,
  },
  qdrant: {
    id: "qdrant",
    name: "Qdrant",
    slug: "qdrant",
    monogram: "Qd",
    kind: "HTTP",
    noun: "collection",
    description: "Scan points, payloads and vectors in a Qdrant collection.",
    access: "Reads points with scroll. Never upserts or deletes points.",
    extra: "qdrant",
    fields: [
      { key: "url", label: "Server URL", placeholder: "http://localhost:6333", required: true },
      { key: "collection", label: "Collection", placeholder: "agent_memory", required: true },
      {
        key: "textField",
        label: "Text field",
        placeholder: "content",
        hint: "Payload key holding the text. By default mimvo tries content, text, page_content, document and memory.",
      },
    ],
    demo: { url: "http://localhost:6333", collection: "agent_memory", textField: "" },
    resourceKey: "collection",
    endpointKey: "url",
    flags: [
      { flag: "--url", description: "Qdrant HTTP URL." },
      { flag: "--collection", description: "Collection name." },
      { flag: "--api-key", description: "API key. Defaults to QDRANT_API_KEY; use a read-only key." },
      { flag: "--text-field", description: "Payload field that holds the text." },
    ],
    python: `from pathlib import Path

from mimvo import Mimvo
from mimvo.scan import QdrantScanSource, render_html

source = QdrantScanSource(url="http://localhost:6333", collection="agent_memory")
${pyReport("source.records(sample=10_000)", "qdrant:agent_memory")}`,
    command: (v) =>
      `mimvo scan qdrant \\\n  --url ${q(v.url || "http://localhost:6333")} \\\n  --collection ${q(v.collection || "agent_memory")}` +
      (v.textField ? ` \\\n  --text-field ${q(v.textField)}` : ""),
  },
  pgvector: {
    id: "pgvector",
    name: "Postgres / pgvector",
    slug: "pgvector",
    monogram: "pg",
    kind: "Postgres DSN",
    noun: "table",
    description: "Scan a memory table in Postgres. Name the vector column to run the vector detectors.",
    access: "Runs SELECT queries only. Connect with a role limited to SELECT.",
    extra: "pgvector",
    fields: [
      { key: "dsn", label: "Connection string", placeholder: "postgresql://localhost/app", required: true },
      { key: "table", label: "Table", placeholder: "memories", required: true },
      { key: "textColumn", label: "Text column", placeholder: "content", required: true },
      { key: "embeddingColumn", label: "Embedding column", placeholder: "embedding", hint: "Lets TrustRAG and hubness run." },
    ],
    demo: { dsn: "postgresql://localhost/app", table: "memories", textColumn: "content", embeddingColumn: "embedding" },
    resourceKey: "table",
    endpointKey: "dsn",
    flags: [
      { flag: "--dsn", description: "Postgres connection string. Use a SELECT-only role." },
      { flag: "--table", description: "Table name (schema.table allowed)." },
      { flag: "--text-column", description: "Column that holds the memory text." },
      { flag: "--id-column", description: "Column that holds the record id. Default id." },
      { flag: "--embedding-column", description: "pgvector column, so the vector detectors can run." },
      { flag: "--created-at-column", description: "Timestamp column, for TemporalNLIDetector ordering." },
    ],
    python: `from pathlib import Path

from mimvo import Mimvo
from mimvo.scan import PgVectorScanSource, render_html

source = PgVectorScanSource(
    dsn="postgresql://localhost/app",
    table="memories",
    text_column="content",
    embedding_column="embedding",
)
${pyReport("source", "pgvector:memories")}`,
    command: (v) =>
      `mimvo scan pgvector \\\n  --dsn ${q(v.dsn || "postgresql://localhost/app")} \\\n  --table ${q(v.table || "memories")} \\\n  --text-column ${q(v.textColumn || "content")}` +
      (v.embeddingColumn ? ` \\\n  --embedding-column ${q(v.embeddingColumn)}` : ""),
  },
  pinecone: {
    id: "pinecone",
    name: "Pinecone",
    slug: "pinecone",
    monogram: "Pc",
    kind: "Serverless index",
    noun: "index",
    description: "Scan vectors and metadata in one namespace of a Pinecone index.",
    access: "Lists and fetches vectors with metadata. Never upserts or deletes.",
    extra: "pinecone",
    fields: [
      { key: "index", label: "Index", placeholder: "agent-memory", required: true },
      { key: "namespace", label: "Namespace", placeholder: "prod" },
      { key: "textField", label: "Text field", placeholder: "content" },
    ],
    demo: { index: "agent-memory", namespace: "prod", textField: "content" },
    resourceKey: "index",
    endpointKey: "namespace",
    flags: [
      { flag: "--index", description: "Index name." },
      { flag: "--namespace", description: "Namespace to scan. Default is the default namespace." },
      { flag: "--api-key", description: "API key. Defaults to PINECONE_API_KEY; use a read-scoped key." },
      { flag: "--host", description: "Index host, for serverless indexes." },
      { flag: "--text-field", description: "Metadata field that holds the text." },
    ],
    python: `from pathlib import Path

from mimvo import Mimvo
from mimvo.scan import PineconeScanSource, render_html

# Reads PINECONE_API_KEY from the environment.
source = PineconeScanSource(index="agent-memory", namespace="prod", text_field="content")
${pyReport("source", "pinecone:agent-memory")}`,
    command: (v) =>
      `mimvo scan pinecone \\\n  --index ${q(v.index || "agent-memory")}` +
      (v.namespace ? ` \\\n  --namespace ${q(v.namespace)}` : "") +
      (v.textField ? ` \\\n  --text-field ${q(v.textField)}` : ""),
  },
  langchain: {
    id: "langchain",
    name: "LangChain / LangGraph",
    slug: "langchain",
    monogram: "LC",
    kind: "Your own store object",
    noun: "store",
    description: "Scan a LangChain vector store or a LangGraph / LangMem memory store your code already builds.",
    access: "Lists and fetches documents or items. Never adds, updates, or deletes.",
    extra: "langchain",
    fields: [
      {
        key: "factory",
        label: "Factory (module:attr)",
        placeholder: "myapp.memory:get_vector_store",
        required: true,
        hint: "A store, or a function that returns one, imported from the current directory, like uvicorn app:app.",
      },
      { key: "namespace", label: "Namespace", placeholder: "memories/alice", hint: "LangGraph stores only." },
    ],
    demo: { factory: "myapp.memory:store", namespace: "memories" },
    resourceKey: "namespace",
    endpointKey: "factory",
    flags: [
      { flag: "--factory", description: "module:attr of a store, or of a function or class that returns one." },
      { flag: "--namespace", description: "LangGraph namespace prefix, such as memories/alice." },
      { flag: "--text-field", description: "Key in each LangGraph item that holds the text." },
    ],
    python: `from pathlib import Path

from langgraph.store.memory import InMemoryStore

from mimvo import Mimvo
from mimvo.scan import LangGraphStoreScanSource, render_html

store: InMemoryStore = ...  # the store your agent writes to
source = LangGraphStoreScanSource(store, namespace=("memories",))
${pyReport("source", "langgraph:memories")}`,
    command: (v) =>
      `mimvo scan langchain \\\n  --factory ${q(v.factory || "myapp.memory:store")}` +
      (v.namespace ? ` \\\n  --namespace ${q(v.namespace)}` : ""),
  },
  mem0: {
    id: "mem0",
    name: "mem0",
    slug: "mem0",
    monogram: "m0",
    kind: "Open source or platform",
    noun: "memory store",
    description: "Scan mem0's open-source Memory through its config file, or the hosted platform by user.",
    access: "Reads with get_all and the vector store's list. Never adds, updates, or deletes memories.",
    extra: "mem0",
    fields: [
      { key: "config", label: "Config file", placeholder: "mem0_config.yaml", required: true, hint: "The file your app passes to Memory.from_config." },
      { key: "userId", label: "User id", placeholder: "alice", hint: "Leave empty to read the whole store." },
    ],
    demo: { config: "mem0_config.yaml", userId: "" },
    resourceKey: "userId",
    endpointKey: "config",
    flags: [
      { flag: "--config", description: "mem0 config file (open source)." },
      { flag: "--api-key", description: "mem0 platform key. Defaults to MEM0_API_KEY." },
      { flag: "--user-id", description: "Only this user's memories. One of the ids is required on the platform." },
      { flag: "--agent-id", description: "Only this agent's memories." },
      { flag: "--run-id", description: "Only this run's memories." },
    ],
    python: `from pathlib import Path

from mem0 import Memory

from mimvo import Mimvo
from mimvo.scan import Mem0ScanSource, render_html

memory = Memory.from_config(config)  # the same config your app uses
source = Mem0ScanSource(memory)
${pyReport("source", "mem0:all")}`,
    command: (v) =>
      `mimvo scan mem0 \\\n  --config ${q(v.config || "mem0_config.yaml")}` + (v.userId ? ` \\\n  --user-id ${q(v.userId)}` : ""),
  },
  jsonl: {
    id: "jsonl",
    name: "JSONL",
    slug: "jsonl",
    monogram: "{}",
    kind: "File export",
    noun: "file",
    description: "Scan a JSON Lines export of any store. Only content is required per line.",
    access: "Reads the export line by line. The file is opened read-only.",
    fields: [{ key: "file", label: "Export file", placeholder: "./exports/agent_memory.jsonl", required: true, hint: "Use - to read from stdin." }],
    demo: { file: "./exports/agent_memory.jsonl" },
    resourceKey: "file",
    endpointKey: "file",
    flags: [{ flag: "PATH", description: "JSON Lines file, or - for stdin. Keys: id, content, metadata, embedding, created_at." }],
    python: `from pathlib import Path

from mimvo import Mimvo
from mimvo.scan import JsonlScanSource, render_html

source = JsonlScanSource("./exports/agent_memory.jsonl")
${pyReport("source", "jsonl:./exports/agent_memory.jsonl")}`,
    command: (v) => `mimvo scan jsonl ${q(v.file || "./exports/agent_memory.jsonl")}`,
  },
};

/**
 * Install line for a store, run inside a clone of the mimvo repository.
 * Mimvo is not on PyPI; it installs from source with uv.
 */
export function installCommand(store: StoreId) {
  const extra = stores[store].extra;
  return extra ? `uv sync --extra ${extra}` : "uv sync";
}

/** Map a `ScanReport.source` label (`qdrant:agent_memory`) to a store. */
export function storeFromSource(source: string): { store: StoreId | null; resource: string } {
  const i = source.indexOf(":");
  const prefix = i > 0 ? source.slice(0, i) : "";
  const resource = i > 0 ? source.slice(i + 1) : source;
  const map: Record<string, StoreId> = {
    chroma: "chroma",
    qdrant: "qdrant",
    pgvector: "pgvector",
    pinecone: "pinecone",
    langchain: "langchain",
    langgraph: "langchain",
    mem0: "mem0",
    jsonl: "jsonl",
  };
  return { store: map[prefix] ?? null, resource: resource || "memory" };
}
