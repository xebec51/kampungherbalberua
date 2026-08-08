import { NextResponse, type NextRequest } from "next/server";

function handleSuggestionBoxQrRedirect(request: NextRequest) {
  return NextResponse.redirect(new URL("/kotak-saran", request.url), 307);
}

export async function GET(request: NextRequest) {
  return handleSuggestionBoxQrRedirect(request);
}

export async function HEAD(request: NextRequest) {
  return handleSuggestionBoxQrRedirect(request);
}
