import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { Scanners } from "@/components/landing/scanners";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LocalFirst } from "@/components/landing/local-first";
import { Integrations } from "@/components/landing/integrations";
import { DashboardPreviewSection } from "@/components/landing/dashboard-preview-section";
import { FinalCta } from "@/components/landing/final-cta";
import { SiteFooter } from "@/components/landing/site-footer";

export default function HomePage() {
  return (
    <div className="theme-light theme-light-page min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <Problem />
        <Scanners />
        <HowItWorks />
        <LocalFirst />
        <Integrations />
        <DashboardPreviewSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
