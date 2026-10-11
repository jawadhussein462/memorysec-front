import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { GitHubIcon } from "@/components/brand/github-icon";
import { DemoForm } from "@/components/demo/demo-form";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a demo",
  description: "See Mimvo scan AI agent memory like yours, and plan detectors, CI gating and guards with the team.",
  alternates: { canonical: "/demo" },
};

const AGENDA = [
  {
    title: "A scan on memory shaped like yours",
    body: "We run Mimvo on a sample store in your setup (Chroma, Qdrant, pgvector, Pinecone, LangChain, mem0 or JSONL) and walk through the findings and action plan.",
  },
  {
    title: "The right detectors for your stack",
    body: "Offline defaults, Hugging Face classifiers, hosted guardrails, or your own model, and how to tune thresholds.",
  },
  {
    title: "A rollout plan",
    body: "Gate CI with --fail-on, send SARIF to code scanning, and guard writes and retrievals in production.",
  },
];

const delay = (ms: number) => ({ "--intro-delay": `${ms}ms` }) as CSSProperties;

export default function DemoPage() {
  return (
    <div className="theme-light theme-light-page min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="relative overflow-hidden border-b">
        <div
          aria-hidden="true"
          className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,transparent_70%)]"
        />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 lg:pb-28 lg:pt-20">
          <div>
            <p style={delay(0)} className="intro font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Book a demo
            </p>
            <h1
              style={delay(80)}
              className="intro type-display mt-5 max-w-[14ch] text-[2.5rem] font-semibold leading-[1.0] sm:text-[3.2rem] lg:text-[3.6rem]"
            >
              See Mimvo on memory like yours.
            </h1>
            <p style={delay(160)} className="intro mt-6 max-w-lg text-[17px] leading-[1.6] text-muted-foreground">
              A 30-minute call with the people who build Mimvo. Bring your questions about agent memory, poisoning and leaked
              secrets; leave with a plan.
            </p>

            <ul style={delay(240)} className="intro mt-10 space-y-5">
              {AGENDA.map((item) => (
                <li key={item.title} className="flex gap-3.5">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border bg-card">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold">{item.title}</p>
                    <p className="mt-1 max-w-md text-[14.5px] leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div style={delay(320)} className="intro mt-12 max-w-lg rounded-xl border border-dashed bg-card/60 p-5">
              <p className="text-[15px] font-semibold">Prefer to start on your own?</p>
              <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
                Mimvo is open source under {site.license}. Install it from PyPI and run your first scan in a few minutes.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link href={site.docs}>
                    Try open source
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <a href={site.github} target="_blank" rel="noreferrer">
                    <GitHubIcon />
                    GitHub
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div style={delay(200)} className="intro lg:pt-2">
            <DemoForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
