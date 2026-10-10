import Link from "next/link";
import { GitHubIcon } from "@/components/brand/github-icon";
import { CommandBox } from "@/components/security/code";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export function FinalCta() {
  return (
    <section id="install" aria-labelledby="install-title" className="relative scroll-mt-16 overflow-hidden border-b">
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent_80%)]"
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end lg:gap-16 lg:py-28">
        <div>
          <h2
            id="install-title"
            className="type-display max-w-[16ch] text-[2.4rem] font-semibold leading-[1.02] sm:text-[3.1rem] lg:text-[3.6rem]"
          >
            Know what your agent remembers.
          </h2>
          <p className="mt-5 max-w-lg text-[17px] leading-[1.6] text-muted-foreground">
            Scan your memory store before dangerous context becomes trusted context.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">View demo</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href={site.docs} target="_blank" rel="noreferrer">
                <GitHubIcon />
                Install Mimvo
              </a>
            </Button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[13px] text-muted-foreground">Install the CLI and Python package (Python 3.11+)</p>
          <CommandBox command={site.install} />
          <p className="mb-2 mt-5 text-[13px] text-muted-foreground">Then scan a store, or just an export</p>
          <CommandBox command="mimvo scan jsonl memory.jsonl --report report.html" />
          <p className="mt-4 font-mono text-xs text-muted-foreground">Open source · {site.license} · runs locally · gate CI with --fail-on</p>
        </div>
      </div>
    </section>
  );
}
