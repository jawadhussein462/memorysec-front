const repo = "https://github.com/jawadhussein462/mimvo";

export const site = {
  name: "Mimvo",
  tagline: "Security scanner for AI agent memory.",
  url: "https://mimvo.dev",
  github: repo,
  /** "Try open source" lands on the docs, and the docs lead to GitHub (the promptfoo pattern). */
  docs: "/docs",
  rulesDocs: "/docs#what-it-finds",
  /** "Book a demo" lands on the demo request page. */
  demo: "/demo",
  /**
   * Where demo requests are emailed. `/api/demo` delivers the form here.
   * Set `demoBookingUrl` to a Cal.com / Calendly link to show a scheduling button instead of the form.
   */
  contactEmail: "jawadhussein462@gmail.com",
  demoBookingUrl: "" as string,
  /**
   * Mimvo is not published on PyPI: it installs from the GitHub repository with uv.
   * The same lines appear in the hero, the open-source section and the docs.
   */
  cloneCommand: `git clone ${repo}`,
  quickstart: [`git clone ${repo}`, "cd mimvo", "uv sync", "source .venv/bin/activate"],
  gitSpec: `git+${repo}`,
  license: "Apache-2.0",
};

/** Link to a file in the package repo on GitHub. */
export const repoFile = (path: string) => `${repo}/blob/main/${path}`;
