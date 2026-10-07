import { Fragment } from "react";
import { cn } from "@/lib/utils";

const MASK = /(\[REDACTED\]|\[•+\]|•{2,})/g;

/** Renders evidence text, styling masked spans so they read as removed data, not content. */
export function MaskedText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(MASK);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            className={cn(
              "rounded-[3px] bg-foreground/[0.08] px-[3px] text-muted-foreground",
              part === "[REDACTED]" && "text-[0.92em] tracking-wide",
            )}
            aria-label={part === "[REDACTED]" ? "redacted" : "masked"}
          >
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </span>
  );
}
