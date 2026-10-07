import { CircleCheck } from "lucide-react";
import { actions, riskTone, severities } from "@/lib/catalog";
import type { RemediationAction, RiskLevel, Severity } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Four ascending bars: severity reads from shape as well as color,
 * so it survives color blindness and grayscale screenshots.
 */
export function SeverityMeter({ severity, className }: { severity: Severity; className?: string }) {
  const level = severities[severity].rank;
  return (
    <span aria-hidden="true" className={cn("inline-flex h-3 items-end gap-[2px]", severities[severity].text, className)}>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn("w-[3px] rounded-[1px] bg-current", i > level && "opacity-20")}
          style={{ height: `${4 + i * 2}px` }}
        />
      ))}
    </span>
  );
}

export function SeverityBadge({
  severity,
  className,
  size = "sm",
}: {
  severity: Severity;
  className?: string;
  size?: "sm" | "md";
}) {
  const meta = severities[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[5px] border font-medium",
        size === "md" ? "h-7 px-2.5 text-[13px]" : "h-6 px-2 text-xs",
        meta.text,
        meta.soft,
        meta.border,
        className,
      )}
    >
      <SeverityMeter severity={severity} />
      {meta.label}
    </span>
  );
}

export function RiskBadge({ risk, className }: { risk: RiskLevel; className?: string }) {
  const tone = riskTone[risk];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-[5px] border px-2 text-xs font-medium",
        tone.text,
        tone.soft,
        tone.border,
        className,
      )}
    >
      {tone.severity ? <SeverityMeter severity={tone.severity} /> : <CircleCheck className="size-3.5" aria-hidden="true" />}
      {risk}
    </span>
  );
}

export function ActionBadge({ action, className }: { action: RemediationAction; className?: string }) {
  const Icon = actions[action].icon;
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-[5px] border bg-background/40 px-2 text-xs font-medium text-foreground/90",
        className,
      )}
    >
      <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
      {action}
    </span>
  );
}
