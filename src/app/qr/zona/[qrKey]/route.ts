import { NextResponse, type NextRequest } from "next/server";
import { getPublishedHealthZoneQrTargetByKey } from "@/lib/data/health-zones";

type HealthZoneQrRouteContext = {
  params: Promise<{
    qrKey: string;
  }>;
};

const qrKeyPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const legacyZoneCodePattern = /^khb-z[0-9]{2}$/;

async function handleHealthZoneQrRedirect(
  request: NextRequest,
  { params }: HealthZoneQrRouteContext,
) {
  const { qrKey } = await params;
  const normalizedQrKey = qrKey.toLowerCase();

  if (
    !qrKeyPattern.test(normalizedQrKey) ||
    legacyZoneCodePattern.test(normalizedQrKey)
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const zone = await getPublishedHealthZoneQrTargetByKey(normalizedQrKey);

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
