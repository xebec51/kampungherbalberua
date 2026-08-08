import QRCode from "qrcode";
import { absoluteUrl } from "@/lib/metadata";

const productionQrSiteUrl = "https://kampungherbalberua.web.id";
const legacyZoneCodePattern = /^khb-z[0-9]{2}$/;
const qrKeyPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function normalizeZoneCode(zoneCode: string) {
  const normalized = zoneCode.trim();

  if (!legacyZoneCodePattern.test(normalized)) {
    throw new Error("Kode zona tidak valid.");
  }

  return normalized;
}

function normalizeQrKey(qrKey: string) {
  const normalized = qrKey.trim().toLowerCase();

  if (!qrKeyPattern.test(normalized) || legacyZoneCodePattern.test(normalized)) {
    throw new Error("QR key tidak valid.");
  }

  return normalized;
}

function qrAbsoluteUrl(path: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    try {
      const url = new URL(configuredUrl);

      if (url.hostname === "kampungherbalberua.web.id") {
        return new URL(path, `${url.origin}/`).toString();
      }
    } catch {
      // Fall back to the production QR domain below.
    }
  }

  return new URL(path, `${productionQrSiteUrl}/`).toString();
}

async function createQrSvg(targetUrl: string) {
  return QRCode.toString(targetUrl, {
    color: {
      dark: "#17211b",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
    margin: 4,
    type: "svg",
    width: 1024,
  });
}

async function createQrPng(targetUrl: string) {
  return QRCode.toBuffer(targetUrl, {
    color: {
      dark: "#17211b",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
    margin: 4,
    type: "png",
    width: 1024,
  });
}

export function getHealthZoneQrTarget(qrKey: string) {
  return qrAbsoluteUrl(`/qr/zona/${normalizeQrKey(qrKey)}`);
}

export function getStreetQrTarget(qrKey: string) {
  return qrAbsoluteUrl(`/qr/jalan/${normalizeQrKey(qrKey)}`);
}

export function getPlantQrTarget(qrKey: string) {
  return qrAbsoluteUrl(`/qr/tanaman/${normalizeQrKey(qrKey)}`);
}

export function getProductCatalogQrTarget() {
  return qrAbsoluteUrl("/qr/produk");
}

export function getSuggestionBoxQrTarget() {
  return qrAbsoluteUrl("/qr/kotak-saran");
}

export function getLegacyHealthZoneQrTarget(zoneCode: string) {
  return absoluteUrl(`/z/${normalizeZoneCode(zoneCode)}`);
}

export async function createHealthZoneQrSvg(qrKey: string) {
  return createQrSvg(getHealthZoneQrTarget(qrKey));
}

export async function createHealthZoneQrPng(qrKey: string) {
  return createQrPng(getHealthZoneQrTarget(qrKey));
}

export async function createStreetQrSvg(qrKey: string) {
  return createQrSvg(getStreetQrTarget(qrKey));
}

export async function createStreetQrPng(qrKey: string) {
  return createQrPng(getStreetQrTarget(qrKey));
}

export async function createPlantQrSvg(qrKey: string) {
  return createQrSvg(getPlantQrTarget(qrKey));
}

export async function createPlantQrPng(qrKey: string) {
  return createQrPng(getPlantQrTarget(qrKey));
}

export async function createProductCatalogQrSvg() {
  return createQrSvg(getProductCatalogQrTarget());
}

export async function createProductCatalogQrPng() {
  return createQrPng(getProductCatalogQrTarget());
}

export async function createSuggestionBoxQrSvg() {
  return createQrSvg(getSuggestionBoxQrTarget());
}

export async function createSuggestionBoxQrPng() {
  return createQrPng(getSuggestionBoxQrTarget());
}
