import { NextResponse, type NextRequest } from "next/server";
import { getPublishedPlantQrTargetByKey } from "@/lib/data/plants";

type PlantQrRouteContext = {
  params: Promise<{
    qrKey: string;
  }>;
};

const qrKeyPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const legacyZoneCodePattern = /^khb-z[0-9]{2}$/;

async function handlePlantQrRedirect(
  request: NextRequest,
  { params }: PlantQrRouteContext,
) {
  const { qrKey } = await params;
  const normalizedQrKey = qrKey.toLowerCase();

  if (
    !qrKeyPattern.test(normalizedQrKey) ||
    legacyZoneCodePattern.test(normalizedQrKey)
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const plant = await getPublishedPlantQrTargetByKey(normalizedQrKey);

  if (!plant) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.redirect(new URL(`/tanaman/${plant.slug}`, request.url), 307);
}

export async function GET(request: NextRequest, context: PlantQrRouteContext) {
  return handlePlantQrRedirect(request, context);
}

export async function HEAD(request: NextRequest, context: PlantQrRouteContext) {
  return handlePlantQrRedirect(request, context);
}
