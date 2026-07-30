# Modul Zona Kesehatan

Modul zona kesehatan mendukung program Kampung Herbal Harmony. Zona adalah tema edukasi kesehatan, sedangkan jalan adalah entitas lokasi terpisah.

## Prinsip Data

- `zone_code` tetap identitas internal permanen untuk database, admin, dan kompatibilitas QR lama.
- QR publik baru memakai `qr_key`, bukan `zone_code`.
- `zone_code` tidak ditampilkan kepada pengunjung publik.
- Nama jalan tidak boleh diisi dari nama zona.
- Bila data jalan riil belum tersedia, bagian jalan disembunyikan.
- Relasi jalan memakai tabel `streets` dan `health_zone_streets`.

## Route

- Daftar publik: `/zona-kesehatan`
- Detail canonical: `/zona-kesehatan/[slug]`
- QR publik baru: `/qr/zona/[qrKey]`
- Kompatibilitas QR lama: `/z/[zone_code]`
- Admin zona: `/admin/zona`
- Admin HerbaCode: `/admin/herbacode`

Route QR publik baru mencari target berdasarkan `qr_key` dan melakukan redirect sementara ke slug zona aktif. Route `/z/[zone_code]` tetap ada hanya untuk QR lama. Halaman tujuan tidak menampilkan kode mentah.

## Konten Zona

Halaman detail zona publik menampilkan daftar tanaman pada zona tersebut. Detail senyawa aktif, manfaat, bagian digunakan, budidaya, perhatian, dan cara pemanfaatan ditampilkan pada halaman detail tanaman.

Materi zona bersifat edukasi umum. Jangan menulis diagnosis, dosis ramuan, klaim menyembuhkan, klaim mencegah penyakit, atau instruksi mengganti obat dokter.

## Migration Terkait

- `20260717002000_create_health_zones.sql`: tabel zona dan QR permanen.
- `20260729100000_create_herbacode_zone_entries.sql`: relasi tanaman-zona HerbaCode.
- `20260729130000_separate_streets_and_repair_herbacode.sql`: tabel `streets`, relasi `health_zone_streets`, `street_name` nullable, repair data jalan tematik palsu, validasi HerbaCode, dan riwayat HerbaCode.
- `20260729183000_add_public_qr_keys.sql`: `qr_key` publik permanen untuk jalan dan zona.
