import { cn } from "@/lib/utils";

/**
 * Scan corners framing three memory records; the middle record ends in a
 * detached segment, the one entry that doesn't belong, in the high-severity
 * color. Legible at 16–20px. Matches docs/assets in the mimvo repo.
 */
export function LogoMark({ className, flag = true }: { className?: string; flag?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn("size-5 shrink-0", className)}>
      <path
        d="M3 8V4.5A1.5 1.5 0 0 1 4.5 3H8M16 3h3.5A1.5 1.5 0 0 1 21 4.5V8M21 16v3.5a1.5 1.5 0 0 1-1.5 1.5H16M8 21H4.5A1.5 1.5 0 0 1 3 19.5V16"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <rect x="7" y="7.25" width="10" height="2.3" rx="1.15" fill="currentColor" />
      <rect x="7" y="10.85" width="5.6" height="2.3" rx="1.15" fill="currentColor" />
      <rect
        x="14.4"
        y="10.85"
        width="2.6"
        height="2.3"
        rx="1.15"
        fill={flag ? "hsl(var(--sev-high))" : "currentColor"}
        opacity={flag ? 1 : 0.42}
      />
      <rect x="7" y="14.45" width="10" height="2.3" rx="1.15" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-foreground", className)}>
      <LogoMark className={markClassName} />
      <span className="type-display text-[17px] font-bold leading-none tracking-[-0.04em]">mimvo</span>
    </span>
  );
}
