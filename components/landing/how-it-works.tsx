import type * as React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { SeverityMeter } from "@/components/security/severity";
import { StoreGlyph } from "@/components/security/store-glyph";
import { STORE_ORDER, stores } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

const DETECTORS = ["heuristic", "gitleaks", "trustrag"];
const MATRIX: { id: string; hits: boolean[]; verdict: string; flagged: boolean }[] = [
  { id: "mem_8f293a", hits: [true, false, false], verdict: "persistent_instruction · 0.90", flagged: true },
  { id: "mem_7d10c4", hits: [false, false, false], verdict: "clean", flagged: false },
  { id: "mem_4b7e21", hits: [true, true, false], verdict: "secret_detected · 1.00 · 2 merged", flagged: true },
  { id: "mem_c2e81b", hits: [false, false, true], verdict: "poisoning_cluster · 0.97", flagged: true },
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
  { k: "id", v: "mem_4b7e21" },
  { k: "type", v: "secret_detected" },
  { k: "detectors", v: "gitleaks, heuristic" },
  { k: "confidence", v: "1.00" },
  {
    k: "snippet",
    v: (
      <>
        Use <span className="rounded-[3px] bg-foreground/[0.08] px-[3px] text-muted-foreground">••••••••</span> with secret…
      </>
    ),
  },
  { k: "action", v: "delete (recommended)" },
  { k: "owasp", v: "LLM02 · CWE-312" },
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
          is written back. Add a WriteGuard or RetrieveGuard when you also want to stop bad records in flight.
        </SectionHeading>

        <ol className="mt-14 grid grid-cols-1 overflow-hidden rounded-xl border bg-card lg:grid-cols-3">
          <li className="flex min-w-0 flex-col gap-6 border-b p-6 lg:border-b-0 lg:border-r lg:p-7">
            <StepHeader n="01" title="Connect">
              Point Mimvo at the store the agent already uses, or at a JSONL export of it.
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
              Records stream through the secrets, injection and poisoning checks. Detectors that hit the same record merge into one finding, and their scores combine into its confidence.
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
                            "mt-0.5 text-[10.5px] leading-snug",
                            row.flagged ? "text-sev-high" : "text-muted-foreground",
                          )}
                        >
                          {row.verdict}
                        </div>
                      </th>
                      {row.hits.map((h, i) => (
                        <td key={i} className="px-1.5 py-2 text-center">
                          <span
                            className={cn(
                              "inline-block size-2.5 rounded-full border",
                              h ? "border-sev-high bg-sev-high" : "border-foreground/25",
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
              Every finding names its rule, the evidence, the fix steps and a recommended action. You decide; Mimvo never edits the store.
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
              Written as HTML for people, JSON for tooling, SARIF for GitHub code scanning, and Markdown for CI.
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
