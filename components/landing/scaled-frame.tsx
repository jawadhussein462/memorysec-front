"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Renders children at a fixed design size and scales them to fit the available width. */
export function ScaledFrame({
  width,
  height,
  children,
  className,
  fallbackScale,
  fallbackClassName,
}: {
  width: number;
  height: number;
  children: ReactNode;
  className?: string;
  /** Scale to use before JavaScript measures the frame (e.g. the known scale on wide screens). */
  fallbackScale?: number;
  /** Classes applied until measured, e.g. "invisible xl:visible" when fallbackScale is only exact on xl. */
  fallbackClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={ref} className={cn("relative w-full overflow-hidden", className)} style={{ aspectRatio: `${width} / ${height}` }}>
      <div
        className={cn("absolute left-0 top-0 origin-top-left", !scale && (fallbackClassName ?? "invisible"))}
        style={{ width, height, transform: `scale(${scale || fallbackScale || 1})` }}
        aria-hidden="true"
        inert
      >
        {children}
      </div>
    </div>
  );
}
