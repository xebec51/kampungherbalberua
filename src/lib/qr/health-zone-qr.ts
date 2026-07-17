import QRCode from "qrcode";
import { absoluteUrl } from "@/lib/metadata";

const zoneCodePattern = /^khb-z[0-9]{2}$/;

export function getHealthZoneQrTarget(zoneCode: string) {
  const normalizedCode = zoneCode.trim();

  if (!zoneCodePattern.test(normalizedCode)) {
    throw new Error("Kode zona tidak valid.");
  }

  return absoluteUrl(`/z/${normalizedCode}`);
}

export async function createHealthZoneQrSvg(zoneCode: string) {
  return QRCode.toString(getHealthZoneQrTarget(zoneCode), {
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

export async function createHealthZoneQrPng(zoneCode: string) {
  return QRCode.toBuffer(getHealthZoneQrTarget(zoneCode), {
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
