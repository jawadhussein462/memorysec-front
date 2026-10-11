import Link from "next/link";
import { ArrowRight, CalendarDays, Check } from "lucide-react";
import { GitHubIcon } from "@/components/brand/github-icon";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

const PATHS = [
  {
    id: "oss",
    label: "Open source",
    title: "Start on your own",
    body: `Free under ${site.license}. Install from PyPI and scan your first store in minutes.`,
    points: [
      "CLI and Python package",
      "Secrets, injection and poisoning checks",
      "HTML, JSON, SARIF and Markdown reports",
      "Live dashboard for your --json reports",
    ],
  },
  {
    id: "team",
    label: "With the Mimvo team",
    title: "Roll it out across your agents",
    body: "A 30-minute walkthrough with the people who build Mimvo, on memory shaped like yours.",
    points: [
      "A scan on a store like yours",
      "Detector and threshold choices for your stack",
      "CI gating and production guard rollout",
      "Questions answered by the maintainers",
    ],
  },
] as const;

export function FinalCta() {
  return (
    <section id="get-started" aria-labelledby="get-started-title" className="relative scroll-mt-16 overflow-hidden border-b">
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent_80%)]"
      />
      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2
            id="get-started-title"
            className="type-display text-balance text-[2.4rem] font-semibold leading-[1.02] sm:text-[3.1rem] lg:text-[3.6rem]"
          >
            Know what your agent remembers.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[17px] leading-[1.6] text-muted-foreground">
            Scan your memory store before dangerous context becomes trusted context.
          </p>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
          {PATHS.map((path, i) => {
            const dark = path.id === "team";
            return (
              <Reveal
                key={path.id}
                delay={i * 110}
                className={cn(
                  "flex flex-col rounded-2xl border p-6 sm:p-8",
                  dark ? "theme-dark bg-background text-foreground shadow-[0_40px_100px_-50px_rgba(6,10,14,0.7)]" : "bg-card",
                )}
              >
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{path.label}</p>
                <h3 className="type-display mt-3 text-[1.6rem] font-semibold leading-tight">{path.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{path.body}</p>
                <ul className="mt-6 space-y-2.5 border-t pt-6">
                  {path.points.map((point) => (
                    <li key={point} className="flex gap-2.5 text-[14.5px]">
                      <Check className="mt-0.5 size-4 shrink-0 text-safe" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap items-center gap-3 pt-0 md:mt-auto md:pt-8">
                  {dark ? (
                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <Link href={site.demo}>
                        <CalendarDays />
                        Book a demo
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button asChild size="lg" className="w-full sm:w-auto">
                        <Link href={site.docs}>
                          Try open source
                          <ArrowRight />
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto">
                        <a href={site.github} target="_blank" rel="noreferrer">
                          <GitHubIcon />
                          GitHub
                        </a>
                      </Button>
                    </>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
