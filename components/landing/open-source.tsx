import Link from "next/link";
import { ArrowRight, Blocks, EyeOff, Laptop, Lock, Star } from "lucide-react";
import { GitHubIcon } from "@/components/brand/github-icon";
import { CopyButton, TerminalFrame } from "@/components/security/code";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { Reveal } from "./reveal";

const POINTS = [
  { icon: Lock, title: "Read-only", body: "Scan sources list and fetch. They never insert, update, or delete." },
  { icon: Laptop, title: "Offline by default", body: "Phrase rules and vector statistics. No account, no API key, no model download." },
  { icon: EyeOff, title: "Safe to forward", body: "Secret values are masked before anything is written to a report, log, or trace." },
  { icon: Blocks, title: "Extensible", body: "Stack Hugging Face classifiers, hosted guardrails, or your own detector per check." },
];

const INSTALL = [`pip install "mimvo[pgvector]"`];

const SCAN = `mimvo scan pgvector \\
  --dsn postgresql://localhost/app \\
  --table memories --text-column content \\
  --report security-report.html`;

const READOUT = [
  ["connection", "read-only (SELECT)"],
  ["runs on", "this machine"],
  ["llm api key", "not required"],
  ["masking", "on"],
];

export function OpenSource() {
  return (
    <section
      id="open-source"
      aria-labelledby="open-source-title"
      className="theme-dark relative scroll-mt-16 overflow-hidden bg-background text-foreground"
    >
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_right,black,transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:py-28">
        <Reveal>
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-7 items-center gap-2 rounded-full border bg-card px-3 font-mono text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <GitHubIcon className="size-3.5" />
            Open source · {site.license}
          </a>
          <h2
            id="open-source-title"
            className="type-display mt-6 max-w-[15ch] text-[2rem] font-semibold leading-[1.05] sm:text-[2.6rem] lg:text-[2.85rem]"
          >
            Open source. Runs where your memory lives.
          </h2>
          <p className="mt-6 max-w-xl text-[16px] leading-[1.65] text-muted-foreground">
            The scanner, every detector and every report format are on GitHub. Read the code, run it on your own machine,
            and keep your agent&apos;s memory where it is. Hosted detectors are opt-in and are the only ones that send text
            out.
          </p>

          <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            {POINTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-md border bg-card">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold">{title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={site.docs}>
                Read the docs
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href={site.github} target="_blank" rel="noreferrer">
                <Star />
                Star on GitHub
              </a>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={120} className="lg:pt-2">
          <TerminalFrame
            title="~/app · mimvo"
            actions={<CopyButton value={[...INSTALL, SCAN].join("\n")} label="Copy install and scan commands" />}
          >
            {INSTALL.map((line) => (
              <div key={line} className="whitespace-pre">
                <span className="select-none text-terminal-muted">$ </span>
                {line}
              </div>
            ))}
            <div className="mt-4">
              {SCAN.split("\n").map((line, i) => (
                <div key={i} className="whitespace-pre">
                  <span className="select-none text-terminal-muted">{i === 0 ? "$ " : "  "}</span>
                  {i === 0 ? line : line.trimStart()}
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-0.5">
              {READOUT.map(([k, v]) => (
                <div key={k} className="flex gap-4 whitespace-pre">
                  <span className="w-28 shrink-0 text-terminal-muted">{k}</span>
                  <span className={k === "masking" || k === "llm api key" ? "text-safe" : undefined}>{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <span className="text-safe">✓</span> Report written to{" "}
              <span className="underline decoration-terminal-muted underline-offset-4">security-report.html</span>
            </div>
          </TerminalFrame>
          <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
            Installs from PyPI. Python 3.11+.{" "}
            <Link href="/docs#installation" className="font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground">
              Installation guide
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
