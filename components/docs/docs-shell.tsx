"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronDown, Pencil, Star, CircleDot, CalendarDays } from "lucide-react";
import { GitHubIcon } from "@/components/brand/github-icon";
import { Button } from "@/components/ui/button";
import { DOC_GROUPS, DOC_ITEMS } from "@/lib/docs";
import { repoFile, site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Distance from the top of the viewport at which a heading counts as "current". */
const ACTIVE_LINE = 140;

function useActiveSection() {
  const [active, setActive] = useState(DOC_ITEMS[0].id);
  const [activeSub, setActiveSub] = useState<string | null>(null);

  useEffect(() => {
    let raf = 0;
    const passed = (id: string) => {
      const el = document.getElementById(id);
      return !!el && el.getBoundingClientRect().top <= ACTIVE_LINE;
    };
    const update = () => {
      raf = 0;
      let current = DOC_ITEMS[0];
      for (const item of DOC_ITEMS) if (passed(item.id)) current = item;
      let sub: string | null = null;
      for (const s of current.sub ?? []) if (passed(s.id)) sub = s.id;
      setActive(current.id);
      setActiveSub(sub);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return { active, activeSub };
}

function NavList({ active, onNavigate }: { active: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Documentation" className="space-y-7">
      {DOC_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{group.title}</p>
          <ul className="space-y-px border-l">
            {group.items.map((item) => {
              const isActive = item.id === active;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={onNavigate}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "-ml-px block border-l py-1.5 pl-3.5 text-[14px] transition-colors",
                      isActive
                        ? "border-foreground font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function GitHubCard() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="flex items-center gap-2 text-[13.5px] font-semibold">
        <GitHubIcon className="size-4" />
        Open source
      </p>
      <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
        Read the code, open issues, and contribute detectors on GitHub.
      </p>
      <Button asChild size="sm" variant="secondary" className="mt-3 w-full">
        <a href={site.github} target="_blank" rel="noreferrer">
          <Star />
          Star on GitHub
        </a>
      </Button>
    </div>
  );
}

const RAIL_LINKS = [
  { label: "Edit this page on GitHub", href: repoFile("README.md"), icon: Pencil },
  { label: "Report an issue", href: `${site.github}/issues/new`, icon: CircleDot },
  { label: "View the repository", href: site.github, icon: GitHubIcon },
];

export function DocsShell({ children }: { children: ReactNode }) {
  const { active, activeSub } = useActiveSection();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = DOC_ITEMS.find((i) => i.id === active) ?? DOC_ITEMS[0];

  return (
    <>
      {/* Mobile and tablet: a sticky bar under the header that opens the section list. */}
      <div className="sticky top-16 z-40 border-b bg-background/90 backdrop-blur-md lg:hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="docs-mobile-nav"
            className="flex h-12 w-full items-center gap-2 text-left text-[14px]"
          >
            <span className="text-muted-foreground">Docs</span>
            <span className="text-muted-foreground/60">/</span>
            <span className="min-w-0 truncate font-medium">{current.label}</span>
            <ChevronDown className={cn("ml-auto size-4 shrink-0 transition-transform", menuOpen && "rotate-180")} aria-hidden="true" />
          </button>
        </div>
        {menuOpen && (
          <div id="docs-mobile-nav" className="max-h-[70vh] overflow-y-auto border-t">
            <div className="mx-auto max-w-7xl px-5 pb-6 pt-5 sm:px-8">
              <NavList active={active} onNavigate={() => setMenuOpen(false)} />
              <a
                href={site.github}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium"
              >
                <GitHubIcon className="size-4" />
                Mimvo on GitHub
                <ArrowUpRight className="size-3.5 opacity-60" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto flex max-w-7xl gap-10 px-5 sm:px-8 xl:gap-14">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="scrollbar-thin sticky top-16 flex h-[calc(100vh-4rem)] flex-col gap-8 overflow-y-auto py-10 pr-2">
            <NavList active={active} />
            <div className="mt-auto">
              <GitHubCard />
            </div>
          </div>
        </aside>

        <main id="docs-content" className="min-w-0 flex-1 pb-24 pt-8 lg:pt-12">
          {children}
        </main>

        <aside className="hidden w-52 shrink-0 xl:block">
          <div className="sticky top-16 space-y-8 py-12">
            <div>
              <p className="text-[12.5px] font-semibold">On this page</p>
              <ul className="mt-3 space-y-2 text-[13px]">
                <li>
                  <a
                    href={`#${current.id}`}
                    className={cn("transition-colors hover:text-foreground", activeSub ? "text-muted-foreground" : "font-medium text-foreground")}
                  >
                    {current.label}
                  </a>
                </li>
                {current.sub?.map((s) => (
                  <li key={s.id} className="pl-3">
                    <a
                      href={`#${s.id}`}
                      className={cn(
                        "transition-colors hover:text-foreground",
                        s.id === activeSub ? "font-medium text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <ul className="space-y-2.5 border-t pt-6 text-[13px]">
              {RAIL_LINKS.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="rounded-lg border bg-card p-4">
              <p className="flex items-center gap-2 text-[13px] font-semibold">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                Scanning production memory?
              </p>
              <p className="mt-1.5 text-[12.5px] leading-snug text-muted-foreground">
                See Mimvo on a store like yours and plan the rollout with us.
              </p>
              <Link
                href={site.demo}
                className="mt-2.5 inline-block text-[13px] font-medium underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
              >
                Book a demo →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
