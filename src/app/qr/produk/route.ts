import { NextResponse, type NextRequest } from "next/server";

function handleProductCatalogQrRedirect(request: NextRequest) {
  return NextResponse.redirect(new URL("/produk", request.url), 307);
}

export async function GET(request: NextRequest) {
  return handleProductCatalogQrRedirect(request);
}

export async function HEAD(request: NextRequest) {
  return handleProductCatalogQrRedirect(request);
}
