import { NextResponse, type NextRequest } from "next/server";
import { getHealthZoneByCode } from "@/lib/data/health-zones";

type HealthZoneQrRouteContext = {
  params: Promise<{
    code: string;
  }>;
};

async function handleHealthZoneQrRedirect(
  request: NextRequest,
  { params }: HealthZoneQrRouteContext,
) {
  const { code } = await params;
  const normalizedCode = code.toLowerCase();

  if (!/^khb-z[0-9]{2}$/.test(normalizedCode)) {
    return new NextResponse(null, { status: 404 });
  }

  const zone = await getHealthZoneByCode(normalizedCode);

  if (!zone) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.redirect(
    new URL(`/zona-kesehatan/${zone.slug}`, request.url),
    307,
  );
}

export async function GET(
  request: NextRequest,
  context: HealthZoneQrRouteContext,
) {
  return handleHealthZoneQrRedirect(request, context);
}

export async function HEAD(
  request: NextRequest,
  context: HealthZoneQrRouteContext,
) {
  return handleHealthZoneQrRedirect(request, context);
}
