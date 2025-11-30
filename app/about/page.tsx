import { NavigationServer } from "@/components/NavigationServer";
import { SiteFooter } from "@/components/SiteFooter";
import { AboutUsPage } from "@/components/AboutUsPage";

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  return (
    <div className="relative z-0 bg-white text-[var(--color-ink)]">
      <NavigationServer />
      <AboutUsPage />
      <SiteFooter />
    </div>
  );
}

