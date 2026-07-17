import { notFound, redirect } from "next/navigation";
import { getHealthZoneByCode } from "@/lib/data/health-zones";

type HealthZoneQrPageProps = {
  params: Promise<{
    code: string;
  }>;
};

export const revalidate = 300;
export const dynamicParams = true;

export default async function HealthZoneQrPage({ params }: HealthZoneQrPageProps) {
  const { code } = await params;
  const normalizedCode = code.toLowerCase();

  if (!/^khb-z[0-9]{2}$/.test(normalizedCode)) {
    notFound();
  }

  const zone = await getHealthZoneByCode(normalizedCode);

  if (!zone) {
    notFound();
  }

  redirect(`/zona-kesehatan/${zone.slug}`);
}
