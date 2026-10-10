import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { site } from "@/lib/site";

const LIMITS = { name: 120, email: 200, company: 160, role: 120, store: 80, message: 4000 } as const;

function field(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

function messageField(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").trim().slice(0, LIMITS.message);
}

/** Demo requests are delivered to `site.contactEmail` through that Gmail account. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "That request could not be read." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "That request could not be read." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  if (field(data.company_website, 200)) return NextResponse.json({ ok: true });

  const name = field(data.name, LIMITS.name);
  const email = field(data.email, LIMITS.email);
  const company = field(data.company, LIMITS.company);
  const role = field(data.role, LIMITS.role);
  const store = field(data.store, LIMITS.store);
  const message = messageField(data.message) || "I'd like to see a demo of Mimvo.";

  if (!name || !email || !company || !store) {
    return NextResponse.json({ error: "Name, work email, company, and memory store are required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid work email." }, { status: 400 });
  }

  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!pass) {
    return NextResponse.json({ error: "Demo email is not set up yet." }, { status: 503 });
  }

  const lines = [`Name: ${name}`, `Work email: ${email}`, `Company: ${company}`];
  if (role) lines.push(`Role: ${role}`);
  lines.push(`Memory store: ${store}`, "", message);

  try {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: site.contactEmail, pass },
    });
    await transport.sendMail({
      from: site.contactEmail,
      to: site.contactEmail,
      replyTo: email,
      subject: `Mimvo demo request: ${company}`,
      text: lines.join("\n"),
    });
  } catch (err) {
    const code = typeof err === "object" && err && "code" in err ? String((err as { code: unknown }).code) : "";
    if (code === "EAUTH") {
      return NextResponse.json({ error: "Gmail rejected the sign-in. Check the app password." }, { status: 502 });
    }
    return NextResponse.json({ error: "The request could not be sent. Try again in a moment." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
