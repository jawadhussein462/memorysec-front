"use client";

import type { ReactNode } from "react";
import { ArrowUpRight, Braces, CircleCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/security/code";
import { MaskedText } from "@/components/security/masked-text";
import { SeverityBadge } from "@/components/security/severity";
import { Button } from "@/components/ui/button";
import { InfoTip } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { actions, checkLabel, cweUrl, owaspId, ruleFor } from "@/lib/catalog";
import { formatConfidence, sourceLabel } from "@/lib/report";
import { findingToJson } from "@/lib/report-io";
import { site } from "@/lib/site";
import type { Finding, Scan } from "@/lib/types";
import { cn, copyText } from "@/lib/utils";

function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h3 className="text-[12.5px] font-medium text-muted-foreground">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function FindingSheet({
  finding,
  scan,
  open,
  onOpenChange,
  reviewed,
  onToggleReviewed,
}: {
  finding: Finding | null;
  scan: Scan | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewed: boolean;
  onToggleReviewed: (id: string) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 sm:max-w-[600px]">
        {finding && scan && (
          <FindingDetail finding={finding} scan={scan} reviewed={reviewed} onToggleReviewed={onToggleReviewed} />
        )}
      </SheetContent>
    </Sheet>
  );
}

const EVIDENCE_LABELS: Record<string, string> = {
  kinds: "Kinds",
  matches: "Matched phrases",
  cluster: "Cluster members",
  cluster_size: "Cluster size",
  similarity_metric: "Similarity from",
  min_similarity: "Min. similarity",
  min_rouge_l: "Min. ROUGE-L",
  contradicted_by: "Contradicted by",
  contradiction: "Contradiction score",
  k_occurrence: "Neighbour of",
  k: "k",
  cutoff: "Cutoff",
  cosine: "Cosine to re-embedding",
  min_cosine: "Min. cosine",
  perplexity: "Perplexity",
  threshold: "Threshold",
  model: "Model",
  provider: "Provider",
};

function evidenceValue(value: unknown): ReactNode {
  if (Array.isArray(value)) {
    return (
      <span className="flex flex-wrap gap-1">
        {value.map((v, i) => (
          <span key={i} className="rounded-[4px] border bg-muted/50 px-1.5 py-px font-mono text-[11.5px]">
            {String(v)}
          </span>
        ))}
      </span>
    );
  }
  if (value !== null && typeof value === "object") {
    return (
      <span className="font-mono text-[12px]">
        {Object.entries(value as Record<string, unknown>)
          .map(([k, v]) => `${k} ${String(v)}`)
          .join(" · ")}
      </span>
    );
  }
  return <span className="font-mono text-[12.5px]">{value === null ? "null" : String(value)}</span>;
}

function FindingDetail({
  finding: f,
  scan,
  reviewed,
  onToggleReviewed,
}: {
  finding: Finding;
  scan: Scan;
  reviewed: boolean;
  onToggleReviewed: (id: string) => void;
}) {
  const rule = ruleFor(f.rule);
  const action = actions[f.action];
  const ActionIcon = action.icon;
  const scores = (f.evidence.scores ?? {}) as Record<string, unknown>;
  const evidenceRows = Object.entries(f.evidence).filter(([k]) => k !== "scores" && k !== "detectors");
  const agreed = f.detectors.length;

  const contextRows = [
    { label: "Source", value: sourceLabel(scan), mono: true },
    { label: "Record id", value: f.record, mono: true },
    { label: "Check", value: `${f.check} · ${checkLabel(f.check)}` },
    { label: "Rule", value: f.rule, mono: true },
    ...(f.created ? [{ label: "Created", value: f.created }] : []),
    ...(f.context ?? []),
    { label: "Fingerprint", value: f.fingerprint, mono: true },
    { label: "Scan", value: `${scan.name} · ${scan.id}` },
  ];

  const copyJson = async () => {
    const ok = await copyText(JSON.stringify(findingToJson(f), null, 2));
    if (ok) toast.success("Finding JSON copied", { description: `${f.record} · same shape as ScanFinding in --json` });
    else toast.error("Couldn't access the clipboard", { description: "Your browser blocked clipboard access." });
  };

  return (
    <div className="flex h-full flex-col">
      <header className="border-b px-6 pb-5 pt-5">
        <div className="flex flex-wrap items-center gap-2 pr-10">
          <SeverityBadge severity={f.severity} />
          <a
            href={rule.owaspUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-[4px] border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {owaspId(f.owasp)}
          </a>
          <code className="rounded-[4px] border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{f.rule}</code>
          {reviewed && (
            <span className="inline-flex items-center gap-1 text-xs text-safe">
              <CircleCheck className="size-3.5" aria-hidden="true" />
              Reviewed
            </span>
          )}
        </div>
        <SheetTitle className="type-display mt-3 text-[22px] font-semibold leading-tight">{f.title}</SheetTitle>
        <SheetDescription className="mt-1 text-[13.5px]">{f.message}</SheetDescription>
        <div className="mt-3 flex items-center gap-1 font-mono text-[13px]">
          <span className="text-muted-foreground">Record</span>
          <span className="ml-1.5 min-w-0 truncate">{f.record}</span>
          <CopyButton value={f.record} label={`Copy ${f.record}`} className="size-6" />
        </div>
      </header>

      <div className="scrollbar-thin flex-1 space-y-7 overflow-y-auto px-6 py-6">
        <Section
          title="Masked excerpt"
          aside={
            <span className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground">
              <Lock className="size-3" aria-hidden="true" />
              Secret values masked
            </span>
          }
        >
          <pre className="scrollbar-thin relative overflow-x-auto whitespace-pre-wrap break-words rounded-lg border bg-background px-4 py-3.5 font-mono text-[12.5px] leading-[1.7]">
            {f.snippet ? <MaskedText text={f.snippet} /> : <span className="text-muted-foreground">No excerpt in this report.</span>}
          </pre>
        </Section>

        <Section
          title="Why it was flagged"
          aside={
            <InfoTip label="About confidence">
              Each detector scores its hit. When several detectors raise the same code on a record they merge into one
              finding with confidence 1 − Π(1 − score): two detectors at 0.7 give 0.91.
            </InfoTip>
          }
        >
          <div className="rounded-lg border">
            <div className="flex items-center justify-between border-b px-3.5 py-2.5 text-[13px]">
              <span className="font-medium">
                {agreed > 1 ? `${agreed} detectors agreed` : agreed === 1 ? "1 detector raised this" : "No detector listed"}
              </span>
              <span className="font-mono text-[12px]">
                <span className="text-muted-foreground">confidence </span>
                {formatConfidence(f.confidence)}
              </span>
            </div>
            <ul className="divide-y">
              {f.detectors.map((d) => {
                const score = typeof scores[d] === "number" ? (scores[d] as number) : null;
                return (
                  <li key={d} className="grid grid-cols-[minmax(0,1fr)_7rem_2.75rem] items-center gap-3 px-3.5 py-2.5">
                    <span className="truncate font-mono text-[12.5px]">{d}</span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                      {score !== null && (
                        <span className="block h-full rounded-full bg-foreground/70" style={{ width: `${score * 100}%` }} />
                      )}
                    </span>
                    <span className="text-right font-mono text-[12.5px] tabular">{formatConfidence(score)}</span>
                  </li>
                );
              })}
            </ul>
            {evidenceRows.length > 0 && (
              <dl className="divide-y border-t text-[13px]">
                {evidenceRows.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3 px-3.5 py-2">
                    <dt className="text-muted-foreground">{EVIDENCE_LABELS[k] ?? k}</dt>
                    <dd className="min-w-0 break-words">{evidenceValue(v)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </Section>

        <Section title="How to fix">
          <ol className="list-decimal space-y-1.5 pl-5 text-[14px] leading-relaxed marker:text-muted-foreground">
            {f.remediation.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </Section>

        <Section title="Recommended action">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg border bg-card">
                <ActionIcon className="size-[18px]" aria-hidden="true" />
              </span>
              <div>
                <div className="type-display text-xl font-semibold leading-none">{action.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{action.meaning}</div>
              </div>
            </div>
            <p className="mt-3.5 flex items-start gap-2 border-t pt-3 text-[12.5px] leading-snug text-muted-foreground">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              The action comes from the rule, not from the detector. Mimvo connects read-only and has not changed this
              record; apply the fix in your memory store.
            </p>
          </div>
        </Section>

        <Section title="References">
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px]">
            {[
              { label: f.owasp, href: rule.owaspUrl },
              ...f.cwe.map((c) => ({ label: c, href: cweUrl(c) })),
              { label: "Mimvo rules", href: site.rulesDocs },
            ].map((ref) => (
              <li key={ref.label}>
                <a
                  href={ref.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  {ref.label}
                  <ArrowUpRight className="size-3 opacity-60" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Context">
          <dl className="divide-y rounded-lg border text-[13px]">
            {contextRows.map((row) => (
              <div key={row.label} className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3 px-3.5 py-2">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className={cn("min-w-0 break-words", row.mono && "font-mono text-[12.5px]")}>{row.value}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t px-6 py-4">
        <Button variant={reviewed ? "secondary" : "default"} onClick={() => onToggleReviewed(f.id)} aria-pressed={reviewed}>
          <CircleCheck />
          {reviewed ? "Reviewed" : "Mark reviewed"}
        </Button>
        <Button variant="secondary" onClick={copyJson}>
          <Braces />
          Copy finding JSON
        </Button>
      </footer>
    </div>
  );
}
