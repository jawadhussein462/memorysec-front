# MemorySec web

Landing page and interactive demo dashboard for **MemorySec**, a security scanner for AI-agent memory.

- `/`: public landing page
- `/dashboard`: interactive demo on sample data, no signup

Everything runs in the browser on mocked TypeScript data. There is no backend, no authentication, and no network
request at runtime.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck
```

Requires Node 18.18+ (Node 20+ recommended).

Fonts (Archivo and IBM Plex Mono) are fetched by `next/font` **at build time** and self-hosted. The running site makes
no requests to Google. Builds therefore need network access once.

## Before you launch

- **Links.** Set the real repository and docs URLs in `lib/site.ts`. They are placeholders (`your-org`).
- **Python API.** The CLI flags and Python snippets in `lib/catalog.ts` describe the intended interface. Update them to
  match the shipped library.
- **OWASP mappings.** These live in `lib/catalog.ts` (`ASI06`, `ASI03`, `LLM02:2025`). Review them against the version
  of the OWASP lists you cite.

## Stack

Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS 3.4, shadcn/ui on Radix primitives, Recharts,
Lucide, and Sonner for toasts.

Dependency floors are set at the December 2025 patched releases of Next.js and React. The app sets `nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy` and `Permissions-Policy` headers (`next.config.mjs`).

## Project structure

```
app/
  layout.tsx              fonts, metadata
  page.tsx                landing page
  dashboard/page.tsx      demo dashboard (renders <DashboardApp />)
  globals.css             design tokens (light + dark), utilities
components/
  landing/                landing page sections
  dashboard/              dashboard shell, views, panels, table, drawer, new-scan flow
  security/               shared primitives: severity meter/badges, masked text, store glyphs, terminal
  brand/                  logo mark, GitHub mark
  ui/                     shadcn/ui components (button, dialog, sheet, dropdown, tooltip, switch, …)
lib/
  types.ts                Finding, Scan, filters
  catalog.ts              severities, scan categories, actions, memory stores (fields, CLI, Python)
  demo-data.ts            deterministic demo dataset
  report.ts               selectors, filtering, JSON export, simulated scan builder
```

## Design notes

**Color carries meaning only.** The neutral palette has no brand hue. Color is reserved for risk state: critical,
high, medium, low, clean and info.

**Severity never relies on color alone.** A four-bar meter shows the level by shape, and every badge also carries a
text label.

**Themes.** The landing page uses `.theme-light`. The dashboard, terminals and the privacy section use dark tokens.
Tokens are HSL triplets, so Tailwind alpha works (`bg-sev-critical/10`).

**Container queries.** The dashboard uses container queries (`@container/shell`, `@container/main`) instead of
viewport breakpoints. That is what lets the landing-page preview render the real dashboard components at desktop
layout inside a scaled frame, whatever the visitor's screen size.

**Motion.** The one orchestrated moment is the hero scan. Everything else responds to user action.
`prefers-reduced-motion` is respected.

## Demo data

`lib/demo-data.ts` is generated from a fixed seed, so server and client renders match. The production scan reconciles
end to end:

| Severity | Count | Category | Count |
| --- | ---: | --- | ---: |
| Critical | 12 | Memory poisoning | 29 |
| High | 31 | Persistent injection | 24 |
| Medium | 58 | Contradictory memory | 21 |
| Low | 36 | PII / privacy leakage | 18 |
| | | Duplicate / amplification | 17 |
| | | Authority / scope escalation | 17 |
| | | Memory flooding | 11 |
| **Total** | **137** | **Total** | **137** |

All evidence is pre-masked. No value in the dataset is a real secret.

## Product constraints the UI keeps

- **Read-only.** Delete, Quarantine and Review are always shown as *recommended* remediations, never as executed
  actions.
- **No invented social proof.** No customer logos, metrics, testimonials, certifications or pricing.
- **No sign-in.** Neither the site nor the demo requires an account.
- **Simulated scans.** The New scan flow runs entirely in the browser and says so.
- **Client-side export.** "Export report" downloads a JSON report generated in the browser.

## Interactions

| Where | Behavior |
| --- | --- |
| Landing CTAs | Navigate to `/dashboard`; "Explore the demo report" opens `/dashboard#findings`. |
| Sidebar | Switches views and syncs the URL hash (`#overview`, `#scans`, `#findings`, `#integrations`). |
| Findings table | Search, severity filter, category filter, pagination, keyboard-accessible rows. |
| Posture / category panels | Clicking a severity or category filters the table below. |
| Finding row | Opens the detail drawer, with "Mark reviewed" and "Copy finding JSON". |
| New scan | Choose a source, use the demo source, toggle scanners, then watch the simulated run open the report. |
| Integrations | Setup drawer with CLI and Python examples, plus "Scan in demo". |
| Export report | Downloads masked JSON for the current scan. |

## License

Apache-2.0
