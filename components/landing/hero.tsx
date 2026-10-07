import Link from "next/link";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreChip } from "@/components/security/store-glyph";
import { STORE_ORDER } from "@/lib/catalog";
import type { StoreId } from "@/lib/types";
import { HeroTerminal } from "./hero-terminal";

/** Distinct store hues. These are not severity colors. */
const STORE_TONE: Record<StoreId, { chip: string; glyph: string }> = {
  chroma: {
    chip: "border-[#FF6A00]/35 bg-[#FF6A00]/10",
    glyph: "border-transparent bg-[#FF6A00] text-white",
  },
  qdrant: {
    chip: "border-[#E11D48]/35 bg-[#E11D48]/10",
    glyph: "border-transparent bg-[#E11D48] text-white",
  },
  pgvector: {
    chip: "border-[#336791]/35 bg-[#336791]/10",
    glyph: "border-transparent bg-[#336791] text-white",
  },
  pinecone: {
    chip: "border-[#0F766E]/35 bg-[#0F766E]/10",
    glyph: "border-transparent bg-[#0F766E] text-white",
  },
  jsonl: {
    chip: "border-[#6D28D9]/35 bg-[#6D28D9]/10",
    glyph: "border-transparent bg-[#6D28D9] text-white",
  },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_90%)]"
      />
      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:pb-24 lg:pt-20">
        <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-muted-foreground">AI MEMORY SECURITY</p>
        <h1 className="type-display mt-5 text-[2.55rem] font-semibold leading-[1.0] sm:text-[2.9rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5.4rem]">
          <span className="block text-balance">Your agent remembers.</span>
          <span className="block text-balance">Attackers know that.</span>
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:mt-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div className="flex flex-col">
            <p className="max-w-[33rem] text-[17px] leading-[1.6] text-muted-foreground">
              Scan long-term AI memory for poisoned facts, persistent prompt injections, leaked secrets, privacy risks,
              contradictions, amplification attacks, and unsafe authority changes.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">View interactive demo</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="#install">
                  <Terminal />
                  Install open source
                </a>
              </Button>
            </div>
            <p className="mt-5 font-mono text-xs text-muted-foreground">Local-first · Read-only · Open source</p>
          </div>

          <div className="flex flex-col gap-5">
            <HeroTerminal />
            <div>
              <p className="text-[13px] text-muted-foreground">Connects read-only to</p>
              <ul className="mt-3 flex flex-wrap gap-2.5" aria-label="Supported memory stores">
                {STORE_ORDER.map((id) => (
                  <li key={id}>
                    <StoreChip
                      store={id}
                      className={`h-9 pr-3 text-sm ${STORE_TONE[id].chip}`}
                      glyphClassName={`size-6 rounded-[5px] text-[10px] ${STORE_TONE[id].glyph}`}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
