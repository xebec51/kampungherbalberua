import type { ProgramSupervisor, TeamMember } from "@/types";

export const teamMembers: TeamMember[] = [
  {
    id: "muh-rinaldi-ruslan",
    name: "Muh. Rinaldi Ruslan",
    studyProgram: "Sistem Informasi",
    faculty: "Fakultas Matematika dan Ilmu Pengetahuan Alam",
    entryYear: 2023,
    contribution:
      "Pengembangan fondasi portal digital dan integrasi data program.",
    photoPath: "/images/team/muh-rinaldi-ruslan.jpeg",
  },
  {
    id: "ananda-lukman",
    name: "Ananda Lukman",
    studyProgram: "Ilmu Ekonomi",
    faculty: "Fakultas Ekonomi dan Bisnis",
    entryYear: 2023,
    contribution:
      "Dukungan perspektif ekonomi warga dan pengembangan katalog produk masyarakat.",
    photoPath: "/images/team/ananda-lukman.jpeg",
  },
  {
    id: "siti-aulia-felinda-wijaya",
    name: "Siti Aulia Felinda Wijaya",
    studyProgram: "Teknik Perencanaan Wilayah Kota",
    faculty: "Fakultas Teknik",
    entryYear: 2023,
    contribution:
      "Dukungan pemetaan wilayah, denah, dan rencana integrasi data spasial.",
    photoPath: "/images/team/siti-aulia-felinda-wijaya.jpeg",
  },
  {
    id: "anisa-nursalsabila-rahman",
    name: "Anisa Nursalsabila Rahman",
    studyProgram: "Administrasi Publik",
    faculty: "Fakultas Ilmu Sosial dan Ilmu Politik",
    entryYear: 2023,
    contribution:
      "Dukungan informasi layanan warga, kinerja RT, dan pengelolaan aspirasi masyarakat.",
    photoPath: "/images/team/anisa-nursalsabila-rahman.jpeg",
  },
  {
    id: "anastasia-eugenia",
    name: "Anastasia Eugenia",
    studyProgram: "Farmasi",
    faculty: "Fakultas Farmasi",
    entryYear: 2023,
    contribution:
      "Dukungan verifikasi informasi tanaman dan edukasi ramuan sehat.",
    photoPath: "/images/team/anastasia-eugenia.jpeg",
  },
  {
    id: "buyung-rachmat-toar",
    name: "Buyung Rachmat Toar",
    studyProgram: "Farmasi",
    faculty: "Fakultas Farmasi",
    entryYear: 2023,
    contribution:
      "Dukungan penyusunan informasi pemanfaatan tradisional tanaman herbal.",
    photoPath: "/images/team/buyung-rachmat-toar.jpeg",
  },
  {
    id: "malika-az-zahra-bahtiar",
    name: "Malika Az Zahra Bahtiar",
    studyProgram: "Psikologi",
    faculty: "Fakultas Kedokteran",
    entryYear: 2023,
    contribution:
      "Dukungan pendekatan komunikasi warga dan penguatan partisipasi masyarakat.",
    photoPath: "/images/team/malika-az-zahra-bahtiar.jpeg",
  },
  {
    id: "muh-akbar",
    name: "Muh. Akbar",
    studyProgram: "Teknik Perencanaan Wilayah Kota",
    faculty: "Fakultas Teknik",
    entryYear: 2023,
    contribution:
      "Dukungan penyusunan data peta dan potensi wilayah Kampung Herbal.",
    photoPath: "/images/team/muh-akbar.jpeg",
  },
  {
    id: "nun-salsabila-maddeppungeng",
    name: "Nun Salsabila Maddeppungeng",
    studyProgram: "Farmasi",
    faculty: "Fakultas Farmasi",
    entryYear: 2023,
    contribution:
      "Dukungan edukasi kesehatan umum dan validasi konten ramuan tradisional.",
    photoPath: "/images/team/nun-salsabila-maddeppungeng.jpeg",
  },
  {
    id: "nur-aulia",
    name: "Nur Aulia",
    studyProgram: "Farmasi",
    faculty: "Fakultas Farmasi",
    entryYear: 2023,
    contribution:
      "Dukungan penyusunan informasi tanaman TOGA dengan bahasa kesehatan yang aman.",
    photoPath: "/images/team/nur-aulia.jpeg",
  },
];

export const programSupervisor: ProgramSupervisor = {
  name: "Prof. Dr. Ir. Suhasman, S.Hut., M.Si.",
  role: "Dosen Pembimbing Kelompok (DPK)",
  photoPath: "/images/team/dpk-suhasman.jpeg",
};

export const communityLeader: ProgramSupervisor = {
  name: "Dr. dr. Anna Khuzaimah, M.Kes",
  role: "Bu RT Kampung Herbal Harmony",
};

const priorityMemberId = "muh-rinaldi-ruslan";

export function getDisplayOrderedTeamMembers(): TeamMember[] {
  const priorityMember = teamMembers.find(
    (member) => member.id === priorityMemberId,
  );
  const restSortedByName = teamMembers
    .filter((member) => member.id !== priorityMemberId)
    .sort((a, b) => a.name.localeCompare(b.name, "id"));

  return priorityMember
    ? [priorityMember, ...restSortedByName]
    : restSortedByName;
}
