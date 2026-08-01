// Shared street <-> health zone pairing, the single source of truth for
// which HerbaCode zone a themed street's public plant list follows.
//
// This module exists specifically to break a circular import: streets.ts
// needs zone identity to source plant lists from HerbaCode, and
// herbacode.ts needs street identity to annotate zones with their paired
// street name. Neither file may import the other directly, so both import
// this neutral module instead.
//
// Streets and health zones remain two distinct entities with two distinct
// QR identities (see docs/... rollout report). This mapping only decides
// which zone's published HerbaCode content a street's plant list mirrors;
// it does not merge the two tables and does not change either QR target.
export type StreetZoneMapping = {
  streetSlug: string;
  streetQrKey: string;
  streetName: string;
  zoneSlug: string;
  zoneTitle: string;
};

export const STREET_ZONE_MAPPINGS: readonly StreetZoneMapping[] = [
  {
    streetSlug: "digestia",
    streetQrKey: "digestia",
    streetName: "Jl. Digestia",
    zoneSlug: "pencernaan-sehat",
    zoneTitle: "Zona Pencernaan Sehat",
  },
  {
    streetSlug: "respiria",
    streetQrKey: "respiria",
    streetName: "Jl. Respiria",
    zoneSlug: "pernapasan-lega",
    zoneTitle: "Zona Pernapasan Lega",
  },
  {
    streetSlug: "glycemia",
    streetQrKey: "glycemia",
    streetName: "Jl. Glycemia",
    zoneSlug: "gula-darah-terkendali",
    zoneTitle: "Zona Gula Darah Terkendali",
  },
  {
    streetSlug: "lipidia",
    streetQrKey: "lipidia",
    streetName: "Jl. Lipidia",
    zoneSlug: "obesitas-dan-metabolik",
    zoneTitle: "Zona Obesitas dan Metabolik",
  },
  {
    streetSlug: "imun",
    streetQrKey: "imun",
    streetName: "Jl. Imun",
    zoneSlug: "imunitas-kuat",
    zoneTitle: "Zona Imunitas Kuat",
  },
  {
    streetSlug: "hepatia",
    streetQrKey: "hepatia",
    streetName: "Jl. Hepatia",
    zoneSlug: "hati-sehat",
    zoneTitle: "Zona Hati Sehat",
  },
  {
    streetSlug: "feminia",
    streetQrKey: "feminia",
    streetName: "Jl. Feminia",
    zoneSlug: "kesehatan-perempuan",
    zoneTitle: "Zona Kesehatan Perempuan",
  },
  {
    streetSlug: "vaskulia",
    streetQrKey: "vaskulia",
    streetName: "Jl. Vaskulia",
    zoneSlug: "jantung-sehat",
    zoneTitle: "Zona Jantung Sehat",
  },
  {
    streetSlug: "pediatria",
    streetQrKey: "pediatria",
    streetName: "Jl. Pediatria",
    zoneSlug: "anak-ceria",
    zoneTitle: "Zona Anak Ceria",
  },
] as const;

export function getStreetZoneMappingByStreetSlug(streetSlug: string) {
  return STREET_ZONE_MAPPINGS.find((mapping) => mapping.streetSlug === streetSlug);
}

export function getStreetZoneMappingByZoneSlug(zoneSlug: string) {
  return STREET_ZONE_MAPPINGS.find((mapping) => mapping.zoneSlug === zoneSlug);
}
