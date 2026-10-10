"use client";

import { useState } from "react";
import { ChevronRight, Lock, Play } from "lucide-react";
import { CommandBox, CopyButton, ShellCommand } from "@/components/security/code";
import { StoreGlyph } from "@/components/security/store-glyph";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { STORE_ORDER, installCommand, stores } from "@/lib/catalog";
import type { StoreId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PageHeading } from "./panel";

export function IntegrationsView({ onScanSource }: { onScanSource: (store: StoreId) => void }) {
  const [openStore, setOpenStore] = useState<StoreId | null>(null);
  const [shown, setShown] = useState<StoreId>("qdrant");

  return (
    <div className="space-y-5">
      <PageHeading
        title="Integrations"
        description="Scan sources built into the mimvo CLI and Python package. All of them are read-only; your store remains the source of truth."
      />

      <ul className="grid grid-cols-1 gap-3 @2xl:grid-cols-2 @5xl:grid-cols-3">
        {STORE_ORDER.map((id) => {
          const s = stores[id];
          const command = s.command(s.demo);
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  setShown(id);
                  setOpenStore(id);
                }}
                className="group flex h-full w-full flex-col rounded-lg border bg-card text-left transition-colors hover:border-foreground/25"
              >
                <div className="flex w-full items-start gap-3 p-4">
                  <StoreGlyph store={id} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold">{s.name}</span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-safe">
                        <span className="size-1.5 rounded-full bg-safe" aria-hidden="true" />
                        Available
                      </span>
                    </div>
                    <div className="mt-0.5 font-mono text-[11.5px] text-muted-foreground">{s.kind}</div>
                    <p className="mt-2 text-[13px] leading-snug text-muted-foreground">{s.description}</p>
                  </div>
                </div>
                <div className="mx-4 mb-4 mt-auto w-[calc(100%-2rem)] overflow-hidden rounded-md border bg-background px-3 py-2 font-mono text-[11.5px] leading-[1.7] text-muted-foreground">
                  {command.split("\n").map((line, i) => (
                    <div key={i} className="truncate whitespace-pre">
                      {i === 0 ? `$ ${line}` : `  ${line.trim()}`}
                    </div>
                  ))}
                </div>
                <div className="flex w-full items-center justify-between border-t px-4 py-2.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="size-3" aria-hidden="true" />
                    Read-only {s.noun} access
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-foreground/80 group-hover:text-foreground">
                    Setup
                    <ChevronRight className="size-3.5" aria-hidden="true" />
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <Sheet open={openStore !== null} onOpenChange={(o) => !o && setOpenStore(null)}>
        <SheetContent className="p-0 sm:max-w-[560px]">
          <IntegrationDetail
            store={shown}
            onScan={() => {
              setOpenStore(null);
              onScanSource(shown);
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function IntegrationDetail({ store, onScan }: { store: StoreId; onScan: () => void }) {
  const [tab, setTab] = useState<"cli" | "python">("cli");
  const s = stores[store];
  const command = `${s.command(s.demo)} \\\n  --report report.html \\\n  --json findings.json`;
  const code = tab === "cli" ? command : s.python;

  return (
    <div className="flex h-full flex-col">
      <header className="border-b px-6 pb-5 pt-5">
        <div className="flex items-center gap-3 pr-10">
          <StoreGlyph store={store} size="lg" />
          <div>
            <SheetTitle className="type-display text-[20px] font-semibold leading-tight">{s.name}</SheetTitle>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 font-medium text-safe">
                <span className="size-1.5 rounded-full bg-safe" aria-hidden="true" />
                Available
              </span>
              <span className="font-mono text-muted-foreground">{s.kind}</span>
            </div>
          </div>
        </div>
        <SheetDescription className="mt-3 text-[13.5px]">{s.description}</SheetDescription>
      </header>

      <div className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <div className="flex gap-3 rounded-lg border border-safe/25 bg-safe/[0.06] px-3.5 py-3">
          <Lock className="mt-0.5 size-4 shrink-0 text-safe" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-medium">Read-only by design</p>
            <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">{s.access}</p>
          </div>
        </div>

        <section>
          <h3 className="mb-2.5 text-[12.5px] font-medium text-muted-foreground">Install</h3>
          <CommandBox command={installCommand(store)} />
        </section>

        <section>
          <div className="mb-2.5 flex items-center justify-between">
            <div role="tablist" aria-label="Example" className="flex h-8 items-center rounded-md border p-0.5">
              {(["cli", "python"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "h-full rounded-[5px] px-3 text-[12.5px] transition-colors",
                    tab === t ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t === "cli" ? "CLI" : "Python"}
                </button>
              ))}
            </div>
            <CopyButton value={code} label={`Copy ${tab === "cli" ? "command" : "Python example"}`} />
          </div>
          <div
            role="tabpanel"
            className="theme-dark scrollbar-thin relative overflow-x-auto rounded-lg border bg-terminal px-4 py-3.5 font-mono text-[12.5px] leading-[1.75] text-terminal-foreground"
          >
            {tab === "cli" ? <ShellCommand command={command} /> : <pre className="whitespace-pre">{s.python}</pre>}
          </div>
        </section>

        <section>
          <h3 className="mb-2.5 text-[12.5px] font-medium text-muted-foreground">
            Options <span className="font-normal">· plus --report, --json, --sarif, --markdown, --fail-on and --sample on every source</span>
          </h3>
          <dl className="divide-y rounded-lg border text-[13px]">
            {s.flags.map((f) => (
              <div key={f.flag} className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3 px-3.5 py-2.5">
                <dt className="font-mono text-[12.5px]">{f.flag}</dt>
                <dd className="text-muted-foreground">{f.description}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <footer className="flex items-center gap-2 border-t px-6 py-4">
        <Button onClick={onScan}>
          <Play />
          Scan {s.name} in demo
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">Uses sample data</span>
      </footer>
    </div>
  );
}
