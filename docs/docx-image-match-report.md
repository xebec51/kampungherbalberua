# Laporan Pencocokan & Pemasangan Foto DOCX

Sumber: `herba code (1).docx` — 143 gambar tertanam di `word/media/`, diekstrak dalam
urutan dokumen sebenarnya (resolusi `r:embed` → `document.xml.rels`, bukan nama file
`imageN.ext` yang acak).

Status: **selesai lokal**. Tidak ada perubahan remote/production dilakukan.

## 1. Ringkasan status 143 gambar

| Status      | Jumlah | Nomor gambar |
|-------------|-------:|--------------|
| confirmed   | 129    | 1–143 (lihat manifest untuk daftar lengkap) |
| probable    | 6      | 50, 64, 65, 101, 107, 124 |
| ambiguous   | 5      | 32, 33, 59, 87, 106 |
| unmatched   | 3      | 39, 88, 105 |
| ignored     | 0      | – |

Sumber data lengkap per gambar: `data/media/docx-image-match-report.json` (143 entri,
masing-masing berisi `image_number, image_file, plant_local_name, plant_slug, plant_id,
health_zone, positional_candidate, visual_match, status, confidence, reason,
visual_notes, duplicate_of, ignore_reason, reviewed_at`).

Manifest posisi permanen (metadata teknis tiap gambar — hash, ukuran, posisi paragraf,
kandidat berbasis posisi): `data/media/docx-image-position-manifest.json` (143 entri,
divalidasi tanpa duplikat/celah nomor).

Validasi integritas yang dijalankan sebelum laporan ini ditulis:
- 143 gambar diperiksa tepat satu kali (tidak ada nomor duplikat, tidak ada celah 1–143).
- Setiap entri memiliki `status` yang valid.
- Setiap entri `confirmed` memiliki `plant_slug`/`plant_local_name` yang jelas.
- Tidak ada entri `probable`/`ambiguous`/`unmatched` yang lolos ke tahap instalasi otomatis.

## 2. Tanaman dengan kandidat foto confirmed

82 tanaman (dari total katalog HerbaCode di DOCX) memiliki minimal satu gambar
`confirmed`. Rincian lengkap ada di `data/media/docx-image-match-report.json`; contoh
sebagian (slug → nomor gambar confirmed):

- `jahe`: 4, 46, 69, 84, 99, 117
- `kunyit`: 5, 78, 104, 116
- `kelor`: 3, 63, 66, 86, 110
- `sambiloto`: 2, 40
- `pegagan`: 8, 45, 54, 73, 75, 109
- `serai`: 16, 52, 119
- ... (lihat file JSON untuk daftar lengkap 82 tanaman)

Satu entri katalog, **rosela**, tidak memiliki gambar sama sekali di DOCX
(`plantsWithNoImageFound: ["rosela"]`).

## 3. Tanaman yang masih ambiguous / probable / unmatched

Gambar-gambar berikut **sengaja tidak diinstal** karena tidak lolos ambang keyakinan
visual (butuh tinjauan manual manusia sebelum dipasang):

| # | Status | Kandidat tanaman | Alasan singkat |
|---|--------|-------------------|-----------------|
| 32 | ambiguous | Paliasa | Daun berbentuk hati pada tanaman muda dalam pot, plausibel tapi terlalu generik untuk dipastikan. |
| 33 | ambiguous | Daun dewa | Roset daun bergelombang plausibel tapi kurang ciri khas lobus daun. |
| 39 | unmatched | (kandidat posisi: Mengkudu) | Daun majemuk kecil menyirip tidak cocok dengan Mengkudu; kandidat posisi jelas salah. |
| 50 | probable | Saga | Bentuk anak daun mirip beberapa kandidat lain (Meniran/Kelor), tidak sepenuhnya pasti. |
| 59 | ambiguous | Brahmi | Daun bundar bertangkai panjang khas pegagan, bukan Bacopa monnieri yang biasa disebut Brahmi. |
| 64 | probable | Temulawak | Rimpang oranye sesuai famili Curcuma tapi sulit dibedakan dari kunyit hanya dari foto rimpang. |
| 65 | probable | Kencur | Konsisten dengan kencur tapi tidak sepenuhnya pasti dari foto rimpang saja. |
| 87 | ambiguous | Boswellia (Kemenyan India) | Tidak menampilkan ciri khas kulit kayu beresin; pola daun terlalu generik. |
| 88 | unmatched | (kandidat posisi: Daun Dewa) | Daun besar berurat ungu-hijau kontras tampak seperti Caladium/Alocasia, bukan Daun Dewa. |
| 101 | probable | Sambiloto | Cukup konsisten tapi bentuk daun tampak lebih oval dari daun lanset khas Andrographis. |
| 105 | unmatched | (kandidat posisi: Katuk) | Foto buah kecil, bukan daun oval/kapsul khas Katuk. |
| 106 | ambiguous | Temu Putih | Rimpang tampak kuning (mirip jahe), bukan putih pucat khas Temu Putih; kemungkinan salah kandidat posisi. |
| 107 | probable | Dong Quai (Angelika Tiongkok) | Irisan akar kering generik, konsisten tapi tidak bisa dipastikan 100%. |
| 124 | probable | Keladi tikus | Cukup konsisten tapi bibit talas-talasan umumnya mirip satu sama lain. |

