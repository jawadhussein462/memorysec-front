"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { GitHubIcon } from "@/components/brand/github-icon";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Product", href: "#product" },
  { label: "Checks", href: "#scanners" },
  { label: "Integrations", href: "#integrations" },
  { label: "Security", href: "#security" },
  { label: "Docs", href: site.docs, external: true },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color] duration-200",
        scrolled || open
          ? "border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-5 sm:px-8">
        <Link href="/" aria-label="Mimvo home" className="rounded-sm">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <GitHubIcon className="size-3.5" />
            GitHub
          </a>
        </nav>

        <div className="ml-auto hidden items-center gap-2 sm:flex">
          <Button asChild variant="secondary" size="sm">
            <Link href="/dashboard">View demo</Link>
          </Button>
          <Button asChild size="sm">
            <a href="#install">Install</a>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto text-foreground sm:ml-0 lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t lg:hidden">
          <nav aria-label="Mobile" className="mx-auto flex max-w-7xl flex-col px-5 py-3 sm:px-8">
            {[...NAV, { label: "GitHub", href: site.github, external: true }].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="border-b border-border/60 py-3 text-[15px] last:border-0"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 pb-2 sm:hidden">
              <Button asChild variant="secondary">
                <Link href="/dashboard">View demo</Link>
              </Button>
              <Button asChild>
                <a href="#install" onClick={() => setOpen(false)}>
                  Install
                </a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
