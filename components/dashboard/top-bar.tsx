"use client";

import { BookOpen, Copy, Database, Download, Ellipsis, FileSearch, LoaderCircle, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { site } from "@/lib/site";

export function TopBar({
  workspace,
  source,
  scanning,
  onMenu,
  onNewScan,
  onExport,
  onCopyCommand,
  onViewScan,
  preview = false,
}: {
  workspace: string;
  source: string;
  scanning: boolean;
  onMenu?: () => void;
  onNewScan?: () => void;
  onExport?: () => void;
  onCopyCommand?: () => void;
  onViewScan?: () => void;
  preview?: boolean;
}) {
  const tab = preview ? -1 : undefined;
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 @2xl/main:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="-ml-1 text-foreground @5xl/shell:hidden"
        onClick={onMenu}
        aria-label="Open navigation"
        tabIndex={tab}
      >
        <Menu />
      </Button>

      <div className="flex min-w-0 items-center gap-3 overflow-hidden text-[13px]">
        <div className="hidden min-w-0 items-center gap-1.5 @xl/main:flex">
          <span className="text-muted-foreground">Workspace</span>
          <span className="truncate font-medium">{workspace}</span>
        </div>
        <span className="hidden h-4 w-px bg-border @3xl/main:block" aria-hidden="true" />
        <div className="hidden min-w-0 items-center gap-1.5 @3xl/main:flex">
          <Database className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Memory source</span>
          <span className="truncate font-mono text-[12.5px]">{source}</span>
        </div>
        {scanning ? (
          <span
            role="status"
            className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-[5px] border border-info/30 bg-info/10 px-2 text-xs font-medium text-info"
          >
            <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
            <span className="sr-only @lg/main:not-sr-only">Scanning…</span>
          </span>
        ) : (
          <span
            role="status"
            className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-[5px] border border-safe/30 bg-safe/10 px-2 text-xs font-medium text-safe"
          >
            <span className="size-1.5 rounded-full bg-safe" aria-hidden="true" />
            <span className="sr-only @lg/main:not-sr-only">Scan completed</span>
          </span>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onExport} tabIndex={tab} aria-label="Export report as JSON">
          <Download />
          <span className="hidden @2xl/main:inline">Export report</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon-sm" aria-label="More actions" tabIndex={tab}>
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onSelect={onViewScan}>
              <FileSearch className="text-muted-foreground" />
              View scan details
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onCopyCommand}>
              <Copy className="text-muted-foreground" />
              Copy CLI command
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={site.docs} target="_blank" rel="noreferrer">
                <BookOpen className="text-muted-foreground" />
                Documentation
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" onClick={onNewScan} tabIndex={tab} disabled={scanning}>
          <Plus />
          New scan
        </Button>
      </div>
    </header>
  );
}