Tindak lanjut yang disarankan: tinjauan manusia dengan foto tambahan/referensi buku
untuk 14 gambar di atas sebelum dipertimbangkan untuk instalasi.

## 4. Instalasi lokal ke database

Katalog di atas mencakup seluruh tanaman HerbaCode dari DOCX (jauh lebih banyak dari
yang ada di seed database lokal). Dari 82 tanaman dengan kandidat `confirmed`, hanya
**13 tanaman yang ada di database lokal** (seed dev, 17 tanaman total) dan memenuhi
syarat instalasi (belum punya foto utama valid):

`jahe, kunyit, temulawak, serai, pare, brotowali, mahkota-dewa, mengkudu, kayu-putih,
beluntas, eucalyptus, garcinia, kopi-hijau`

Hasil instalasi (jalur lokal-only, `apply` pertama):
- **13/13 berhasil diinstal**, 0 gagal, 0 duplikat.
- Setiap tanaman mendapat `media_assets` baru (`source_type: kkn_documentation`,
  `content_status: published`) + relasi `plant_media` dengan `role: cover`,
  `is_primary: true`.
- File disimpan ke bucket lokal `media-originals` (2200×2200 webp) dan `media-public`
  (1200×900 webp, path `plants/{slug}/cover-{hash12}.webp`).

Idempotensi dibuktikan dengan menjalankan `apply` kedua kali: run kedua menghasilkan
**0 instalasi baru, 0 relasi duplikat, 0 kegagalan** — seluruh 13 tanaman sudah
terdeteksi memiliki foto utama dan dilewati.

4 tanaman lokal (`delima, saga, daun-sirih, bunga-telang`) tetap tanpa foto utama
karena tidak ada kecocokan `confirmed` untuk mereka di 143 gambar DOCX (bukan
kegagalan pipeline — DOCX memang tidak memuat foto untuk tanaman-tanaman ini, atau
tanaman ini bukan bagian dari katalog HerbaCode DOCX).

Foto yang sudah ada sebelumnya (valid) **tidak ada satupun yang ditimpa** — audit awal
menunjukkan 0 tanaman lokal dengan foto utama valid sebelum instalasi ini berjalan.

## 5. File terkait

- `data/media/docx-image-match-report.json` — hasil pencocokan visual 143 gambar (sumber kebenaran per-gambar).
- `data/media/docx-image-position-manifest.json` — manifest posisi/metadata teknis 143 gambar.
- `data/media/docx-image-upload-plan.json` — rencana instalasi (82 kandidat, 13 install, 69 skip).
- `data/media/reports/docx-photo-audit.json` — audit foto existing vs kandidat confirmed.
- `data/media/reports/docx-photo-apply-log.json` — log hasil eksekusi instalasi.
- `data/media/docx-extract/001.*` … `143.*` — 143 file gambar hasil ekstraksi mentah dari DOCX.
- `scripts/media/docx-photo-install.ts` — CLI lokal-only (`audit` → `plan` → `dry-run` → `apply`), tidak terhubung ke pipeline remote manapun.

Seluruh proses di atas berjalan terhadap Supabase lokal (`http://127.0.0.1:54321`).
Tidak ada upload ke storage remote, tidak ada migration remote, dan tidak ada
perubahan `image_path` production.
