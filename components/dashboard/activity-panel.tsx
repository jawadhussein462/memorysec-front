"use client";

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceArea, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SeverityMeter } from "@/components/security/severity";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/lib/hooks";
import type { ActivityPoint, Scan } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { Panel } from "./panel";

const MARGIN = { top: 18, right: 14, bottom: 0, left: 0 };
const Y_AXIS_WIDTH = 42;
const X_AXIS_HEIGHT = 26;

function windowEnd(t: string) {
  const [h, m] = t.split(":").map(Number);
  const end = h * 60 + m + 6;
  return `${String(Math.floor(end / 60) % 24).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
}

function ActivityTooltip({ active, payload }: { active?: boolean; payload?: { payload: ActivityPoint }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-lg">
      <div className="font-mono text-muted-foreground">
        {p.t}–{windowEnd(p.t)} UTC
      </div>
      <div className="mt-0.5 font-medium tabular">{formatNumber(p.writes)} writes</div>
    </div>
  );
}

export function ActivityPanel({ scan, animate = true, className }: { scan: Scan; animate?: boolean; className?: string }) {
  const mounted = useMounted();
  const gradientId = `writes-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const data = scan.activity;
  const max = Math.max(...data.map((d) => d.writes));
  const domainMax = max > 1000 ? Math.ceil(max / 1000) * 1000 : Math.ceil((max * 1.15) / 10) * 10;
  const ticks = max > 1000 ? Array.from({ length: domainMax / 1000 + 1 }, (_, i) => i * 1000) : undefined;
  const spike = scan.spike;
  const spikePct = spike ? (spike.index / (data.length - 1)) * 100 : 0;
  const total = data.reduce((n, d) => n + d.writes, 0);

  return (
    <Panel
      title="Memory writes"
      description={`Records written per 6-minute window, last 12 hours (UTC) · ${formatNumber(total)} writes total`}
      className={className}
    >
      <div className="relative h-[210px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={MARGIN}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="2 4" />
              <XAxis
                dataKey="t"
                height={X_AXIS_HEIGHT}
                tickLine={false}
                axisLine={false}
                interval={19}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "var(--font-mono)" }}
                tickMargin={8}
              />
              <YAxis
                width={Y_AXIS_WIDTH}
                tickLine={false}
                axisLine={false}
                domain={[0, domainMax]}
                ticks={ticks}
                tickCount={4}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "var(--font-mono)" }}
                tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))}
              />
              <Tooltip
                content={<ActivityTooltip />}
                cursor={{ stroke: "hsl(var(--ring))", strokeDasharray: "2 3" }}
                isAnimationActive={false}
              />
              {spike && (
                <ReferenceArea
                  x1={data[Math.max(0, spike.index - 1)].t}
                  x2={data[Math.min(data.length - 1, spike.index + 1)].t}
                  fill="hsl(var(--sev-medium))"
                  fillOpacity={0.1}
                  strokeOpacity={0}
                />
              )}
              <Area
                type="monotone"
                dataKey="writes"
                stroke="hsl(var(--foreground))"
                strokeOpacity={0.55}
                strokeWidth={1.25}
                fill={`url(#${gradientId})`}
                isAnimationActive={animate}
                animationDuration={700}
                activeDot={{ r: 3, fill: "hsl(var(--foreground))", stroke: "hsl(var(--card))", strokeWidth: 2 }}
              />
              {spike && (
                <ReferenceDot
                  x={data[spike.index].t}
                  y={data[spike.index].writes}
                  r={4}
                  fill="hsl(var(--sev-medium))"
                  stroke="hsl(var(--card))"
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Skeleton className="h-full w-full" />
        )}

        {mounted && spike && (
          <div
            className="pointer-events-none absolute"
            style={{ left: MARGIN.left + Y_AXIS_WIDTH, right: MARGIN.right, top: MARGIN.top, bottom: X_AXIS_HEIGHT }}
            aria-hidden="true"
          >
            <div className="absolute top-0 flex items-start" style={{ left: `${spikePct}%`, transform: "translateX(calc(-100% - 5px))" }}>
              <div className="rounded-md border border-sev-medium/35 bg-card/95 px-2.5 py-1.5 shadow-sm backdrop-blur">
                <div className="flex items-center gap-1.5 whitespace-nowrap text-[12px] font-medium text-sev-medium">
                  <SeverityMeter severity="medium" />
                  {spike.label}
                </div>
                <div className="mt-0.5 whitespace-nowrap font-mono text-[11.5px] text-foreground">{spike.detail}</div>
              </div>
              <span className="mt-2 h-px w-2.5 bg-sev-medium/60" />
            </div>
          </div>
        )}
        {spike && (
          <p className="sr-only">
            {spike.label}: {spike.detail} at {data[spike.index].t} UTC.
          </p>
        )}
      </div>
    </Panel>
  );
}
