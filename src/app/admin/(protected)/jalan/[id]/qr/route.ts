import { NextResponse, type NextRequest } from "next/server";
import { requireStaff } from "@/lib/auth/require-staff";
import { getStreetByIdForAdmin } from "@/lib/data/admin/streets";
import { createStreetQrPng, createStreetQrSvg } from "@/lib/qr/health-zone-qr";

type StreetQrRouteContext = {
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
  { params }: StreetQrRouteContext,
) {
  const { id } = await params;
  await requireStaff("/admin");

  const format = request.nextUrl.searchParams.get("format");

  if (format !== "svg" && format !== "png") {
    return NextResponse.json(
      { error: "Format QR tidak valid." },
      { status: 400 },
    );
  }

  const result = await getStreetByIdForAdmin(id);

  if (!result.data) {
    return NextResponse.json(
      { error: "Jalan tematik tidak ditemukan." },
      { status: 404 },
    );
  }

  const street = result.data;
  const filename = `qr-jalan-${safeFileName(street.qr_key)}.${format}`;

  if (format === "svg") {
    const svg = await createStreetQrSvg(street.qr_key);

    return new Response(svg, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "image/svg+xml; charset=utf-8",
      },
    });
  }

  const png = await createStreetQrPng(street.qr_key);

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "image/png",
    },
  });
}
