import { NextResponse, type NextRequest } from "next/server";
import { requireStaff } from "@/lib/auth/require-staff";
import { getHealthZoneByIdForAdmin } from "@/lib/data/admin/health-zones";
import {
  createHealthZoneQrPng,
  createHealthZoneQrSvg,
} from "@/lib/qr/health-zone-qr";

type HealthZoneQrRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function safeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(
  request: NextRequest,
  { params }: HealthZoneQrRouteContext,
) {
  const { id } = await params;
  await requireStaff(`/admin/zona/${id}/edit`);

  const format = request.nextUrl.searchParams.get("format");

  if (format !== "svg" && format !== "png") {
    return NextResponse.json(
      { error: "Format QR tidak valid." },
      { status: 400 },
    );
  }

  const result = await getHealthZoneByIdForAdmin(id);

  if (!result.data) {
    return NextResponse.json(
      { error: "Zona kesehatan tidak ditemukan." },
      { status: 404 },
    );
  }

  const zone = result.data;
  const filename = `qr-zona-${safeFileName(zone.qr_key)}.${format}`;

  if (format === "svg") {
    const svg = await createHealthZoneQrSvg(zone.qr_key);

    return new Response(svg, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "image/svg+xml; charset=utf-8",
      },
    });
  }

  const png = await createHealthZoneQrPng(zone.qr_key);

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "image/png",
    },
  });
}
