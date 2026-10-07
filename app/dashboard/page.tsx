import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export const metadata: Metadata = {
  title: "Demo dashboard",
  description: "Interactive MemorySec demo: browse a sample scan of an AI agent's long-term memory.",
};

export default function DashboardPage() {
  return <DashboardApp />;
}
