import Link from "next/link";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreChip } from "@/components/security/store-glyph";
import { STORE_ORDER } from "@/lib/catalog";
import { HeroTerminal } from "./hero-terminal";

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
              Mimvo scans the store your agent already uses for poisoned facts, hidden instructions, and leaked secrets,
              then tells you which records to review, quarantine, or delete. Reports for people and for CI.
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
            <p className="mt-5 font-mono text-xs text-muted-foreground">Read-only · Offline by default · Open source</p>

            <div className="mt-10 border-t pt-6 lg:mt-auto">
              <p className="text-[13px] text-muted-foreground">Connects read-only to</p>
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Supported memory stores">
                {STORE_ORDER.map((id) => (
                  <li key={id}>
                    <StoreChip store={id} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <HeroTerminal />
        </div>
      </div>
    </section>
  );
}
