import { NextResponse, type NextRequest } from "next/server";
import { getPublishedStreetQrTargetByKey } from "@/lib/data/streets";

type StreetQrRouteContext = {
  params: Promise<{
    qrKey: string;
  }>;
};

const qrKeyPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const legacyZoneCodePattern = /^khb-z[0-9]{2}$/;

async function handleStreetQrRedirect(
  request: NextRequest,
  { params }: StreetQrRouteContext,
) {
  const { qrKey } = await params;
  const normalizedQrKey = qrKey.toLowerCase();

  if (
    !qrKeyPattern.test(normalizedQrKey) ||
    legacyZoneCodePattern.test(normalizedQrKey)
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const street = await getPublishedStreetQrTargetByKey(normalizedQrKey);

  if (!street) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.redirect(new URL(`/jalan/${street.slug}`, request.url), 307);
}

export async function GET(request: NextRequest, context: StreetQrRouteContext) {
  return handleStreetQrRedirect(request, context);
}

export async function HEAD(request: NextRequest, context: StreetQrRouteContext) {
  return handleStreetQrRedirect(request, context);
}
