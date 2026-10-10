import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CHECK_ORDER, STORE_ORDER, checks, stores } from "@/lib/catalog";
import { site } from "@/lib/site";

type FooterLink = { label: string; href: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "#product" },
      { label: "How it works", href: "#how" },
      { label: "Local-first", href: "#security" },
      { label: "Interactive demo", href: "/dashboard" },
    ],
  },
  {
    title: "Checks",
    links: [
      ...CHECK_ORDER.map((c) => ({ label: checks[c].label, href: "#scanners" })),
      { label: "All finding codes", href: site.rulesDocs, external: true },
    ],
  },
  {
    title: "Integrations",
    links: STORE_ORDER.map((s) => ({ label: stores[s].name, href: "#integrations" })),
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: site.docs, external: true },
      { label: "PyPI", href: site.pypi, external: true },
      { label: "Install", href: "#install" },
      { label: "Security policy", href: `${site.github}/security/policy`, external: true },
    ],
  },
  {
    title: "GitHub",
    links: [
      { label: "Repository", href: site.github, external: true },
      { label: "Issues", href: `${site.github}/issues`, external: true },
      { label: "Releases", href: `${site.github}/releases`, external: true },
      { label: "Contributing", href: `${site.github}/blob/main/CONTRIBUTING.md`, external: true },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-[1.4fr_repeat(5,minmax(0,1fr))]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Logo />
            <p className="mt-3 max-w-[16rem] text-[13.5px] leading-relaxed text-muted-foreground">{site.tagline}</p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-[13px] font-medium">{col.title}</h2>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link href={link.href} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                        className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono">mimvo · Open source · {site.license}</span>
          <span>{site.url.replace("https://", "")}</span>
        </div>
      </div>
    </footer>
  );
}
