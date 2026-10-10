"use client";

import { useEffect, useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { TerminalFrame } from "@/components/security/code";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/* The output below is what `mimvo scan` prints, line for line (format_scan_summary with the findings table). */

const SCAN_DONE = 2900;
const END = 4700;

const ROWS = [
  { sev: "critical", tone: "text-sev-critical", rule: "secret_detected       ", rec: "mem_4b7e21", act: "delete    ", conf: "1.00", owasp: "LLM02" },
  { sev: "high    ", tone: "text-sev-high", rule: "persistent_instruction", rec: "mem_8f293a", act: "review    ", conf: "0.99", owasp: "LLM01" },
  { sev: "high    ", tone: "text-sev-high", rule: "destination_redirect  ", rec: "mem_5d02af", act: "review    ", conf: "0.95", owasp: "ASI06" },
  { sev: "high    ", tone: "text-sev-high", rule: "memory_poisoning      ", rec: "mem_19bd82", act: "quarantine", conf: "0.95", owasp: "ASI06" },
];

function Line({ at, t, children, className }: { at: number; t: number; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("whitespace-pre transition-opacity duration-300", t >= at ? "opacity-100" : "opacity-0", className)}>
      {children ?? " "}
    </div>
  );
}

const Prompt = () => <span className="select-none text-terminal-muted">$ </span>;

/**
 * The page's one orchestrated moment: a scan plays out once on load.
 * Every line is always rendered (only faded), so the layout never shifts.
 */
export function HeroTerminal() {
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (reduced) {
      setT(END);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const e = now - start;
      setT(Math.min(e, END));
      if (e < END) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, run]);

  const done = t >= END;
  const waiting = t >= 1300 && t < SCAN_DONE;

  return (
    <TerminalFrame
      title="~/agent · mimvo"
      className="self-start"
      actions={
        <button
          type="button"
          onClick={() => {
            setT(0);
            setRun((r) => r + 1);
          }}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-terminal-muted transition-[opacity,color] hover:text-terminal-foreground",
            done && !reduced ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-label="Replay scan animation"
          tabIndex={done && !reduced ? 0 : -1}
        >
          <RotateCcw className="size-3.5" />
          Replay
        </button>
      }
    >
      <div className="overflow-x-auto">
        <Line at={0} t={t}>
          <Prompt />
          git clone https://github.com/jawadhussein462/mimvo &amp;&amp; cd mimvo
        </Line>
        <Line at={420} t={t}>
          <Prompt />
          uv sync --extra qdrant <span className="text-terminal-muted">&amp;&amp; source .venv/bin/activate</span>
        </Line>
        <Line at={700} t={t} />
        <Line at={820} t={t}>
          <Prompt />
          mimvo scan qdrant --url http://localhost:6333 \
        </Line>
        <Line at={940} t={t}>{"    --collection agent_memory --report report.html"}</Line>
        <Line at={1060} t={t}>
          {waiting ? (
            <span className="inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] animate-blink bg-terminal-foreground/80" />
          ) : null}
        </Line>
        <Line at={SCAN_DONE} t={t}>
          <span className="text-safe">✓</span> Scanned 48,291 records
        </Line>
        <Line at={SCAN_DONE + 140} t={t}>
          <span className="text-sev-medium">!</span> 137 records flagged (0.28%)
        </Line>
        <Line at={SCAN_DONE + 260} t={t}>
          {"  "}
          <span className="text-sev-critical">• 12 critical</span>
          {"  "}
          <span className="text-sev-high">• 31 high</span>
          {"  "}
          <span className="text-sev-medium">• 58 medium</span>
          {"  "}
          <span className="text-sev-low">• 36 low</span>
        </Line>
        <Line at={SCAN_DONE + 340} t={t} />
        <Line at={SCAN_DONE + 420} t={t} className="text-terminal-muted">
          {"  SEVERITY  RULE                    RECORD      ACTION      CONF  OWASP"}
        </Line>
        {ROWS.map((r, i) => (
          <Line key={r.rec} at={SCAN_DONE + 520 + i * 110} t={t}>
            {"  "}
            <span className={r.tone}>{r.sev}</span>
            {`  ${r.rule}  ${r.rec}  ${r.act}  ${r.conf}  ${r.owasp}`}
          </Line>
        ))}
        <Line at={SCAN_DONE + 1020} t={t} className="text-terminal-muted">
          {"  ⋮"}
        </Line>
        <Line at={SCAN_DONE + 1120} t={t} />
        <Line at={SCAN_DONE + 1220} t={t}>
          <span className="text-safe">✓</span> Report written to{" "}
          <span className="underline decoration-terminal-muted underline-offset-4">report.html</span>
        </Line>
        <Line at={END} t={t}>
          <Prompt />
          <span className="inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] animate-blink bg-terminal-foreground/80" />
        </Line>
      </div>
    </TerminalFrame>
  );
}
