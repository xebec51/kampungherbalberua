import { DataDisclaimerSection } from "@/components/home/DataDisclaimerSection";
import { FeaturedStreetsSection } from "@/components/home/FeaturedStreetsSection";
import { FeaturedPlantsSection } from "@/components/home/FeaturedPlantsSection";
import { FeaturedHealthZonesSection } from "@/components/home/FeaturedHealthZonesSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { HerbaCodeSection } from "@/components/home/HerbaCodeSection";
import { HeroSection } from "@/components/home/HeroSection";
import { LatestActivitiesSection } from "@/components/home/LatestActivitiesSection";
import { MapPreviewSection } from "@/components/home/MapPreviewSection";
import { ProfileSection } from "@/components/home/ProfileSection";
import { QuickAccessSection } from "@/components/home/QuickAccessSection";

export const revalidate = 300;

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProfileSection />
      <QuickAccessSection />
      <FeaturedStreetsSection />
      <FeaturedHealthZonesSection />
      <FeaturedPlantsSection />
      <HerbaCodeSection />
      <MapPreviewSection />
      <FeaturedProductsSection />
      <LatestActivitiesSection />
      <DataDisclaimerSection />
    </>
  );
}
