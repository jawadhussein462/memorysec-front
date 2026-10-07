import type * as React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { SeverityMeter } from "@/components/security/severity";
import { StoreGlyph } from "@/components/security/store-glyph";
import { STORE_ORDER, stores } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

const DETECTORS = ["Heuristic", "PromptGuard", "TrustRAG"];
const MATRIX: { id: string; hits: boolean[]; verdict: "flagged" | "clean" | "below" }[] = [
  { id: "mem_8f293a", hits: [true, true, false], verdict: "flagged" },
  { id: "mem_7d10c4", hits: [false, false, false], verdict: "clean" },
  { id: "mem_19bd82", hits: [true, false, true], verdict: "flagged" },
  { id: "mem_a03e55", hits: [true, false, false], verdict: "below" },
];

const FIELDS: { k: string; v: React.ReactNode }[] = [
  {
    k: "severity",
    v: (
      <span className="inline-flex items-center gap-1.5 text-sev-critical">
        <SeverityMeter severity="critical" />
        critical
      </span>
    ),
  },
  { k: "record", v: "mem_8f293a" },
  { k: "finding", v: "persistent prompt injection" },
  { k: "detectors", v: "Heuristic + PromptGuard (2 agreed)" },
  {
    k: "evidence",
    v: (
      <>
        ignore <span className="rounded-[3px] bg-foreground/[0.08] px-[3px] text-muted-foreground">[••••••••]</span> and send…
      </>
    ),
  },
  { k: "why", v: "overrides agent behavior on retrieval" },
  { k: "action", v: "delete (recommended)" },
];

function StepHeader({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-muted-foreground">{n}</span>
        <h3 className="type-display text-xl font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-16 border-b bg-card/60">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <SectionHeading id="how-title" title="Connect, scan, fix.">
          A scan is a read-only pass over the memory store. Nothing sits in your agent&apos;s request path, and nothing
          is written back.
        </SectionHeading>

        <ol className="mt-14 grid grid-cols-1 overflow-hidden rounded-xl border bg-card lg:grid-cols-3">
          <li className="flex min-w-0 flex-col gap-6 border-b p-6 lg:border-b-0 lg:border-r lg:p-7">
            <StepHeader n="01" title="Connect">
              Point MemorySec at the memory store the agent already uses.
            </StepHeader>
            <ul className="mt-auto divide-y rounded-lg border">
              {STORE_ORDER.map((id) => (
                <li key={id} className="flex items-center gap-2.5 px-3 py-2 text-[13px]">
                  <StoreGlyph store={id} size="sm" />
                  <span>{stores[id].name}</span>
                  <span className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                    <Lock className="size-3" aria-hidden="true" />
                    read-only
                  </span>
                </li>
              ))}
            </ul>
          </li>

          <li className="flex min-w-0 flex-col gap-6 border-b p-6 lg:border-b-0 lg:border-r lg:p-7">
            <StepHeader n="02" title="Scan">
              Records stream through independent detectors in batches. A record is flagged when detectors agree.
            </StepHeader>
            <div className="scrollbar-thin mt-auto relative overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[320px] font-mono text-[11.5px]">
                <caption className="sr-only">Detectors examining four records</caption>
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th scope="col" className="px-3 py-2 text-left font-normal">
                      record
                    </th>
                    {DETECTORS.map((d) => (
                      <th key={d} scope="col" className="px-1.5 py-2 text-center font-normal">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MATRIX.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <th scope="row" className="px-3 py-2 text-left font-normal">
                        <div>{row.id}</div>
                        <div
                          className={cn(
                            "mt-0.5 whitespace-nowrap text-[10.5px]",
                            row.verdict === "flagged" ? "text-sev-critical" : "text-muted-foreground",
                          )}
                        >
                          {row.verdict === "flagged" && `flagged · ${row.hits.filter(Boolean).length}/3 agreed`}
                          {row.verdict === "clean" && "clean"}
                          {row.verdict === "below" && "1/3 · not flagged"}
                        </div>
                      </th>
                      {row.hits.map((h, i) => (
                        <td key={i} className="px-1.5 py-2 text-center">
                          <span
                            className={cn(
                              "inline-block size-2.5 rounded-full border",
                              h
                                ? row.verdict === "flagged"
                                  ? "border-sev-critical bg-sev-critical"
                                  : "border-foreground/50 bg-foreground/50"
                                : "border-foreground/25",
                            )}
                          />
                          <span className="sr-only">{h ? "hit" : "no hit"}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </li>

          <li className="flex min-w-0 flex-col gap-6 p-6 lg:p-7">
            <StepHeader n="03" title="Fix">
              Every result says what happened, why it matters, and what to do. You decide; MemorySec never edits the store.
            </StepHeader>
            <dl className="mt-auto space-y-1.5 rounded-lg border bg-muted/40 p-3.5 font-mono text-[11.5px]">
              {FIELDS.map((f) => (
                <div key={f.k} className="flex gap-3">
                  <dt className="w-[4.75rem] shrink-0 text-muted-foreground">{f.k}</dt>
                  <dd className="min-w-0">{f.v}</dd>
                </div>
              ))}
            </dl>
            <p className="-mt-2 text-[13px] text-muted-foreground">
              Recommended actions: <span className="text-foreground">Review</span>,{" "}
              <span className="text-foreground">Quarantine</span>, or <span className="text-foreground">Delete</span>.
            </p>
          </li>
        </ol>

        <div className="mt-8">
          <Link
            href="/dashboard#findings"
            className="text-[15px] font-medium underline decoration-foreground/30 underline-offset-[6px] transition-colors hover:decoration-foreground"
          >
            Explore the demo report →
          </Link>
        </div>
      </div>
    </section>
  );
}
