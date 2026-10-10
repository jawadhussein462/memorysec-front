import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { GitHubIcon } from "@/components/brand/github-icon";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { HeroTerminal } from "./hero-terminal";

const delay = (ms: number) => ({ "--intro-delay": `${ms}ms` }) as CSSProperties;

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_90%)]"
      />
      <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-12 sm:px-8 sm:pt-16 lg:pb-20 lg:pt-20">
        <a
          href={site.github}
          target="_blank"
          rel="noreferrer"
          style={delay(0)}
          className="intro group inline-flex h-8 items-center gap-2 rounded-full border bg-card/80 pl-1 pr-3 text-[13px] text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
        >
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-foreground px-2.5 text-[12px] font-medium text-background">
            <GitHubIcon className="size-3" />
            Open source
          </span>
          Apache-2.0, on GitHub
          <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden="true" />
        </a>

        <h1
          style={delay(90)}
          className="intro type-display mt-7 text-[2.55rem] font-semibold leading-[1.0] sm:text-[2.9rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5.4rem]"
        >
          <span className="block text-balance">Your agent remembers.</span>
          <span className="block text-balance">Attackers know that.</span>
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:mt-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div className="flex flex-col">
            <p style={delay(180)} className="intro max-w-[33rem] text-[17px] leading-[1.6] text-muted-foreground">
              Mimvo scans the memory store your agent already uses for poisoned facts, hidden instructions, and leaked
              secrets, then tells you which records to review, quarantine, or delete.
            </p>
            <div style={delay(260)} className="intro mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={site.demo}>Book a demo</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href={site.docs}>
                  <BookOpen />
                  Try open source
                </Link>
              </Button>
            </div>
            <p style={delay(340)} className="intro mt-5 text-[13.5px] text-muted-foreground">
              Or{" "}
              <Link
                href="/dashboard"
                className="font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
              >
                open the live dashboard
              </Link>{" "}
              with a sample scan. No signup.
            </p>
          </div>

          <div style={delay(320)} className="intro">
            <HeroTerminal />
          </div>
        </div>
      </div>
    </section>
  );
}
