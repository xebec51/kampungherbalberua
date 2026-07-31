export const genericHerbaCodeZoneDescription =
  "Data tanaman dan pemanfaatan tradisional pada zona ini bersumber dari HerbaCode.";

const descriptionsBySlug: Record<string, string> = {
  "anti-mikroba":
    "Mikroba mencakup bakteri, virus, jamur, dan parasit; sebagian bermanfaat, sebagian dapat menyebabkan infeksi. Zona ini membahas kebersihan, penggunaan antimikroba secara bijak, dan pencegahan penularan tanpa klaim pengobatan.",
  "ginjal-sehat":
    "Ginjal membantu menyaring darah, membuang sisa metabolisme, dan mengatur cairan tubuh. Zona ini membahas perhatian umum terhadap kesehatan ginjal, termasuk cukup minum, tekanan darah, gula darah, dan pemeriksaan bila berisiko.",
  "hati-sehat":
    "Hati memproses zat gizi, membantu produksi empedu, dan mengolah obat maupun zat sisa agar dapat digunakan atau dibuang tubuh. Zona ini menekankan kebiasaan yang mendukung kerja hati secara umum.",
  "imunitas-kuat":
    "Sistem imun membantu tubuh mengenali dan merespons kuman, zat asing, serta perubahan sel yang berpotensi mengganggu kesehatan. Zona ini menekankan kebiasaan dasar seperti gizi seimbang, tidur cukup, aktivitas fisik, dan kebersihan.",
  "jantung-sehat":
    "Jantung dan pembuluh darah mengalirkan oksigen serta zat gizi ke seluruh tubuh. Zona ini membahas kebiasaan yang mendukung kesehatan kardiovaskular, seperti aktivitas fisik, pola makan seimbang, dan pengendalian faktor risiko.",
  "kesehatan-mulut":
    "Kesehatan mulut mencakup gigi, gusi, lidah, dan jaringan di sekitar mulut. Zona ini menekankan kebiasaan menyikat gigi, membersihkan sela gigi, dan pemeriksaan gigi rutin untuk menjaga fungsi makan dan berbicara.",
  "kesehatan-perempuan":
    "Kesehatan perempuan mencakup kesehatan fisik, mental, reproduksi, dan kebutuhan khusus sepanjang daur hidup. Zona ini membahas perhatian umum seperti kebersihan, siklus menstruasi, kehamilan, menopause, dan pemeriksaan kesehatan yang sesuai.",
  "pencernaan-sehat":
    "Sistem pencernaan mengolah makanan, menyerap zat gizi, dan membuang sisa yang tidak diperlukan tubuh. Zona ini membahas kebiasaan makan seimbang, cukup serat, hidrasi, dan pola hidup yang mendukung fungsi cerna.",
  "tulang-dan-sendi":
    "Tulang memberi struktur dan melindungi organ, sedangkan sendi membantu tubuh bergerak. Zona ini membahas dukungan umum untuk kekuatan tulang dan kenyamanan gerak melalui aktivitas fisik aman, gizi, dan kewaspadaan cedera.",
};

export function getHealthZoneShortDescription(
  slug: string,
  existingShortDescription?: string | null,
) {
  const existing = existingShortDescription?.trim();

  if (
    existing &&
    existing.toLocaleLowerCase("id") !==
      genericHerbaCodeZoneDescription.toLocaleLowerCase("id") &&
    existing.toLocaleLowerCase("id") !==
      slug.replaceAll("-", " ").toLocaleLowerCase("id") &&
    existing.toLocaleLowerCase("id") !==
      `zona ${slug.replaceAll("-", " ")}`.toLocaleLowerCase("id")
  ) {
    return existing;
  }

  // No curated description exists for this zone yet (e.g. a zone newly added
  // from a HerbaCode document update, pending manual curation). Fall back to
  // the zone's own placeholder-shaped text rather than an empty string --
  // showing the real, document-sourced title beats showing nothing, and this
  // never fabricates content beyond what the source already provided.
  return descriptionsBySlug[slug] ?? existing ?? "";
}

export function getHealthZoneDescriptionFallbacks() {
  return descriptionsBySlug;
}
