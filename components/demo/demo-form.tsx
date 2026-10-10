"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CalendarDays, CircleCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STORE_ORDER, stores } from "@/lib/catalog";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const fieldClass =
  "flex w-full rounded-md border border-input bg-card px-3 text-[14px] shadow-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function Field({ label, htmlFor, optional, children }: { label: string; htmlFor: string; optional?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="flex items-baseline justify-between text-[13px] font-medium">
        {label}
        {optional && <span className="text-[12px] font-normal text-muted-foreground">Optional</span>}
      </label>
      {children}
    </div>
  );
}

/**
 * Demo request. Submitting posts to `/api/demo`, which emails `site.contactEmail`.
 * With `site.demoBookingUrl` set, a scheduling link is shown instead.
 */
export function DemoForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [replyEmail, setReplyEmail] = useState("");
  const [error, setError] = useState("");

  if (site.demoBookingUrl) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <CalendarDays className="size-5" aria-hidden="true" />
        <h2 className="mt-4 text-[1.25rem] font-semibold">Pick a time that works</h2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
          Choose a 30-minute slot. You&apos;ll get a calendar invite with a video link.
        </p>
        <Button asChild size="lg" className="mt-6 w-full">
          <a href={site.demoBookingUrl} target="_blank" rel="noreferrer">
            Open the calendar
          </a>
        </Button>
      </div>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const email = get("email");
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: get("name"),
          email,
          company: get("company"),
          role: get("role"),
          store: get("store"),
          message: get("message"),
          company_website: get("company_website"),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(payload.error || "The request could not be sent. Try again in a moment.");
        return;
      }
      setReplyEmail(email);
      setSent(true);
    } catch {
      setError("The request could not be sent. Try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8" role="status">
        <CircleCheck className="size-6 text-safe" aria-hidden="true" />
        <h2 className="mt-4 text-[1.25rem] font-semibold">Request sent</h2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
          We emailed the request to the Mimvo team. We&apos;ll reply to {replyEmail} with times for a call.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>
          Send another request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative rounded-xl border bg-card p-6 shadow-sm sm:p-8" aria-labelledby="demo-form-title">
      <h2 id="demo-form-title" className="text-[1.25rem] font-semibold">
        Request a demo
      </h2>
      <p className="mt-1.5 text-[14px] text-muted-foreground">We&apos;ll reply by email with times for a 30-minute call.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="demo-name">
          <Input id="demo-name" name="name" required autoComplete="name" className="h-10 bg-card text-[14px]" />
        </Field>
        <Field label="Work email" htmlFor="demo-email">
          <Input id="demo-email" name="email" type="email" required autoComplete="email" className="h-10 bg-card text-[14px]" />
        </Field>
        <Field label="Company" htmlFor="demo-company">
          <Input id="demo-company" name="company" required autoComplete="organization" className="h-10 bg-card text-[14px]" />
        </Field>
        <Field label="Role" htmlFor="demo-role" optional>
          <Input id="demo-role" name="role" autoComplete="organization-title" className="h-10 bg-card text-[14px]" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Where does your agent's memory live?" htmlFor="demo-store">
            <select id="demo-store" name="store" defaultValue="" required className={cn(fieldClass, "h-10 appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9")} style={{ backgroundImage: CHEVRON }}>
              <option value="" disabled>
                Choose a store
              </option>
              {STORE_ORDER.map((id) => (
                <option key={id} value={stores[id].name}>
                  {stores[id].name}
                </option>
              ))}
              <option value="Something else">Something else</option>
              <option value="Not sure yet">Not sure yet</option>
            </select>
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="What would you like to see?" htmlFor="demo-message" optional>
            <textarea
              id="demo-message"
              name="message"
              rows={4}
              placeholder="Store size, agents in production, CI, compliance questions…"
              className={cn(fieldClass, "resize-y py-2.5 leading-relaxed")}
            />
          </Field>
        </div>
      </div>

      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="company-website">Company website</label>
        <input id="company-website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={sending}>
        <Mail />
        {sending ? "Sending…" : "Request a demo"}
      </Button>
      {error && (
        <p role="alert" className="mt-3 text-center text-[13px] leading-relaxed text-sev-high">
          {error}
        </p>
      )}
      <p className="mt-3 text-center text-[12.5px] text-muted-foreground">
        Sends the request to {site.contactEmail}. We&apos;ll reply with times for a 30-minute call.
      </p>
    </form>
  );
}

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23777' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;
