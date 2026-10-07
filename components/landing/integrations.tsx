import { Lock } from "lucide-react";
import { StoreGlyph } from "@/components/security/store-glyph";
import { STORE_ORDER, stores } from "@/lib/catalog";
import { SectionHeading } from "./section-heading";

export function Integrations() {
  return (
    <section id="integrations" aria-labelledby="integrations-title" className="scroll-mt-16 border-b">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <SectionHeading id="integrations-title" title="Scans the memory store you already run.">
          MemorySec connects as a reader, scans, and writes a report. Your database remains the source of truth.
        </SectionHeading>

        <ul className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STORE_ORDER.map((id) => {
            const s = stores[id];
            return (
              <li key={id} className="flex flex-col rounded-xl border bg-card">
                <div className="flex items-start justify-between gap-3 p-4">
                  <StoreGlyph store={id} size="lg" />
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-safe">
                    <span className="size-1.5 rounded-full bg-safe" aria-hidden="true" />
                    Available
                  </span>
                </div>
                <div className="px-4">
                  <h3 className="text-[15px] font-semibold">{s.name}</h3>
                  <p className="mt-0.5 font-mono text-[11.5px] text-muted-foreground">{s.kind}</p>
                  <p className="mt-3 text-[13.5px] leading-snug text-muted-foreground">{s.description}</p>
                </div>
                <div className="mt-auto px-4 pb-4 pt-4">
                  <code className="block truncate rounded-md bg-muted px-2.5 py-1.5 font-mono text-[11.5px]">
                    memorysec scan {s.slug}
                  </code>
                </div>
                <div className="flex items-center gap-1.5 border-t px-4 py-2.5 text-xs text-muted-foreground">
                  <Lock className="size-3" aria-hidden="true" />
                  Read-only {s.noun} access
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
