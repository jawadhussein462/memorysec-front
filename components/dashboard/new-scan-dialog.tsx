"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, CircleCheck, CircleDashed, LoaderCircle, Lock, Play } from "lucide-react";
import { CopyButton, ShellCommand } from "@/components/security/code";
import { SeverityMeter } from "@/components/security/severity";
import { StoreGlyph } from "@/components/security/store-glyph";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { CHECK_ORDER, SEVERITY_ORDER, STORE_ORDER, checks, ruleFor, severities, stores } from "@/lib/catalog";
import { DEMO_RECORD_COUNT, PRODUCTION_CHECKS } from "@/lib/demo-data";
import { emptySeverityCounts } from "@/lib/report";
import {
  createScanFromPlan,
  planChecks,
  planEndpoint,
  planResource,
  planSource,
  type ScanPlan,
} from "@/lib/simulate";
import type { CheckId, Scan, Severity, StoreId } from "@/lib/types";
import { clamp, cn, formatNumber, formatPercent } from "@/lib/utils";

type Step = "source" | "configure" | "run";

const STEPS: { id: Step; label: string }[] = [
  { id: "source", label: "Source" },
  { id: "configure", label: "Checks" },
  { id: "run", label: "Run" },
];

export function NewScanDialog({
  open,
  onOpenChange,
  preset,
  onRunningChange,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preset: StoreId | null;
  onRunningChange: (running: boolean) => void;
  onComplete: (scan: Scan) => void;
}) {
  const [step, setStep] = useState<Step>("source");
  const [store, setStore] = useState<StoreId | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [enabled, setEnabled] = useState<CheckId[]>(CHECK_ORDER);
  const [plan, setPlan] = useState<ScanPlan | null>(null);
  const [runDone, setRunDone] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setStep("source");
    setStore(preset);
    setValues({});
    setEnabled([...CHECK_ORDER]);
    setPlan(null);
    setRunDone(false);
    completedRef.current = false;
  }, [open, preset]);

  const running = step === "run" && !runDone;
  const meta = store ? stores[store] : null;
  const valid = !!meta && meta.fields.every((f) => !f.required || (values[f.key] ?? "").trim() !== "");
  const draftPlan: ScanPlan | null = store ? { store, values, checks: enabled } : null;

  const finish = () => {
    if (!plan || completedRef.current) return;
    completedRef.current = true;
    onRunningChange(false);
    onComplete(createScanFromPlan(plan));
  };

  // Show the result briefly, then open the report.
  useEffect(() => {
    if (!runDone) return;
    const t = setTimeout(finish, 1700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runDone]);

  const startRun = () => {
    if (!draftPlan) return;
    setPlan({ ...draftPlan, checks: CHECK_ORDER.filter((c) => enabled.includes(c)) });
    setRunDone(false);
    completedRef.current = false;
    setStep("run");
    onRunningChange(true);
  };

  const cancelRun = () => {
    setStep("configure");
    setPlan(null);
    onRunningChange(false);
  };

  const titles: Record<Step, { title: string; description: string }> = {
    source: {
      title: "Choose a memory source",
      description: "Pick the store your agent writes long-term memory to. Mimvo connects as a reader.",
    },
    configure: {
      title: "Configure scan",
      description: "Choose which checks run. All three run by default, as in Mimvo().",
    },
    run: {
      title: runDone ? "Scan completed" : "Scanning memory",
      description: "Simulated in this demo: no connection is made and no data leaves the page.",
    },
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && step === "run") return;
        onOpenChange(o);
      }}
    >
      <DialogContent
        hideClose={step === "run"}
        onInteractOutside={(e) => step === "run" && e.preventDefault()}
        onEscapeKeyDown={(e) => step === "run" && e.preventDefault()}
        className="max-w-[46rem]"
      >
        <div className="border-b px-6 pb-4 pt-5">
          <ol className="flex items-center gap-2 pr-10 text-xs" aria-label="New scan steps">
            {STEPS.map((s, i) => {
              const state = i < stepIndex || (s.id === "run" && runDone) ? "done" : i === stepIndex ? "current" : "todo";
              return (
                <li key={s.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-full border font-mono text-[10.5px]",
                      state === "done" && "border-foreground/40 bg-foreground/10",
                      state === "current" && "border-foreground bg-foreground text-background",
                      state === "todo" && "text-muted-foreground",
                    )}
                    aria-hidden="true"
                  >
                    {state === "done" ? <Check className="size-3" /> : i + 1}
                  </span>
                  <span className={state === "todo" ? "text-muted-foreground" : "text-foreground"} aria-current={state === "current" ? "step" : undefined}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border sm:w-10" aria-hidden="true" />}
                </li>
              );
            })}
          </ol>
          <DialogTitle className="type-display mt-4 text-[19px] font-semibold">{titles[step].title}</DialogTitle>
          <DialogDescription className="mt-1 text-[13px]">{titles[step].description}</DialogDescription>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
          {step === "source" && (
            <SourceStep
              store={store}
              values={values}
              onStore={(id) => {
                if (id !== store) setValues({});
                setStore(id);
              }}
              onValue={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
              onDemo={() => store && setValues({ ...stores[store].demo })}
            />
          )}
          {step === "configure" && draftPlan && (
            <ConfigureStep
              plan={draftPlan}
              enabled={enabled}
              onToggle={(c, on) =>
                setEnabled((prev) => (on ? CHECK_ORDER.filter((x) => x === c || prev.includes(x)) : prev.filter((x) => x !== c)))
              }
              onAll={() => setEnabled([...CHECK_ORDER])}
              onBack={() => setStep("source")}
            />
          )}
          {step === "run" && plan && <ScanRun plan={plan} onFinished={() => setRunDone(true)} />}
        </div>

        <div className="flex items-center justify-between gap-3 border-t bg-muted/25 px-6 py-3.5">
          {step === "source" && (
            <>
              <div className="ml-auto flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button size="sm" disabled={!valid} onClick={() => setStep("configure")}>
                  Continue
                </Button>
              </div>
            </>
          )}
          {step === "configure" && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setStep("source")}>
                <ArrowLeft />
                Back
              </Button>
              <Button size="sm" disabled={enabled.length === 0} onClick={startRun}>
                <Play />
                Run scan
              </Button>
            </>
          )}
          {step === "run" && (
            <>
              <span className="font-mono text-xs text-muted-foreground">
                {plan ? planSource(plan) : null}
              </span>
              {runDone ? (
                <Button size="sm" onClick={finish}>
                  View report
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={cancelRun} disabled={!running}>
                  Cancel scan
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1: source                                                      */
/* ------------------------------------------------------------------ */

function SourceStep({
  store,
  values,
  onStore,
  onValue,
  onDemo,
}: {
  store: StoreId | null;
  values: Record<string, string>;
  onStore: (id: StoreId) => void;
  onValue: (key: string, value: string) => void;
  onDemo: () => void;
}) {
  const meta = store ? stores[store] : null;
  return (
    <div className="space-y-6">
      <div role="radiogroup" aria-label="Memory source" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STORE_ORDER.map((id) => {
          const s = stores[id];
          const selected = store === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onStore(id)}
              className={cn(
                "flex flex-col items-start gap-2.5 rounded-lg border p-3 text-left transition-colors",
                selected ? "border-foreground/60 bg-accent ring-1 ring-foreground/40" : "hover:bg-accent/50",
              )}
            >
              <StoreGlyph store={id} />
              <span>
                <span className="block text-[13px] font-medium leading-tight">{s.name}</span>
                <span className="mt-0.5 block font-mono text-[10.5px] text-muted-foreground">{s.kind}</span>
              </span>
            </button>
          );
        })}
      </div>

      {meta ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[13.5px] font-medium">{meta.name} connection</h3>
            <Button variant="secondary" size="sm" onClick={onDemo}>
              Use demo source
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {meta.fields.map((f, i) => {
              const id = `field-${meta.id}-${f.key}`;
              const full = meta.fields.length % 2 === 1 && i === 0;
              return (
                <div key={f.key} className={cn("space-y-1.5", full && "sm:col-span-2")}>
                  <label htmlFor={id} className="flex items-center gap-1.5 text-[12.5px] font-medium">
                    {f.label}
                    {!f.required && <span className="font-normal text-muted-foreground">optional</span>}
                  </label>
                  <Input
                    id={id}
                    value={values[f.key] ?? ""}
                    onChange={(e) => onValue(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    type={f.secret ? "password" : "text"}
                    autoComplete="off"
                    spellCheck={false}
                    className="font-mono text-[13px]"
                  />
                  {f.hint && <p className="text-[11.5px] leading-snug text-muted-foreground">{f.hint}</p>}
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 rounded-lg border border-safe/25 bg-safe/[0.06] px-3.5 py-3">
            <Lock className="mt-0.5 size-4 shrink-0 text-safe" aria-hidden="true" />
            <div>
              <p className="text-[13px] font-medium">Read-only connection</p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
                Mimvo reads records for analysis and does not modify your {meta.noun}. {meta.access}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-[13px] text-muted-foreground">
          Select a memory source to enter connection details, or pick one and use the demo source.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2: configure                                                   */
/* ------------------------------------------------------------------ */

function ConfigureStep({
  plan,
  enabled,
  onToggle,
  onAll,
  onBack,
}: {
  plan: ScanPlan;
  enabled: CheckId[];
  onToggle: (c: CheckId, on: boolean) => void;
  onAll: () => void;
  onBack: () => void;
}) {
  const command = `${stores[plan.store].command(plan.values)} \\\n  --report report.html \\\n  --json findings.json`;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-lg border px-3.5 py-2.5">
        <StoreGlyph store={plan.store} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-mono text-[13px]">{planSource(plan)}</div>
          <div className="truncate font-mono text-[11px] text-muted-foreground">{planEndpoint(plan) || "default endpoint"}</div>
        </div>
        <span className="hidden items-center gap-1 rounded-[4px] border px-1.5 py-0.5 text-[11px] text-muted-foreground sm:inline-flex">
          <Lock className="size-3" aria-hidden="true" />
          read-only
        </span>
        <Button variant="ghost" size="sm" onClick={onBack}>
          Change
        </Button>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-medium">
            Checks <span className="font-normal text-muted-foreground">· {enabled.length} of {CHECK_ORDER.length} enabled</span>
          </h3>
          {enabled.length < CHECK_ORDER.length && (
            <button type="button" onClick={onAll} className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Enable all
            </button>
          )}
        </div>
        <ul className="divide-y rounded-lg border">
          {CHECK_ORDER.map((c) => {
            const meta = checks[c];
            const Icon = meta.icon;
            const id = `check-${c}`;
            const on = enabled.includes(c);
            return (
              <li key={c} className="flex items-start gap-3 px-3.5 py-3">
                <Icon className={cn("mt-0.5 size-4 shrink-0", on ? "text-foreground" : "text-muted-foreground")} aria-hidden="true" />
                <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
                  <span className="flex items-baseline gap-2">
                    <span className="text-[13px] font-medium">{meta.label}</span>
                    <code className="font-mono text-[11px] text-muted-foreground">{meta.className}</code>
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{meta.description}</span>
                  <span className="mt-1.5 flex flex-wrap gap-1">
                    {PRODUCTION_CHECKS[c].map((d) => (
                      <span key={d} className="rounded-[3px] border bg-muted/50 px-1 font-mono text-[10.5px] text-muted-foreground">
                        {d}
                      </span>
                    ))}
                  </span>
                </label>
                <Switch id={id} checked={on} onCheckedChange={(v) => onToggle(c, v)} />
              </li>
            );
          })}
          <li className="flex items-center gap-3 bg-muted/30 px-3.5 py-2.5">
            <Lock className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium">Mask secrets in reports</span>
              <span className="block truncate text-[12px] text-muted-foreground">
                Secret values are masked in snippets and never written to findings, JSON, logs, or traces.
              </span>
            </div>
            <span className="text-[11.5px] text-muted-foreground">Always on</span>
          </li>
        </ul>
        {enabled.length === 0 && <p className="mt-2 text-[12.5px] text-sev-medium">Enable at least one check to run a scan.</p>}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-medium">Same scan from your terminal</h3>
          <CopyButton value={command} label="Copy command" />
        </div>
        <div className="theme-dark scrollbar-thin overflow-x-auto rounded-lg border bg-terminal px-3.5 py-2.5 font-mono text-[12px] leading-[1.7] text-terminal-foreground">
          <ShellCommand command={command} />
        </div>
        <p className="mt-1.5 text-[11.5px] text-muted-foreground">
          The demo runs every enabled check with the detectors listed above. The CLI runs the offline defaults; add model
          detectors from Python.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3: simulated run                                               */
/* ------------------------------------------------------------------ */

const STAGES = [
  { label: "Connecting to source", start: 0, end: 900 },
  { label: "Reading records", start: 900, end: 4300 },
  { label: "Running detectors", start: 1400, end: 5300 },
  { label: "Merging findings", start: 5300, end: 6200 },
  { label: "Generating report", start: 6200, end: 7000 },
];
const RUN_TOTAL = 7000;

function ScanRun({ plan, onFinished }: { plan: ScanPlan; onFinished: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const finishedRef = useRef(onFinished);

  useEffect(() => {
    finishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const e = Math.min(RUN_TOTAL, now - start);
      setElapsed(e);
      if (e < RUN_TOTAL) raf = requestAnimationFrame(tick);
      else finishedRef.current();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const stats = useMemo(() => {
    const findings = createScanFromPlan(plan).findings;
    const counts: Record<Severity, number> = emptySeverityCounts();
    let hits = 0;
    for (const f of findings) {
      counts[f.severity]++;
      hits += f.detectors.length;
    }
    const detectors = Object.values(planChecks(plan)).reduce((n, d) => n + d.length, 0);
    const masked = findings.filter((f) => f.snippet.includes("••")).length;
    const top = findings.slice(0, 3);
    return { total: findings.length, counts, hits, detectors, masked, top };
  }, [plan]);

  const total = DEMO_RECORD_COUNT;
  const resource = planResource(plan);
  const endpoint = planEndpoint(plan);

  const readP = clamp((elapsed - 900) / 3400);
  const read = Math.round(total * (1 - Math.pow(1 - readP, 1.6)));
  const detP = clamp((elapsed - 1400) / 3900);
  const levels = SEVERITY_ORDER.filter((s) => s !== "info");
  const tallies = levels.map((s) => Math.round(stats.counts[s] * detP));
  const batch = plan.store === "qdrant" ? 256 : plan.store === "pinecone" ? 100 : 500;
  const batches = Math.ceil(total / batch);
  const done = elapsed >= RUN_TOTAL;
  const currentStage = [...STAGES].reverse().find((s) => elapsed >= s.start && elapsed < s.end) ?? STAGES[STAGES.length - 1];

  const logs = [
    { at: 120, text: `connecting to ${stores[plan.store].slug} ${endpoint}`.trim() },
    { at: 700, text: `connected · ${stores[plan.store].noun} ${resource} · read-only`, tone: "text-safe" },
    { at: 950, text: `streaming records in batches of ${batch}` },
    { at: 1500, text: `${plan.checks.length} checks · ${stats.detectors} detectors · ${plan.checks.join(", ")}` },
    { at: 2400, text: `batch ${Math.round(batches * 0.25)}/${batches} · ${formatNumber(Math.round(batches * 0.25) * batch)} records` },
    { at: 3300, text: `batch ${Math.round(batches * 0.62)}/${batches} · ${formatNumber(Math.round(batches * 0.62) * batch)} records` },
    { at: 4300, text: `batch ${batches}/${batches} · ${formatNumber(total)} records` },
    { at: 4900, text: "vector detectors · one nearest-neighbour table for trustrag and hubness" },
    { at: 5400, text: `merging ${stats.hits} detector hits into ${stats.total} findings` },
    { at: 5900, text: `masking secret values in ${stats.masked} snippets` },
    { at: 6300, text: "writing report.html and findings.json" },
    {
      at: 6990,
      text: `done · ${stats.total} records flagged (${formatPercent(stats.total, total)})`,
      tone: "text-safe",
    },
  ].filter((l) => elapsed >= l.at);

  return (
    <div className="space-y-4">
      <p className="sr-only" aria-live="polite">
        {done ? `Scan completed. ${stats.total} records flagged.` : currentStage.label}
      </p>

      {done ? (
        <div className="flex items-start gap-3 rounded-lg border border-safe/30 bg-safe/[0.07] px-4 py-3.5">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-safe" aria-hidden="true" />
          <div>
            <p className="text-[14px] font-medium">
              {formatNumber(total)} records scanned · {stats.total} flagged
            </p>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">Opening the report…</p>
          </div>
        </div>
      ) : (
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[12px] text-muted-foreground">Records read</div>
            <div className="type-display mt-1 text-[30px] font-semibold leading-none tabular">
              {formatNumber(read)}
              <span className="ml-2 text-[15px] font-normal text-muted-foreground">/ {formatNumber(total)}</span>
            </div>
          </div>
          <div className="font-mono text-xs text-muted-foreground tabular">{(elapsed / 1000).toFixed(1)}s</div>
        </div>
      )}

      <div className="relative h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Scan progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((elapsed / RUN_TOTAL) * 100)}>
        <div className={cn("h-full rounded-full", done ? "bg-safe" : "bg-foreground/80")} style={{ width: `${(elapsed / RUN_TOTAL) * 100}%` }} />
        {!done && (
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="h-full w-1/3 animate-scan-sweep bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <ol className="space-y-2.5" aria-label="Scan stages">
          {STAGES.map((s) => {
            const state = elapsed >= s.end ? "done" : elapsed >= s.start ? "running" : "pending";
            return (
              <li key={s.label} className="flex items-center gap-2.5 text-[13px]">
                {state === "done" && <Check className="size-4 text-safe" aria-hidden="true" />}
                {state === "running" && <LoaderCircle className="size-4 animate-spin text-foreground" aria-hidden="true" />}
                {state === "pending" && <CircleDashed className="size-4 text-muted-foreground/60" aria-hidden="true" />}
                <span className={state === "pending" ? "text-muted-foreground" : undefined}>{s.label}</span>
                <span className="sr-only">{state}</span>
              </li>
            );
          })}
        </ol>

        <div className="grid grid-cols-2 gap-2 self-start">
          {levels.map((s, i) => (
            <div key={s} className="rounded-md border px-3 py-2">
              <div className={cn("flex items-center gap-1.5 text-[11.5px]", severities[s].text)}>
                <SeverityMeter severity={s} />
                {severities[s].label}
              </div>
              <div className="type-display mt-1 text-lg font-semibold leading-none tabular">{tallies[i]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="theme-dark scrollbar-thin h-[116px] overflow-y-auto rounded-lg border bg-terminal px-3.5 py-2.5 font-mono text-[11.5px] leading-[1.75] text-terminal-foreground">
        {logs.map((l) => (
          <div key={l.at} className={cn("whitespace-pre-wrap", l.tone)}>
            <span className="select-none text-terminal-muted">{(l.at / 1000).toFixed(1).padStart(4, "0")} </span>
            {l.text}
          </div>
        ))}
        {!done && <span className="inline-block h-3 w-1.5 animate-blink bg-terminal-foreground/70" aria-hidden="true" />}
      </div>

      <div>
        <h3 className="mb-2 text-[12.5px] font-medium text-muted-foreground">First findings</h3>
        <ul className="space-y-1.5">
          {stats.top.map((f, i) => {
            const visible = elapsed >= 2600 + i * 800;
            return (
              <li key={f.record} className="flex h-9 items-center gap-3 rounded-md border px-3">
                {visible ? (
                  <>
                    <SeverityMeter severity={f.severity} />
                    <span className="min-w-0 flex-1 truncate text-[13px]">{ruleFor(f.rule).title}</span>
                    <span className="font-mono text-[12px] text-muted-foreground">{f.record}</span>
                  </>
                ) : (
                  <>
                    <Skeleton className="h-3 w-4" />
                    <Skeleton className="h-3 flex-1" />
                    <Skeleton className="h-3 w-20" />
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
