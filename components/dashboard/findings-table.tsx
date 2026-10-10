"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, CircleCheck, ListFilter, Search, SearchX, X } from "lucide-react";
import { ActionBadge, SeverityBadge, SeverityMeter } from "@/components/security/severity";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SEVERITY_ORDER, checkIcon, owaspId, ruleFor, severities } from "@/lib/catalog";
import { EMPTY_FILTERS, detectorSummary, emptySeverityCounts, filterFindings, formatConfidence, orderedRules } from "@/lib/report";
import type { Finding, FindingFilters, Severity } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FindingsTableProps {
  findings: Finding[];
  filters: FindingFilters;
  onFiltersChange: (filters: FindingFilters) => void;
  onSelect?: (finding: Finding) => void;
  reviewed?: Set<string>;
  pageSize?: number;
  /** Constrain height so the sticky header stays visible while scrolling. */
  scrollable?: boolean;
  /** Static rendering for the landing-page preview. */
  preview?: boolean;
  title?: string;
  className?: string;
}

export function FindingsTable({
  findings,
  filters,
  onFiltersChange,
  onSelect,
  reviewed,
  pageSize = 15,
  scrollable = false,
  preview = false,
  title = "Findings",
  className,
}: FindingsTableProps) {
  const [page, setPage] = useState(0);

  useEffect(() => setPage(0), [filters.severity, filters.rule, filters.query, findings]);

  const filtered = useMemo(() => filterFindings(findings, filters), [findings, filters]);

  // Counts on each control reflect the other active filters.
  const severityCounts = useMemo(() => {
    const base = filterFindings(findings, { ...filters, severity: "all" });
    const counts: Record<Severity | "all", number> = { all: base.length, ...emptySeverityCounts() };
    for (const f of base) counts[f.severity]++;
    return counts;
  }, [findings, filters]);

  const ruleCounts = useMemo(() => {
    const base = filterFindings(findings, { ...filters, rule: "all" });
    const counts = new Map<string, number>();
    for (const f of base) counts.set(f.rule, (counts.get(f.rule) ?? 0) + 1);
    return { all: base.length, counts };
  }, [findings, filters]);
  const rules = useMemo(() => orderedRules(findings.map((f) => f.rule)), [findings]);
  const levels = useMemo(() => SEVERITY_ORDER.filter((s) => s !== "info" || findings.some((f) => f.severity === "info")), [findings]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages - 1);
  const rows = filtered.slice(current * pageSize, current * pageSize + pageSize);
  const isFiltered = filters.severity !== "all" || filters.rule !== "all" || filters.query.trim() !== "";
  const set = (patch: Partial<FindingFilters>) => onFiltersChange({ ...filters, ...patch });

  return (
    <section className={cn("min-w-0 rounded-lg border bg-card", className)} aria-label={title}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b px-4 py-3 @6xl:flex-row @6xl:items-center">
        <div className="flex items-center gap-3">
          <h2 className="whitespace-nowrap text-[14px] font-semibold">{title}</h2>
          <span className="rounded-[4px] bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground tabular">
            {filtered.length === findings.length ? findings.length : `${filtered.length} of ${findings.length}`}
          </span>
        </div>

        <div className="flex flex-col gap-2 @2xl:flex-row @2xl:items-center @6xl:ml-auto">
          <label className="relative block @2xl:w-64">
            <span className="sr-only">Search findings</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={filters.query}
              onChange={(e) => set({ query: e.target.value })}
              placeholder="Search records, rules, snippets…"
              tabIndex={preview ? -1 : undefined}
              className="h-8 w-full rounded-md border border-input bg-transparent pl-8 pr-7 text-[13px] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => set({ query: "" })}
                className="absolute right-1.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3" />
              </button>
            )}
          </label>

          <div className="scrollbar-thin -mx-1 relative overflow-x-auto px-1 @2xl:mx-0 @2xl:px-0">
            <div role="group" aria-label="Filter by severity" className="flex h-8 w-max items-center rounded-md border p-0.5">
              {(["all", ...levels] as const).map((s) => {
                const active = filters.severity === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={active}
                    tabIndex={preview ? -1 : undefined}
                    onClick={() => set({ severity: s })}
                    className={cn(
                      "inline-flex h-full items-center gap-1.5 rounded-[5px] px-2.5 text-[12.5px] transition-colors",
                      active ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s !== "all" && <SeverityMeter severity={s} />}
                    {s === "all" ? "All" : severities[s].label}
                    <span className="font-mono text-[11px] tabular text-muted-foreground">{severityCounts[s]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                tabIndex={preview ? -1 : undefined}
                className={cn("justify-between font-normal @2xl:w-auto", filters.rule !== "all" && "border-foreground/30")}
              >
                <span className="inline-flex items-center gap-2">
                  <ListFilter className="text-muted-foreground" />
                  {filters.rule === "all" ? "All rules" : ruleFor(filters.rule).title}
                </span>
                <ChevronDown className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Rule (finding code)</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={filters.rule} onValueChange={(v) => set({ rule: v })}>
                <DropdownMenuRadioItem value="all">
                  <span className="flex-1">All rules</span>
                  <span className="font-mono text-[11px] text-muted-foreground tabular">{ruleCounts.all}</span>
                </DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                {rules.map((r) => {
                  const meta = ruleFor(r);
                  const Icon = checkIcon(meta.check);
                  const count = ruleCounts.counts.get(r) ?? 0;
                  return (
                    <DropdownMenuRadioItem key={r} value={r} disabled={count === 0 && filters.rule !== r}>
                      <Icon className="text-muted-foreground" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">{meta.title}</span>
                        <span className="truncate font-mono text-[10.5px] text-muted-foreground">{r}</span>
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground tabular">{count}</span>
                    </DropdownMenuRadioItem>
                  );
                })}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isFiltered && !preview && (
        <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-4 py-2 text-xs">
          <span className="text-muted-foreground">Filtered by</span>
          {filters.severity !== "all" && (
            <FilterChip onRemove={() => set({ severity: "all" })}>{severities[filters.severity].label}</FilterChip>
          )}
          {filters.rule !== "all" && (
            <FilterChip onRemove={() => set({ rule: "all" })}>{ruleFor(filters.rule).title}</FilterChip>
          )}
          {filters.query.trim() && <FilterChip onRemove={() => set({ query: "" })}>&ldquo;{filters.query.trim()}&rdquo;</FilterChip>}
          <button
            type="button"
            onClick={() => onFiltersChange(EMPTY_FILTERS)}
            className="ml-auto text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Table */}
      <div className={cn("scrollbar-thin relative overflow-x-auto", scrollable && "max-h-[calc(100dvh-17rem)] min-h-[420px] overflow-y-auto")}>
        <table className="w-full min-w-[960px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-card shadow-[inset_0_-1px_0_hsl(var(--border))]">
            <tr className="text-[11.5px] text-muted-foreground">
              <th scope="col" className="w-[118px] py-2.5 pl-4 pr-3 font-medium">Severity</th>
              <th scope="col" className="py-2.5 pr-3 font-medium">Finding</th>
              <th scope="col" className="w-[132px] py-2.5 pr-3 font-medium">Record</th>
              <th scope="col" className="w-[168px] py-2.5 pr-3 font-medium">Detectors</th>
              <th scope="col" className="w-[84px] py-2.5 pr-3 text-right font-medium">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help underline decoration-dotted underline-offset-4" tabIndex={preview ? -1 : 0}>
                      Conf.
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Combined confidence of the detectors that agreed, 1 − Π(1 − score). Below 0.6 a finding is reported one
                    severity lower.
                  </TooltipContent>
                </Tooltip>
              </th>
              <th scope="col" className="w-[124px] py-2.5 pr-3 font-medium">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help underline decoration-dotted underline-offset-4" tabIndex={preview ? -1 : 0}>
                      Action
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Recommended next step, set by the rule. Mimvo reads the store and never applies it.
                  </TooltipContent>
                </Tooltip>
              </th>
              <th scope="col" className="w-[76px] py-2.5 pr-4 font-medium">OWASP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => {
              const isReviewed = reviewed?.has(f.id);
              return (
                <tr
                  key={f.id}
                  tabIndex={preview ? -1 : 0}
                  onClick={() => onSelect?.(f)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect?.(f);
                    }
                  }}
                  aria-label={`${severities[f.severity].label} ${f.title}, record ${f.record}. Open details.`}
                  className={cn(
                    "group cursor-pointer border-b transition-colors last:border-0 hover:bg-accent/45 focus-visible:bg-accent/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring",
                    isReviewed && "opacity-60",
                  )}
                >
                  <td className="py-2.5 pl-4 pr-3 align-middle">
                    <SeverityBadge severity={f.severity} />
                  </td>
                  <td className="max-w-0 py-2.5 pr-3 align-middle">
                    <div className="flex min-w-0 items-baseline gap-2">
                      <span className="truncate text-[13px] font-medium">{f.title}</span>
                      <code className="hidden shrink-0 font-mono text-[11px] text-muted-foreground @5xl:inline">{f.rule}</code>
                    </div>
                    <div className="truncate font-mono text-[11.5px] text-muted-foreground">{f.snippet || f.message}</div>
                  </td>
                  <td className="py-2.5 pr-3 align-middle">
                    <span className="inline-flex max-w-[120px] items-center gap-1.5 font-mono text-[12px]">
                      <span className="truncate">{f.record}</span>
                      {isReviewed && <CircleCheck className="size-3 shrink-0 text-safe" aria-label="Reviewed" />}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 align-middle">
                    <span className="flex items-center gap-1.5 font-mono text-[12px]">
                      <span className="truncate">{detectorSummary(f)}</span>
                      {f.detectors.length > 1 && (
                        <span className="shrink-0 rounded-[3px] bg-muted px-1 text-[10.5px] text-muted-foreground">
                          {f.detectors.length}✓
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-right align-middle font-mono text-[12px] tabular">{formatConfidence(f.confidence)}</td>
                  <td className="py-2.5 pr-3 align-middle">
                    <ActionBadge action={f.action} />
                  </td>
                  <td className="py-2.5 pr-4 align-middle font-mono text-[12px] text-muted-foreground">{owaspId(f.owasp)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="grid size-10 place-items-center rounded-lg border bg-muted">
              <SearchX className="size-4 text-muted-foreground" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-medium">No findings match these filters</p>
            <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
              Try another record id, rule or phrase, or clear the severity and rule filters.
            </p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => onFiltersChange(EMPTY_FILTERS)}>
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      {!preview && filtered.length > 0 && (
        <div className="flex flex-col gap-2 border-t px-4 py-2.5 text-xs text-muted-foreground @xl:flex-row @xl:items-center @xl:justify-between">
          <span className="tabular">
            Showing {current * pageSize + 1}–{Math.min(filtered.length, (current + 1) * pageSize)} of {filtered.length} ·
            most severe first, as in the report
          </span>
          <div className="flex items-center gap-1">
            <span className="mr-2 tabular">
              Page {current + 1} of {pages}
            </span>
            <Button
              variant="secondary"
              size="icon-sm"
              className="size-7"
              onClick={() => setPage(current - 1)}
              disabled={current === 0}
              aria-label="Previous page"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              className="size-7"
              onClick={() => setPage(current + 1)}
              disabled={current >= pages - 1}
              aria-label="Next page"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
      {preview && (
        <div className="border-t px-4 py-2.5 text-xs text-muted-foreground">
          Showing {rows.length} of {filtered.length} · sorted by severity
        </div>
      )}
    </section>
  );
}

function FilterChip({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-[5px] border bg-card pl-2 pr-1 text-foreground">
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="grid size-4 place-items-center rounded-[3px] text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Remove filter"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

