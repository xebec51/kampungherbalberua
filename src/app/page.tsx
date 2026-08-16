import { DataDisclaimerSection } from "@/components/home/DataDisclaimerSection";
import { FeaturedStreetsSection } from "@/components/home/FeaturedStreetsSection";
import { FeaturedHealthConditionsSection } from "@/components/home/FeaturedHealthConditionsSection";
import { FeaturedPlantsSection } from "@/components/home/FeaturedPlantsSection";
import { FeaturedHealthZonesSection } from "@/components/home/FeaturedHealthZonesSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { FeaturedProgramsSection } from "@/components/home/FeaturedProgramsSection";
import { HerbaCodeSection } from "@/components/home/HerbaCodeSection";
import { HeroSection } from "@/components/home/HeroSection";
import { LatestActivitiesSection } from "@/components/home/LatestActivitiesSection";
import { MapPreviewSection } from "@/components/home/MapPreviewSection";
import { ProfileSection } from "@/components/home/ProfileSection";
import { QuickAccessSection } from "@/components/home/QuickAccessSection";
import { SuggestionCtaSection } from "@/components/home/SuggestionCtaSection";
import { createPageMetadata, siteDescription, siteName } from "@/lib/metadata";

export const revalidate = 300;

export const metadata = createPageMetadata({
  description: siteDescription,
  path: "/",
  title: siteName,
});

export default function Home() {
  return (
    <>
      <HeroSection />
      <MapPreviewSection />
      <ProfileSection />
      <QuickAccessSection />
      <HerbaCodeSection />
      <FeaturedStreetsSection />
      <FeaturedHealthZonesSection />
      <FeaturedHealthConditionsSection />
      <FeaturedPlantsSection />
      <FeaturedProductsSection />
      <FeaturedProgramsSection />
      <LatestActivitiesSection />
      <SuggestionCtaSection />
      <DataDisclaimerSection />
    </>
  );
}
