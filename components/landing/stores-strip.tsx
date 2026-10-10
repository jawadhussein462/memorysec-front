import { StoreChip } from "@/components/security/store-glyph";
import { STORE_ORDER } from "@/lib/catalog";
import { Reveal } from "./reveal";

/** The "works with" strip under the hero: the stores Mimvo reads, in place of a customer-logo wall. */
export function StoresStrip() {
  return (
    <section aria-labelledby="stores-title" className="border-y bg-card/50">
      <Reveal className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 py-7 sm:px-8 lg:flex-row lg:justify-between lg:gap-8">
        <p id="stores-title" className="shrink-0 text-center text-[13.5px] text-muted-foreground lg:text-left">
          Connects read-only to the memory your agents already use
        </p>
        <ul className="flex flex-wrap justify-center gap-2 lg:justify-end">
          {STORE_ORDER.map((id) => (
            <li key={id}>
              <StoreChip store={id} />
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
