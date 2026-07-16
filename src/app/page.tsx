import { DataDisclaimerSection } from "@/components/home/DataDisclaimerSection";
import { FeaturedPlantsSection } from "@/components/home/FeaturedPlantsSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { HerbaCodeSection } from "@/components/home/HerbaCodeSection";
import { HeroSection } from "@/components/home/HeroSection";
import { LatestActivitiesSection } from "@/components/home/LatestActivitiesSection";
import { MapPreviewSection } from "@/components/home/MapPreviewSection";
import { ProfileSection } from "@/components/home/ProfileSection";
import { QuickAccessSection } from "@/components/home/QuickAccessSection";
import { SuggestionCtaSection } from "@/components/home/SuggestionCtaSection";

export const revalidate = 300;

export default function Home() {
  return (
    <>
      <HeroSection />
      <QuickAccessSection />
      <ProfileSection />
      <FeaturedPlantsSection />
      <HerbaCodeSection />
      <MapPreviewSection />
      <FeaturedProductsSection />
      <LatestActivitiesSection />
      <SuggestionCtaSection />
      <DataDisclaimerSection />
    </>
  );
}
