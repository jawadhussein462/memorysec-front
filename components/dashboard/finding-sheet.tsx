"use client";

import type { ReactNode } from "react";
import { Braces, CircleCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/security/code";
import { MaskedText } from "@/components/security/masked-text";
import { SeverityBadge } from "@/components/security/severity";
import { Button } from "@/components/ui/button";
import { InfoTip } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { actions, categories, stores } from "@/lib/catalog";
import { findingToJson, relativeTime } from "@/lib/report";
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
  const category = categories[f.category];
  const ActionIcon = actions[f.action].icon;
  const agreed = f.detectors.length;
  const maskedTitle =
    f.recordKind === "cluster" ? "Masked memory · representative record" : f.recordKind === "window" ? "Window summary" : "Masked memory";

  const contextRows = [
    { label: "Source", value: `${stores[scan.store].slug} / ${f.source}`, mono: true },
    { label: f.recordKind === "record" ? "Record ID" : f.recordKind === "cluster" ? "Cluster ID" : "Window ID", value: f.record, mono: true },
    { label: "Created", value: f.created },
    { label: "Detected", value: relativeTime(f.detectedSec) },
    { label: "Scanner", value: category.key, mono: true },
    { label: "Scan", value: `${scan.name} · ${scan.id}` },
    ...(f.context ?? []),
  ];

  const copyJson = async () => {
    const ok = await copyText(JSON.stringify(findingToJson(f, scan), null, 2));
    if (ok) toast.success("Finding JSON copied", { description: `${f.record} · evidence stays masked` });
    else toast.error("Couldn't access the clipboard", { description: "Your browser blocked clipboard access." });
  };

  return (
    <div className="flex h-full flex-col">
      <header className="border-b px-6 pb-5 pt-5">
        <div className="flex items-center gap-2 pr-10">
          <SeverityBadge severity={f.severity} />
          <span className="rounded-[4px] border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{f.owasp.split(" · ")[0]}</span>
          {reviewed && (
            <span className="inline-flex items-center gap-1 text-xs text-safe">
              <CircleCheck className="size-3.5" aria-hidden="true" />
              Reviewed
            </span>
          )}
        </div>
        <SheetTitle className="type-display mt-3 text-[22px] font-semibold leading-tight">{category.finding}</SheetTitle>
        <SheetDescription className="mt-1 text-[13.5px]">{f.headline}</SheetDescription>
        <div className="mt-3 flex items-center gap-1 font-mono text-[13px]">
          <span className="text-muted-foreground">{f.recordKind === "record" ? "Record" : f.recordKind === "cluster" ? "Cluster" : "Window"}</span>
          <span className="ml-1.5">{f.record}</span>
          <CopyButton value={f.record} label={`Copy ${f.record}`} className="size-6" />
        </div>
      </header>

      <div className="scrollbar-thin flex-1 space-y-7 overflow-y-auto px-6 py-6">
        <Section title="Finding">
          <p className="text-[14.5px] leading-relaxed">{f.summary}</p>
        </Section>

        {f.conflict && (
          <Section title="Conflicts with trusted memory">
            <div className="overflow-hidden rounded-lg border font-mono text-[12.5px]">
              <div className="border-b bg-safe/[0.06] px-3.5 py-2.5">
                <div className="text-[11px] text-muted-foreground">trusted · {f.conflict.record}</div>
                <div className="mt-1">{f.conflict.text}</div>
              </div>
              <div className="bg-sev-high/[0.06] px-3.5 py-2.5">
                <div className="text-[11px] text-muted-foreground">flagged · {f.record}</div>
                <div className="mt-1">{f.masked}</div>
              </div>
            </div>
          </Section>
        )}

        <Section
          title={maskedTitle}
          aside={
            <span className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground">
              <Lock className="size-3" aria-hidden="true" />
              Secrets masked
            </span>
          }
        >
          <pre className="scrollbar-thin relative overflow-x-auto whitespace-pre-wrap break-words rounded-lg border bg-background px-4 py-3.5 font-mono text-[12.5px] leading-[1.7]">
            <MaskedText text={f.masked} />
          </pre>
        </Section>

        <Section
          title="Why it was flagged"
          aside={
            <InfoTip label="About detector agreement">
              Independent detectors examine every record. Requiring agreement between them cuts false positives;
              single-detector classes (volume, similarity, contradiction) use stricter thresholds instead.
            </InfoTip>
          }
        >
          <div className="rounded-lg border">
            <div className="flex items-center justify-between border-b px-3.5 py-2.5 text-[13px]">
              <span className="font-medium">
                {agreed > 1 ? `${agreed} detectors agreed` : "1 detector flagged this record"}
              </span>
              <span className="font-mono text-[11.5px] text-muted-foreground">confidence</span>
            </div>
            <ul className="divide-y">
              {f.detectors.map((d) => (
                <li key={d.name} className="grid grid-cols-[minmax(0,1fr)_7rem_2.75rem] items-center gap-3 px-3.5 py-2.5">
                  <span className="truncate font-mono text-[12.5px]">{d.name}</span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <span className="block h-full rounded-full bg-foreground/70" style={{ width: `${d.confidence * 100}%` }} />
                  </span>
                  <span className="text-right font-mono text-[12.5px] tabular">{d.confidence.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section title="Recommended action">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg border bg-card">
                <ActionIcon className="size-[18px]" aria-hidden="true" />
              </span>
              <div>
                <div className="type-display text-xl font-semibold leading-none">{f.action}</div>
                <div className="mt-1 text-xs text-muted-foreground">{actions[f.action].meaning}</div>
              </div>
            </div>
            <p className="mt-3.5 text-[14px] leading-relaxed">{f.actionDetail}</p>
            <p className="mt-3 flex items-start gap-2 border-t pt-3 text-[12.5px] leading-snug text-muted-foreground">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              This is a recommendation. MemorySec connects read-only and has not changed this record; apply the fix in
              your memory store.
            </p>
          </div>
        </Section>

        <Section title="Context">
          <dl className="divide-y rounded-lg border text-[13px]">
            {contextRows.map((row) => (
              <div key={row.label} className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3 px-3.5 py-2">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className={cn("min-w-0 break-words", row.mono && "font-mono text-[12.5px]")}>{row.value}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3 px-3.5 py-2">
              <dt className="text-muted-foreground">OWASP</dt>
              <dd className="min-w-0">{f.owasp}</dd>
            </div>
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
