# Katalog Publik Tanaman Poster

Halaman `/tanaman` menampilkan katalog publik dari sumber `KHB-POSTER-216-2026`.
Katalog ini memakai `plant_source_entries` sebagai sumber utama, bukan hanya tabel
`plants`.

## Prinsip Data

- Poster memiliki 206 kemunculan tanaman pada 20 zona.
- Dari data poster yang tersedia, katalog publik berisi 89 nama unik.
- Nomor 157-166 tidak tersedia pada poster dan tidak dibuat sebagai data buatan.
- Satu nama poster menghasilkan satu kartu, walaupun muncul pada beberapa zona.
- Nama ambigu tetap tampil sebagai nama poster, tetapi tidak dipaksa menjadi
  identitas taksonomi.
- Status internal seperti `content_status`, `validation_status`, dan
  `identification_status` tidak menjadi syarat tampil di katalog poster.
- Nama ilmiah hanya ditampilkan bila sudah tersedia dari data tanaman yang
  terhubung.

## Media

Prioritas gambar katalog:

1. Media utama dari `plant_media` bila nama poster terhubung ke master tanaman.
2. Media utama dari `plant_source_label_media` bila nama hanya berasal dari poster.
3. Gambar herbal generik berlisensi sebagai ilustrasi referensi.

Gambar yang tidak mewakili identitas spesies secara pasti wajib diberi label
`Ilustrasi referensi`. Metadata lisensi, atribusi, URL sumber, checksum, ukuran,
dan status publikasi tetap wajib lengkap.

## Batasan Konten

Katalog poster tidak boleh menambahkan klaim kesehatan baru, dosis, klaim
penyembuhan, atau identitas ilmiah hasil tebakan. Untuk item poster-only,
halaman detail cukup menampilkan nama poster, zona/nomor kemunculan, gambar,
atribusi, dan keterangan bahwa nama tersebut tercantum pada poster Kampung
Herbal Harmony.
