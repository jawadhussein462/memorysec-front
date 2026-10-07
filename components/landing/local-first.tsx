import { EyeOff, Laptop, Lock } from "lucide-react";
import { ShellCommand, TerminalFrame, CopyButton } from "@/components/security/code";

const POINTS = [
  { icon: Lock, title: "Read only", body: "Never mutates the source memory store during scanning." },
  { icon: Laptop, title: "Local by default", body: "Runs alongside your existing stack. No account, no hosted service." },
  { icon: EyeOff, title: "Safe reports", body: "Secrets are masked before they appear in scan reports." },
];

const COMMAND = `memorysec scan pgvector \\
  --dsn postgresql://localhost/app \\
  --table memories \\
  --text-column content \\
  --report security-report.html`;

const READOUT = [
  ["source", "pgvector / memories"],
  ["connection", "read-only (SELECT)"],
  ["runs on", "this machine"],
  ["llm api key", "not required"],
  ["batch size", "512 records"],
  ["masking", "on"],
];

export function LocalFirst() {
  return (
    <section id="security" aria-labelledby="security-title" className="theme-dark relative scroll-mt-16 overflow-hidden bg-background text-foreground">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_right,black,transparent_70%)]" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:py-28">
        <div>
          <h2 id="security-title" className="type-display max-w-[15ch] text-[2rem] font-semibold leading-[1.05] sm:text-[2.6rem] lg:text-[2.85rem]">
            Your memory doesn&apos;t need to leave your machine.
          </h2>
          <p className="mt-6 max-w-xl text-[16px] leading-[1.65] text-muted-foreground">
            MemorySec&apos;s default scan can run locally without an LLM API key. Connections are read-only, records stream
            in batches, and sensitive snippets shown in reports are masked.
          </p>
          <ul className="mt-10 divide-y border-y">
            {POINTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4 py-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-md border bg-card">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold">{title}</h3>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:pt-2">
          <TerminalFrame
            title="~/app · memorysec"
            actions={<CopyButton value={COMMAND} label="Copy pgvector scan command" />}
          >
            <ShellCommand command={COMMAND} />
            <div className="mt-4 space-y-0.5">
              {READOUT.map(([k, v]) => (
                <div key={k} className="flex gap-4 whitespace-pre">
                  <span className="w-28 shrink-0 text-terminal-muted">{k}</span>
                  <span className={k === "masking" || k === "llm api key" ? "text-safe" : undefined}>{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              Report written to <span className="underline decoration-terminal-muted underline-offset-4">security-report.html</span>
            </div>
          </TerminalFrame>
          <p className="mt-4 text-[13px] text-muted-foreground">
            The report is a static HTML file. Open it locally, or attach it to a ticket. No upload required.
          </p>
        </div>
      </div>
    </section>
  );
}
