"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn, copyText } from "@/lib/utils";

export function CopyButton({
  value,
  label = "Copy to clipboard",
  className,
  onCopied,
}: {
  value: string;
  label?: string;
  className?: string;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyText(value)) {
          setCopied(true);
          onCopied?.();
        }
      }}
      aria-label={label}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}

/** Dark terminal chrome. Always renders with dark tokens, whatever the page theme. */
export function TerminalFrame({
  title,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        "theme-dark overflow-hidden rounded-xl border bg-terminal text-terminal-foreground shadow-[0_32px_80px_-40px_rgba(6,10,14,0.6)]",
        className,
      )}
    >
      <div className="flex h-10 items-center gap-2 border-b px-4">
        <Terminal className="size-3.5 text-terminal-muted" aria-hidden="true" />
        <span className="font-mono text-xs text-terminal-muted">{title}</span>
        <div className="ml-auto flex items-center gap-1">{actions}</div>
      </div>
      <div className={cn("scrollbar-thin relative overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.75] sm:p-5 sm:text-[13px]", bodyClassName)}>
        {children}
      </div>
    </div>
  );
}

/** Multi-line shell command with a $ prompt and continuation indent. */
export function ShellCommand({ command, className }: { command: string; className?: string }) {
  const lines = command.split("\n");
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <div key={i} className="whitespace-pre">
          <span className="select-none text-terminal-muted">{i === 0 ? "$ " : "  "}</span>
          {i === 0 ? line : line.replace(/^\s+/, "  ")}
        </div>
      ))}
    </div>
  );
}

export function CommandBox({ command, className }: { command: string; className?: string }) {
  return (
    <div
      className={cn(
        "theme-dark flex items-center gap-3 rounded-lg border bg-terminal py-2 pl-4 pr-2 font-mono text-[13px] text-terminal-foreground",
        className,
      )}
    >
      <span className="select-none text-terminal-muted">$</span>
      <span className="min-w-0 flex-1 truncate">{command}</span>
      <CopyButton value={command} label={`Copy: ${command}`} />
    </div>
  );
}
