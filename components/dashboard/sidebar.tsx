"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, History, LayoutGrid, ListFilter, Plug, type LucideIcon } from "lucide-react";
import { GitHubIcon } from "@/components/brand/github-icon";
import { Logo } from "@/components/brand/logo";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export type DashboardView = "overview" | "scans" | "findings" | "integrations";

export const VIEWS: DashboardView[] = ["overview", "scans", "findings", "integrations"];

const NAV: { id: DashboardView; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "scans", label: "Scans", icon: History },
  { id: "findings", label: "Findings", icon: ListFilter },
  { id: "integrations", label: "Integrations", icon: Plug },
];

export function SidebarContent({
  view,
  onNavigate,
  findingsCount,
  workspace,
  source,
  imported = false,
  preview = false,
}: {
  view: DashboardView;
  onNavigate: (v: DashboardView) => void;
  findingsCount: number;
  workspace: string;
  source: string;
  imported?: boolean;
  preview?: boolean;
}) {
  const tab = preview ? -1 : undefined;
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center border-b px-4">
        <Link href="/" className="rounded-sm" aria-label="Mimvo home" tabIndex={tab}>
          <Logo />
        </Link>
      </div>

      <div className="px-3 pt-3">
        <div className="rounded-md border bg-muted/40 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">{imported ? "Your report" : "Demo workspace"}</span>
            <span className="rounded-[3px] border border-info/30 bg-info/10 px-1 font-mono text-[10px] text-info">
              {imported ? "local file" : "demo"}
            </span>
          </div>
          <div className="mt-1 truncate text-[13px] font-medium">{workspace}</div>
          <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{source}</div>
        </div>
      </div>

      <nav aria-label="Dashboard" className="flex-1 space-y-0.5 px-3 py-4">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              type="button"
              tabIndex={tab}
              onClick={() => onNavigate(id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors",
                active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
              {id === "findings" && (
                <span className="ml-auto rounded-[4px] bg-muted px-1.5 font-mono text-[11px] tabular text-muted-foreground">
                  {findingsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="space-y-0.5 border-t px-3 py-3">
        <a
          href={site.docs}
          target="_blank"
          rel="noreferrer"
          tabIndex={tab}
          className="flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
        >
          <BookOpen className="size-4" aria-hidden="true" />
          Documentation
          <ArrowUpRight className="ml-auto size-3.5 opacity-60" aria-hidden="true" />
        </a>
        <a
          href={site.github}
          target="_blank"
          rel="noreferrer"
          tabIndex={tab}
          className="flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
        >
          <GitHubIcon className="size-4" />
          GitHub
          <ArrowUpRight className="ml-auto size-3.5 opacity-60" aria-hidden="true" />
        </a>
        <div className="flex items-center gap-2 px-2.5 pt-2 font-mono text-[11px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-safe" aria-hidden="true" />
          local · read-only
        </div>
      </div>
    </div>
  );
}
