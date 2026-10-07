import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { DashboardPreview } from "@/components/dashboard/dashboard-preview";
import { Button } from "@/components/ui/button";
import { ScaledFrame } from "./scaled-frame";
import { SectionHeading } from "./section-heading";

const WIDTH = 1280;
const HEIGHT = 960;
// At xl and up the frame is always 1214px wide (max-w-7xl minus padding and borders),
// so the preview can render at its final scale before hydration.
const XL_SCALE = 1214 / WIDTH;

export function DashboardPreviewSection() {
  return (
    <section id="dashboard" aria-labelledby="dashboard-title" className="scroll-mt-16 border-b">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <SectionHeading id="dashboard-title" title="Every finding, one click from its evidence.">
          The same report the CLI writes, as an interactive dashboard. Filter by severity or memory risk class, then open
          a finding to see which detectors agreed and what to do about it.
        </SectionHeading>

        <figure className="mt-14">
          <div className="overflow-hidden rounded-xl border bg-card shadow-[0_48px_120px_-56px_rgba(8,12,16,0.55)]">
            <div className="flex h-10 items-center gap-3 border-b bg-muted/60 px-4">
              <LogoMark className="size-4 text-muted-foreground" />
              <div className="mx-auto flex h-6 min-w-0 max-w-xs flex-1 items-center justify-center rounded-md border bg-card px-3 font-mono text-[11.5px] text-muted-foreground">
                <span className="truncate">localhost:7411/dashboard</span>
              </div>
              <span className="hidden font-mono text-[11px] text-muted-foreground sm:block">demo data</span>
            </div>
            <div className="theme-dark relative bg-background">
              <ScaledFrame width={WIDTH} height={HEIGHT} fallbackScale={XL_SCALE} fallbackClassName="invisible xl:visible">
                <DashboardPreview width={WIDTH} height={HEIGHT} />
              </ScaledFrame>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background to-transparent"
              />
            </div>
          </div>
          <figcaption className="sr-only">
            Preview of the MemorySec dashboard: 48,291 records scanned, 137 flagged, overall risk high, findings by severity
            and category, and the most recent findings.
          </figcaption>
        </figure>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button asChild size="lg">
            <Link href="/dashboard">Open interactive dashboard</Link>
          </Button>
          <span className="text-[13.5px] text-muted-foreground">No signup. Runs in your browser on sample data.</span>
        </div>
      </div>
    </section>
  );
}
