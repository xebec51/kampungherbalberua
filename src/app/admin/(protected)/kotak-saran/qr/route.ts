import { NextResponse, type NextRequest } from "next/server";
import { requireStaff } from "@/lib/auth/require-staff";
import {
  createSuggestionBoxQrPng,
  createSuggestionBoxQrSvg,
} from "@/lib/qr/health-zone-qr";

export async function GET(request: NextRequest) {
  await requireStaff("/admin/kotak-saran");

  const format = request.nextUrl.searchParams.get("format");

  if (format !== "svg" && format !== "png") {
    return NextResponse.json(
      { error: "Format QR tidak valid." },
      { status: 400 },
    );
  }

  const filename = `qr-kotak-saran.${format}`;

  if (format === "svg") {
    const svg = await createSuggestionBoxQrSvg();

    return new Response(svg, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "image/svg+xml; charset=utf-8",
      },
    });
  }

  const png = await createSuggestionBoxQrPng();

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "image/png",
    },
  });
}
