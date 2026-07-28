export type LicenseDecision = {
  code: string | null;
  reason: string;
  status: "approved" | "rejected" | "needs_clarification";
  url: string | null;
};

const APPROVED_LICENSES = new Map<string, string>([
  ["CC0", "https://creativecommons.org/publicdomain/zero/1.0/"],
  ["PUBLIC DOMAIN", "https://creativecommons.org/publicdomain/mark/1.0/"],
  ["PUBLIC DOMAIN MARK", "https://creativecommons.org/publicdomain/mark/1.0/"],
  ["CC BY 4.0", "https://creativecommons.org/licenses/by/4.0/"],
  ["CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/"],
  ["CC BY 3.0", "https://creativecommons.org/licenses/by/3.0/"],
  ["CC BY-SA 3.0", "https://creativecommons.org/licenses/by-sa/3.0/"],
  ["CC BY 2.0", "https://creativecommons.org/licenses/by/2.0/"],
  ["CC BY-SA 2.0", "https://creativecommons.org/licenses/by-sa/2.0/"],
]);

const REJECTED_MARKERS = [
  "ALL RIGHTS RESERVED",
  "CC BY-NC",
  "CC BY-ND",
  "CC BY-NC-SA",
  "CC BY-NC-ND",
  "GFDL",
  "EDITORIAL USE",
  "FAIR USE",
  "UNKNOWN",
];

export function stripHtml(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function chooseLicense(
  licenseShortName: string | null | undefined,
  usageTerms: string | null | undefined,
  licenseUrl: string | null | undefined,
): LicenseDecision {
  const joined = [licenseShortName, usageTerms, licenseUrl]
    .map(stripHtml)
    .join(" ")
    .toUpperCase();

  if (!joined.trim()) {
    return {
      code: null,
      reason: "Lisensi kosong atau tidak tersedia.",
      status: "rejected",
      url: null,
    };
  }

  const rejectedMarker = REJECTED_MARKERS.find((marker) =>
    joined.includes(marker),
  );

  if (rejectedMarker) {
    return {
      code: null,
      reason: `Lisensi ditolak karena mengandung ${rejectedMarker}.`,
      status: "rejected",
      url: licenseUrl ? stripHtml(licenseUrl) : null,
    };
  }

  for (const [code, fallbackUrl] of APPROVED_LICENSES) {
    if (joined.includes(code)) {
      return {
        code: code === "PUBLIC DOMAIN MARK" ? "Public Domain" : code,
        reason: `Lisensi ${code} masuk whitelist proyek.`,
        status: "approved",
        url: licenseUrl ? stripHtml(licenseUrl) : fallbackUrl,
      };
    }
  }

  return {
    code: null,
    reason: "Lisensi tidak masuk whitelist otomatis.",
    status: "needs_clarification",
    url: licenseUrl ? stripHtml(licenseUrl) : null,
  };
}

export function buildAttributionText(input: {
  creatorName: string | null;
  licenseCode: string | null;
  sourcePageUrl: string;
  title: string;
}) {
  const creator = input.creatorName?.trim() || "Kreator tidak tercantum";
  const license = input.licenseCode ?? "Lisensi perlu klarifikasi";

  return `${input.title} oleh ${creator}, ${license}, sumber: ${input.sourcePageUrl}`;
}
