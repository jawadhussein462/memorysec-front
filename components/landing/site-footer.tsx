import Link from "next/link";
import { GitHubIcon } from "@/components/brand/github-icon";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { repoFile, site } from "@/lib/site";

type FooterLink = { label: string; href: string };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/#product" },
      { label: "What it finds", href: "/#scanners" },
      { label: "How it works", href: "/#how" },
      { label: "Live dashboard", href: "/dashboard" },
      { label: "Book a demo", href: site.demo },
    ],
  },
  {
    title: "Docs",
    links: [
      { label: "Introduction", href: "/docs#introduction" },
      { label: "Installation", href: "/docs#installation" },
      { label: "Quickstart", href: "/docs#quickstart" },
      { label: "Finding codes", href: site.rulesDocs },
      { label: "Use in CI", href: "/docs#use-in-ci" },
      { label: "Python API", href: "/docs#python-api" },
    ],
  },
  {
    title: "Open source",
    links: [
      { label: "GitHub", href: site.github },
      { label: "PyPI", href: site.pypi },
      { label: "Issues", href: `${site.github}/issues` },
      { label: "Changelog", href: repoFile("CHANGELOG.md") },
      { label: "Contributing", href: repoFile("CONTRIBUTING.md") },
      { label: "Security policy", href: repoFile("SECURITY.md") },
    ],
  },
];

const linkClass = "text-[13.5px] text-muted-foreground transition-colors hover:text-foreground";

export function SiteFooter() {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Logo />
            <p className="mt-3 max-w-[18rem] text-[13.5px] leading-relaxed text-muted-foreground">{site.tagline}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href={site.demo}>Book a demo</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href={site.docs}>Try open source</Link>
              </Button>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-[13px] font-medium">{col.title}</h2>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} target="_blank" rel="noreferrer" className={linkClass}>
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono">mimvo · Open source · {site.license}</span>
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <GitHubIcon className="size-3.5" />
            jawadhussein462/mimvo
          </a>
        </div>
      </div>
    </footer>
  );
}
