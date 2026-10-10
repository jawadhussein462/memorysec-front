import { CHECK_ORDER, ruleFor, stores } from "./catalog";
import { DEMO_RECORD_COUNT, PRODUCTION_CHECKS, PRODUCTION_SEEDS, materializeFindings } from "./demo-data";
import { MIMVO_VERSION, SCHEMA_VERSION } from "./rules.generated";
import type { CheckId, Scan, StoreId } from "./types";

/* Simulated scans for the New scan flow. Nothing connects anywhere. */

export interface ScanPlan {
  store: StoreId;
  values: Record<string, string>;
  checks: CheckId[];
}

export function planResource(plan: Pick<ScanPlan, "store" | "values">) {
  const meta = stores[plan.store];
  const raw = (plan.values[meta.resourceKey] || meta.demo[meta.resourceKey] || "").trim();
  if (plan.store === "jsonl") return raw || "export.jsonl";
  if (plan.store === "langchain") return raw || "*";
  if (plan.store === "mem0") return raw || "all";
  return raw || "memory";
}

export function planEndpoint(plan: Pick<ScanPlan, "store" | "values">) {
  const meta = stores[plan.store];
  return (plan.values[meta.endpointKey] || meta.demo[meta.endpointKey] || "").trim();
}

/** `ScanReport.source` the CLI would write for this plan. */
export function planSource(plan: Pick<ScanPlan, "store" | "values">) {
  const resource = planResource(plan);
  if (plan.store === "langchain") return `langgraph:${resource}`;
  return `${stores[plan.store].slug}:${resource}`;
}

/** Findings the demo dataset yields for the selected checks. */
export function planFindingSeeds(plan: Pick<ScanPlan, "checks">) {
  return PRODUCTION_SEEDS.filter((s) => plan.checks.includes(ruleFor(s.rule).check as CheckId));
}

export function planChecks(plan: Pick<ScanPlan, "checks">) {
  return Object.fromEntries(CHECK_ORDER.filter((c) => plan.checks.includes(c)).map((c) => [c, PRODUCTION_CHECKS[c]]));
}

export function createScanFromPlan(plan: ScanPlan): Scan {
  const id = `scan_${Math.random().toString(16).slice(2, 8)}`;
  const resource = planResource(plan);
  return {
    id,
    name: "Production Agent Memory",
    workspace: "Production Agent",
    origin: "simulated",
    store: plan.store,
    source: planSource(plan),
    resource,
    endpoint: planEndpoint(plan),
    records: DEMO_RECORD_COUNT,
    sample: null,
    durationSeconds: 103.4,
    generatedAt: new Date().toISOString(),
    completed: "Just now",
    completedLong: "just now",
    checks: planChecks(plan),
    findings: materializeFindings(planFindingSeeds(plan), id, resource),
    errors: [],
    recordsWithErrors: 0,
    mimvoVersion: MIMVO_VERSION,
    schemaVersion: SCHEMA_VERSION,
  };
}
