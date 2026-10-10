import type { ReactNode } from "react";
import { Info, TriangleAlert } from "lucide-react";
import { CopyButton } from "@/components/security/code";
import { cn } from "@/lib/utils";

/* Building blocks for /docs. Server components; only the copy button runs on the client. */

const ANCHOR_OFFSET = "scroll-mt-32 lg:scroll-mt-24";

function Anchor({ id, label }: { id: string; label: string }) {
  return (
    <a
      href={`#${id}`}
      aria-label={`Link to ${label}`}
      className="ml-2 align-middle font-mono text-[0.6em] font-normal text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
    >
      #
    </a>
  );
}

export function DocSection({ id, title, lead, children }: { id: string; title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("mt-14 border-t pt-12 first:mt-0 first:border-t-0 first:pt-0", ANCHOR_OFFSET)}>
      <h2 id={`${id}-title`} className="group type-display text-[1.7rem] font-semibold leading-tight sm:text-[2rem]">
        {title}
        <Anchor id={id} label={title} />
      </h2>
      {lead && <p className="mt-3 text-[17px] leading-[1.65] text-muted-foreground">{lead}</p>}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

export function H3({ id, children }: { id: string; children: string }) {
  return (
    <h3 id={id} className={cn("group pt-4 text-[1.2rem] font-semibold leading-snug", ANCHOR_OFFSET)}>
      {children}
      <Anchor id={id} label={children} />
    </h3>
  );
}

export function H4({ children }: { children: ReactNode }) {
  return <h4 className="pt-2 text-[15px] font-semibold">{children}</h4>;
}

export function P({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[15.5px] leading-[1.75] text-foreground/85", className)}>{children}</p>;
}

/** Inline code. */
export function C({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-[4px] border border-border/70 bg-muted px-[0.35em] py-[0.1em] font-mono text-[0.84em] text-foreground">
      {children}
    </code>
  );
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  const external = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
    >
      {children}
    </a>
  );
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-[15.5px] leading-[1.7] text-foreground/85 marker:text-muted-foreground">{children}</ul>
  );
}

/** Code block on the dark terminal surface, with a copy button. Comments are dimmed for shell, Python and YAML. */
export function Code({ code, lang = "bash", title }: { code: string; lang?: "bash" | "python" | "yaml" | "json" | "text"; title?: string }) {
  const value = code.replace(/^\n+|\s+$/g, "");
  const dimComments = lang === "bash" || lang === "python" || lang === "yaml";
  return (
    <div className="theme-dark overflow-hidden rounded-lg border bg-terminal text-terminal-foreground">
      <div className="flex h-9 items-center gap-2 border-b pl-4 pr-1.5">
        <span className="font-mono text-[11px] text-terminal-muted">{title ?? lang}</span>
        <CopyButton value={value} label="Copy code" className="ml-auto" />
      </div>
      <pre className="scrollbar-thin overflow-x-auto px-4 py-3.5 font-mono text-[12.5px] leading-[1.7] sm:text-[13px]">
        <code>
          {value.split("\n").map((line, i) => {
            const at = dimComments ? commentStart(line) : -1;
            return (
              <span key={i} className="block min-h-[1.7em]">
                {at < 0 ? (
                  line
                ) : (
                  <>
                    {line.slice(0, at)}
                    <span className="text-terminal-muted">{line.slice(at)}</span>
                  </>
                )}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

/** Index of a `#` comment that is not inside quotes (good enough for the snippets on this page). */
function commentStart(line: string) {
  let quote: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === "#" && (i === 0 || /\s/.test(line[i - 1]))) {
      return i;
    }
  }
  return -1;
}

export function Table({
  head,
  rows,
  numeric = [],
  caption,
}: {
  head: ReactNode[];
  rows: ReactNode[][];
  /** Column indexes to right-align. */
  numeric?: number[];
  caption?: string;
}) {
  return (
    <div className="scrollbar-thin overflow-x-auto rounded-lg border bg-card">
      <table className="w-full min-w-[520px] text-left text-[13.5px] leading-snug">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b bg-muted/50 text-[12.5px] text-muted-foreground">
            {head.map((h, i) => (
              <th key={i} scope="col" className={cn("px-3.5 py-2.5 font-medium", numeric.includes(i) && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b align-top last:border-0">
              {row.map((cell, i) => (
                <td key={i} className={cn("px-3.5 py-2.5", numeric.includes(i) && "text-right tabular")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Callout({ tone = "note", title, children }: { tone?: "note" | "warn"; title?: string; children: ReactNode }) {
  const Icon = tone === "warn" ? TriangleAlert : Info;
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border px-4 py-3.5 text-[14.5px] leading-[1.65]",
        tone === "warn" ? "border-sev-medium/35 bg-sev-medium/[0.06]" : "bg-card",
      )}
    >
      <Icon className={cn("mt-1 size-4 shrink-0", tone === "warn" ? "text-sev-medium" : "text-muted-foreground")} aria-hidden="true" />
      <div className="min-w-0 text-foreground/85">
        {title && <p className="font-semibold text-foreground">{title}</p>}
        <div className={cn(title && "mt-1")}>{children}</div>
      </div>
    </div>
  );
}

/** Numbered step used in the install and quickstart walkthroughs. */
export function Steps({ children }: { children: ReactNode }) {
  return <ol className="relative space-y-6 border-l pl-6 [counter-reset:step]">{children}</ol>;
}

export function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="relative [counter-increment:step] before:absolute before:-left-[calc(2.25rem+0.5px)] before:top-0 before:grid before:size-6 before:place-items-center before:rounded-full before:border before:bg-background before:font-mono before:text-[11px] before:content-[counter(step)]">
      <p className="text-[15px] font-semibold leading-6">{title}</p>
      <div className="mt-2 space-y-3">{children}</div>
    </li>
  );
}
