import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export const metadata: Metadata = {
  title: "Demo dashboard",
  description:
    "Interactive Mimvo demo: browse a sample scan of an AI agent's long-term memory, or open your own mimvo --json report in the browser.",
};

export default function DashboardPage() {
  return <DashboardApp />;
}
