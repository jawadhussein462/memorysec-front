/** Sections of /docs, in reading order. Ids are the URL fragments (`/docs#installation`). */

export interface DocItem {
  id: string;
  label: string;
  /** Sub-headings shown in "On this page". */
  sub?: { id: string; label: string }[];
}

export interface DocGroup {
  title: string;
  items: DocItem[];
}

export const DOC_GROUPS: DocGroup[] = [
  {
    title: "Getting started",
    items: [
      { id: "introduction", label: "Introduction", sub: [{ id: "highlights", label: "Highlights" }] },
      {
        id: "installation",
        label: "Installation",
        sub: [
          { id: "install-with-pip", label: "With pip" },
          { id: "install-in-your-project", label: "In your own project" },
          { id: "extras", label: "Optional extras" },
        ],
      },
      {
        id: "quickstart",
        label: "Quickstart",
        sub: [
          { id: "quickstart-cli", label: "From the command line" },
          { id: "quickstart-python", label: "From Python" },
        ],
      },
    ],
  },
  {
    title: "Guides",
    items: [
      {
        id: "scan-sources",
        label: "Scan sources",
        sub: [
          { id: "shared-flags", label: "Flags for every source" },
          { id: "per-source-options", label: "Per-source options" },
          { id: "jsonl-format", label: "JSONL format" },
        ],
      },
      {
        id: "reports",
        label: "Reports",
        sub: [
          { id: "report-formats", label: "Formats" },
          { id: "reports-dashboard", label: "Dashboard" },
          { id: "fingerprints", label: "Fingerprints" },
        ],
      },
      {
        id: "use-in-ci",
        label: "Use in CI",
        sub: [
          { id: "exit-codes", label: "Exit codes" },
          { id: "github-actions", label: "GitHub Actions" },
        ],
      },
      { id: "guards", label: "Guard writes and retrievals" },
    ],
  },
  {
    title: "Reference",
    items: [
      {
        id: "what-it-finds",
        label: "What it finds",
        sub: [
          { id: "finding-codes", label: "Finding codes" },
          { id: "severity", label: "Severity" },
          { id: "confidence", label: "Confidence" },
          { id: "detector-failures", label: "When a detector fails" },
        ],
      },
      {
        id: "detectors",
        label: "Detectors",
        sub: [
          { id: "injection-detectors", label: "Injection" },
          { id: "poisoning-detectors", label: "Poisoning" },
          { id: "secrets-detectors", label: "Secrets and PII" },
          { id: "stacking-detectors", label: "Stacking detectors" },
          { id: "custom-detectors", label: "Writing your own" },
        ],
      },
      {
        id: "python-api",
        label: "Python API",
        sub: [
          { id: "scanning", label: "Scanning" },
          { id: "the-report", label: "The report" },
          { id: "configuration", label: "Configuration" },
        ],
      },
      { id: "observability", label: "Observability" },
    ],
  },
  {
    title: "Project",
    items: [
      { id: "accuracy", label: "Accuracy" },
      { id: "performance", label: "Performance" },
      { id: "limitations", label: "Limitations" },
      { id: "contributing", label: "Contributing", sub: [{ id: "license", label: "License" }] },
    ],
  },
];

export const DOC_ITEMS: DocItem[] = DOC_GROUPS.flatMap((g) => g.items);
