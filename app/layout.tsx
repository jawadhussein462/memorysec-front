import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

// Fonts are downloaded at build time and self-hosted by Next.js:
// the running site makes no requests to Google.
const sans = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const description =
  "Scan your AI agent's long-term memory for poisoned facts, hidden instructions, and leaked secrets. Open source, read-only, offline by default.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Mimvo · Security scanner for AI agent memory",
    template: "%s · Mimvo",
  },
  description,
  applicationName: "Mimvo",
  keywords: ["AI agent memory", "memory poisoning", "prompt injection", "secret scanning", "RAG security", "vector database"],
  openGraph: {
    type: "website",
    url: site.url,
    siteName: "Mimvo",
    title: "Mimvo · Security scanner for AI agent memory",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Mimvo · Security scanner for AI agent memory",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1115" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks the page as scripted before paint, so scroll reveals can start hidden without a flash. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">{children}</body>
    </html>
  );
}
