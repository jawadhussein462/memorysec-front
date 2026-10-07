import { stores } from "@/lib/catalog";
import type { StoreId } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Monogram tile for a memory store. Deliberately not the vendors' own logos. */
export function StoreGlyph({
  store,
  size = "md",
  className,
}: {
  store: StoreId;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-grid shrink-0 place-items-center border bg-muted font-mono font-semibold leading-none tracking-tight text-foreground",
        size === "sm" && "size-5 rounded-[4px] text-[9px]",
        size === "md" && "size-7 rounded-md text-[11px]",
        size === "lg" && "size-10 rounded-lg text-[13px]",
        className,
      )}
    >
      {stores[store].monogram}
    </span>
  );
}

export function StoreChip({ store, className }: { store: StoreId; className?: string }) {
  return (
    <span className={cn("inline-flex h-8 items-center gap-2 rounded-md border bg-card pl-1.5 pr-2.5 text-[13px]", className)}>
      <StoreGlyph store={store} size="sm" />
      {store === "pgvector" ? "pgvector" : stores[store].name}
    </span>
  );
}
