# Modul Zona Kesehatan

Modul zona kesehatan mendukung program papan fisik Kampung Herbal Harmony, sementara nama website utama tetap Kampung Herbal Berua.

## Tujuan

- Menyediakan halaman edukasi umum untuk sembilan jalan tematik.
- Menjaga QR tetap permanen walaupun slug halaman berubah.
- Menyediakan fallback lokal agar halaman publik tetap berjalan tanpa Supabase.
- Menampilkan status validasi secara terbuka.

## Daftar Zona

| Kode | Jalan | Zona | Blok |
| --- | --- | --- | --- |
| `khb-z01` | Jl. Digestia | Zona Pencernaan Sehat | E1-10, H1-5 |
| `khb-z02` | Jl. Respiria | Zona Pernapasan Sehat | A1-7, D1-4, D9-14 |
| `khb-z03` | Jl. Glycemia | Zona Gula Darah Terkendali | H6-10, J2-4 |
| `khb-z04` | Jl. Lipidia | Zona Lemak Sehat | D5-14, E1-4, E13-14 |
| `khb-z05` | Jl. Imun | Zona Daya Tahan Tubuh | B1-9, C1-7 |
| `khb-z06` | Jl. Hepatia | Zona Hati Sehat | C8-13, F1-5 |
| `khb-z07` | Jl. Feminia | Zona Wanita Sehat Alami | F6-9, G1-3, G4-5 |
| `khb-z08` | Jl. Vaskulia | Zona Jantung dan Pembuluh Darah Sehat | J5-8, K1-6 |
| `khb-z09` | Jl. Pediatria | Zona Anak Ceria | I1-4, I5-11 |

## Route

- Daftar publik: `/zona-kesehatan`
- Detail canonical: `/zona-kesehatan/[slug]`
- Pintu QR permanen: `/z/[zone_code]`
- Admin: `/admin/zona`

## Konten dan Validasi

Materi zona bersifat edukasi umum. Jangan menulis diagnosis, dosis ramuan, klaim menyembuhkan, klaim mencegah penyakit, atau instruksi mengganti obat dokter. Status validasi harus terlihat, termasuk `Data demonstrasi`.

Untuk `verified`, admin wajib mengisi nama validator dan minimal satu catatan sumber.

## Foto

Foto papan belum dibuat otomatis oleh repository. Bila file belum tersedia di `public/images/zones/`, UI menggunakan placeholder lokal. Foto tidak boleh digunakan untuk mengambil nomor telepon, alamat, identitas orang, EXIF, atau GPS.

## Hubungan dengan Peta PWK

Halaman `/peta` menampilkan daftar zona dan blok sebagai denah konseptual. Leaflet, GeoJSON, KML, GPS, dan peta interaktif belum diaktifkan pada sprint ini.
