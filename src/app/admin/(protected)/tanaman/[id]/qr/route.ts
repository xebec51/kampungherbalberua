import { NextResponse, type NextRequest } from "next/server";
import { requireStaff } from "@/lib/auth/require-staff";
import { getPlantByIdForAdmin } from "@/lib/data/admin/plants";
import { createPlantQrPng, createPlantQrSvg } from "@/lib/qr/health-zone-qr";

type PlantQrRouteContext = {
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
  { params }: PlantQrRouteContext,
) {
  const { id } = await params;
  await requireStaff(`/admin/tanaman/${id}/edit`);

  const format = request.nextUrl.searchParams.get("format");

  if (format !== "svg" && format !== "png") {
    return NextResponse.json(
      { error: "Format QR tidak valid." },
      { status: 400 },
    );
  }

  const result = await getPlantByIdForAdmin(id);

  if (!result.data) {
    return NextResponse.json(
      { error: "Tanaman tidak ditemukan." },
      { status: 404 },
    );
  }

  const plant = result.data;
  const filename = `qr-tanaman-${safeFileName(plant.qr_key)}.${format}`;

  if (format === "svg") {
    const svg = await createPlantQrSvg(plant.qr_key);
    return new Response(svg, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "image/svg+xml; charset=utf-8",
      },
    });
  }

  const png = await createPlantQrPng(plant.qr_key);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "image/png",
    },
  });
}
