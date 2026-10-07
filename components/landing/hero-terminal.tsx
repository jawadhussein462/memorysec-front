"use client";

import { useEffect, useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { TerminalFrame } from "@/components/security/code";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { clamp, cn, formatNumber } from "@/lib/utils";

const TOTAL = 48291;
const END = 4700;
const PROGRESS = { start: 1750, end: 3350 };
const SEVERITY_ROWS = [
  { n: 12, label: "critical", tone: "text-sev-critical", bar: "bg-sev-critical" },
  { n: 31, label: "high", tone: "text-sev-high", bar: "bg-sev-high" },
  { n: 58, label: "medium", tone: "text-sev-medium", bar: "bg-sev-medium" },
  { n: 36, label: "low", tone: "text-sev-low", bar: "bg-sev-low" },
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

  const p = clamp((t - PROGRESS.start) / (PROGRESS.end - PROGRESS.start));
  const eased = 1 - Math.pow(1 - p, 2.2);
  const count = Math.round(TOTAL * eased);
  const done = t >= END;

  return (
    <TerminalFrame
      title="~/agent · memorysec"
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
      <div>
        <Line at={0} t={t}>
          <Prompt />
          pip install memorysec
        </Line>
        <Line at={420} t={t} className="text-terminal-muted">
          Successfully installed memorysec
        </Line>
        <Line at={700} t={t} />
        <Line at={820} t={t}>
          <Prompt />
          memorysec scan qdrant \
        </Line>
        <Line at={940} t={t}>{"    --url http://localhost:6333 \\"}</Line>
        <Line at={1060} t={t}>{"    --collection agent_memory \\"}</Line>
        <Line at={1180} t={t}>{"    --report report.html"}</Line>
        <Line at={1300} t={t} />
        <Line at={1500} t={t}>
          <span className="text-safe">●</span> <span className="text-terminal-muted">connected</span> qdrant / agent_memory{" "}
          <span className="text-terminal-muted">(read-only)</span>
        </Line>
        <Line at={PROGRESS.start} t={t} className="flex items-center gap-3">
          <span className="text-terminal-muted">scanning</span>
          <span className="relative h-1.5 w-28 overflow-hidden rounded-full bg-white/10 sm:w-40">
            <span className="absolute inset-y-0 left-0 rounded-full bg-terminal-foreground/80" style={{ width: `${eased * 100}%` }} />
          </span>
          <span className="tabular">
            {formatNumber(count)} / {formatNumber(TOTAL)}
          </span>
        </Line>
        <Line at={PROGRESS.end + 80} t={t} />
        <Line at={PROGRESS.end + 120} t={t}>
          <span className="text-safe">✓</span> Scanned {formatNumber(TOTAL)} records
        </Line>
        <Line at={PROGRESS.end + 260} t={t}>
          <span className="text-sev-high">!</span> 137 records flagged <span className="text-terminal-muted">(0.28%)</span>
        </Line>
        <Line at={PROGRESS.end + 340} t={t} />
        {SEVERITY_ROWS.map((row, i) => (
          <Line key={row.label} at={PROGRESS.end + 420 + i * 110} t={t} className="flex items-center">
            <span className="w-8 text-right tabular">{row.n}</span>
            <span className={cn("ml-2 w-16", row.tone)}>{row.label}</span>
            <span
              className={cn("ml-2 h-2 rounded-[2px] opacity-80", row.bar)}
              style={{ width: `${(row.n / 58) * 9}rem` }}
              aria-hidden="true"
            />
          </Line>
        ))}
        <Line at={PROGRESS.end + 900} t={t} />
        <Line at={PROGRESS.end + 980} t={t}>
          Report written to <span className="underline decoration-terminal-muted underline-offset-4">report.html</span>
        </Line>
        <Line at={END} t={t}>
          <Prompt />
          <span className="inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] animate-blink bg-terminal-foreground/80" />
        </Line>
      </div>
    </TerminalFrame>
  );
}
