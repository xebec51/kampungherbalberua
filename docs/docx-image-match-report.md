# Laporan Pencocokan & Pemasangan Foto DOCX

Sumber: `herba code (1).docx` — 143 gambar tertanam di `word/media/`, diekstrak dalam
urutan dokumen sebenarnya (resolusi `r:embed` → `document.xml.rels`, bukan nama file
`imageN.ext` yang acak).

Status: **selesai lokal**. Tidak ada perubahan remote/production dilakukan.

## 1. Ringkasan status 143 gambar

Diperbarui setelah dua putaran tinjauan: tinjauan manual internal terhadap 14 gambar
(§3), kemudian tinjauan dengan rujukan botani eksternal kredibel terhadap 5 gambar yang
masih unresolved (§3b).

| Status      | Jumlah | Nomor gambar |
|-------------|-------:|--------------|
| confirmed   | 139    | 1–143 kecuali baris di bawah (lihat manifest untuk daftar lengkap) |
| probable    | 0      | – |
| ambiguous   | 2      | 59, 101 |
| unmatched   | 2      | 88, 106 |
| ignored     | 0      | – |

Riwayat: confirmed 129 (awal) → 138 (setelah §3) → **139** (setelah §3b, +1 Katuk
gambar #105). probable 6 → 1 → **0**. ambiguous 5 → 1 → **2** (101 turun dari
probable). unmatched 3 → 3 → **2** (105 naik ke confirmed).

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

87 tanaman (dari total katalog HerbaCode di DOCX; naik dari 82 setelah tinjauan manual
§3) memiliki minimal satu gambar `confirmed`. Rincian lengkap ada di
`data/media/docx-image-match-report.json`; contoh sebagian (slug → nomor gambar
confirmed):

- `jahe`: 4, 46, 69, 84, 99, 117
- `kunyit`: 5, 78, 104, 116
- `kelor`: 3, 63, 66, 86, 110
- `sambiloto`: 2, 40
- `pegagan`: 8, 45, 54, 73, 75, 109
- `serai`: 16, 52, 119
- ... (lihat file JSON untuk daftar lengkap 82 tanaman)

Satu entri katalog, **rosela**, tidak memiliki gambar sama sekali di DOCX
(`plantsWithNoImageFound: ["rosela"]`).

## 3. Tinjauan manual 14 gambar (posisi DOCX + visual + database lokal)

14 gambar yang sebelumnya berstatus `probable`/`ambiguous`/`unmatched` ditinjau satu
per satu secara manual: dibuka visual, dibandingkan posisi paragraf DOCX (heading
entri, zona kesehatan, batas antarentri) dan bila perlu dibandingkan dengan gambar lain
yang sudah `confirmed` dalam dokumen yang sama. Metodologi lengkap dan bukti per gambar
ada di riwayat percakapan; ringkasan keputusan:

| Gambar | Kandidat awal | Keputusan final | Status | Confidence | Alasan |
|---|---|---|---|---|---|
| 32 | Paliasa | Paliasa | confirmed | high | Heading "4. Paliasa" langsung sebelum gambar (tidak ambigu); daun cordate + venasi palmate konsisten dengan Kleinhovia hospita. |
| 33 | Daun dewa | Daun dewa | confirmed | high | Heading "6. Daun Dewa" langsung sebelum gambar; roset daun sukulen bertepi bergelombang khas Gynura pseudochina. |
| 39 | Kelor | Kelor | confirmed | high | Koreksi: alasan unmatched sebelumnya salah kutip (membandingkan ke Mengkudu, padahal posisi = Kelor). Anak daun majemuk kecil menyirip = ciri diagnostik Moringa oleifera. |
| 50 | Saga | Saga | confirmed | medium-high | Heading "Saga" tidak ambigu; anak daun majemuk kecil pada tanaman merambat konsisten dengan Abrus precatorius. |
| 59 | Brahmi | — (tetap tidak pasti) | ambiguous | low | Posisi eksplisit "Brahmi"/Bacopa monnieri, tapi visual jelas Centella asiatica (Pegagan, sudah confirmed terpisah). Kemungkinan foto tertukar di dokumen sumber. |
| 64 | Temulawak | Temulawak | confirmed | medium-high | Posisi sangat kuat (zona + entri berurutan langsung); rimpang oranye sesuai famili Curcuma. |
| 65 | Kencur | Kencur | confirmed | medium-high | Heading "Kencur" tidak ambigu; rimpang bulat gempal + tunas kemerahan khas Kaempferia galanga. |
| 87 | Boswellia | Boswellia | confirmed | medium | Heading "Boswellia" tidak ambigu; bibit berdaun majemuk menyirip sesuai tipe daun imparipinnate Boswellia serrata. |
| 88 | Daun Dewa | — (tetap tidak cocok) | unmatched | low | Posisi = Daun Dewa (entri kedua), visual = tanaman hias ornamental (mirip Coleus/Caladium), kontradiktif nyata dengan Gynura pseudochina asli (lih. #33). |
| 101 | Sambiloto | — (tetap tidak pasti) | probable | medium | Posisi tidak ambigu, tapi dibanding langsung dengan #2 (Sambiloto confirmed), bentuk daun lebih oval-tumpul dari lanset khas Andrographis. |
| 105 | Katuk | — (tetap tidak cocok) | unmatched | low | Posisi = Katuk (daun), visual = buah kecil tipe jambu air/Myrtaceae — kontradiktif nyata, tidak ada kandidat alternatif koheren. |
| 106 | Temu Putih | — (dipertegas) | unmatched | medium | Diubah dari ambiguous ke unmatched: rimpang kuning-kecoklatan khas jahe, bukan putih pucat khas Curcuma zedoaria; kemungkinan foto stok jahe yang salah dipasang. |
| 107 | Dong Quai | Dong Quai | confirmed | medium-high | Heading tidak ambigu; irisan akar kering bergelambir khas danggui (Angelica sinensis) dalam presentasi TCM. |
| 124 | Keladi tikus | Keladi tikus | confirmed | medium-high | Heading tidak ambigu, diapit entri Sirsak/Kunyit; daun sagitate berbintik khas Typhonium flagelliforme. |

**Hasil**: 9 gambar naik menjadi `confirmed` (32, 33, 39, 50, 64, 65, 87, 107, 124);
1 tetap `probable` (101); 1 tetap `ambiguous` (59); 3 tetap `unmatched` (88, 105, 106,
termasuk 106 yang dipertegas dari ambiguous → unmatched).

Tanaman yang memperoleh kandidat foto tambahan dari 9 gambar baru: paliasa, daun-dewa,
kelor, saga, temulawak (sudah punya foto), kencur, boswellia, dong-quai, keladi-tikus —
namun **hanya `saga`** yang ada di 17 tanaman database lokal dan belum punya foto utama,
sehingga menjadi satu-satunya kandidat instalasi baru (lihat §4, sudah diinstal via
`apply-one saga`).

5 gambar (59, 88, 101, 105, 106) tersisa membutuhkan pemeriksaan lebih lanjut dengan
rujukan botani eksternal — lihat §3b.

## 3b. Tinjauan dengan rujukan botani eksternal (5 gambar tersisa)

Kelima gambar yang masih `probable`/`ambiguous`/`unmatched` setelah §3 ditinjau ulang
menggunakan rujukan botani kredibel eksternal (kebun raya, lembaga flora resmi,
monograf regional, jurnal peer-review, herbarium universitas) untuk memverifikasi
morfologi — bukan riset internet sebagai identitas utama, hanya untuk konfirmasi visual.
Rincian lengkap tiap gambar (bukti posisi, bukti visual, ciri kontradiktif, kandidat
alternatif, kutipan rujukan lengkap dengan URL/sumber/tanggal akses) ada di
`data/media/docx-image-reference-review.json`.

| Gambar | Kandidat DOCX | Status sebelum | Keputusan final | Confidence | Referensi utama | Alasan |
|---|---|---|---|---|---|---|
| 59 | Brahmi / Bacopa monnieri | ambiguous | **ambiguous** (tetap) | low | NParks Singapore (Bacopa monnieri); Kew/ScienceDirect/WFO (Centella asiatica) | Daun bundar peltate bertangkai panjang = morfologi Centella asiatica (Pegagan, sudah confirmed terpisah), bukan Bacopa monnieri (sesil, spatulate-obovate). Posisi vs visual bertentangan nyata. |
| 88 | Daun Dewa / Gynura pseudochina | unmatched | **unmatched** (tetap) | low | PROTA via PlantUse; sumber etnobotani Indonesia | Daun besar menjari ungu-lime kontras bertentangan dengan Gynura pseudochina (roset, shallowly lobed, hijau polos) dan dengan gambar #33 (Daun Dewa confirmed asli). |
| 101 | Sambiloto / Andrographis paniculata | probable | **ambiguous** (turun dari probable) | low | NParks Singapore; PLOS ONE (jurnal peer-review) | Ujung daun tumpul + bentuk oval-lebar bertentangan dengan ciri diagnostik ujung acuminate/lanset sempit Andrographis paniculata, dan dengan gambar #2 (Sambiloto confirmed asli). |
| 105 | Katuk / Sauropus androgynus | unmatched | **confirmed** (naik, koreksi) | medium-high | NParks Singapore; PROSEA via PlantUse | Buah bulat kecil gradasi putih-ke-marun berkelopak mahkota gelap justru ciri diagnostik Sauropus androgynus/Breynia androgyna ("menyerupai manggis mini") — penilaian unmatched sebelumnya keliru, tanpa verifikasi rujukan. |
| 106 | Temu Putih / Curcuma zedoaria | ambiguous (per §3) | **unmatched** (dipertegas) | medium-high | NTBG (kebun raya); J-STAGE + Oxford Herbaria (Zingiber officinale) | Daging rimpang kuning-cokelat keemasan bertentangan dengan ciri diagnostik daging putih/putih-kebiruan Curcuma zedoaria; cocok warna khas jahe (yang sudah punya foto confirmed terpisah). |

**Hasil §3b**: 1 gambar naik ke `confirmed` (105/Katuk); 1 turun dari `probable` ke
`ambiguous` (101); 2 tetap `unmatched` dengan bukti eksternal lebih kuat (88, 106); 1
tetap `ambiguous` dengan bukti eksternal lebih kuat (59). Tidak ada gambar yang
dipaksakan `confirmed` tanpa bukti visual+posisi yang sama-sama mendukung.

`katuk` (dari gambar #105 yang kini confirmed) **tidak ada di 17 tanaman database
lokal**, sehingga tidak menghasilkan kandidat instalasi baru di lingkungan ini — sudah
diverifikasi via regenerasi upload plan (lihat §4).

Sisa 4 gambar (59, 88, 101, 106) masih membutuhkan pemeriksaan manusia lebih lanjut
(foto pembanding definitif dari sumber yang menyebut spesies secara eksplisit,
kemungkinan verifikasi silang dengan buku identifikasi cetak) sebelum bisa
dipertimbangkan lebih jauh — bukti saat ini cukup untuk menolak kandidat DOCX yang ada,
tapi tidak cukup untuk memastikan identitas alternatif secara aman.

## 4. Instalasi lokal ke database

Katalog di atas mencakup seluruh tanaman HerbaCode dari DOCX (jauh lebih banyak dari
yang ada di seed database lokal). Dari 87 tanaman dengan kandidat `confirmed`, sudah
**14 tanaman yang ada di database lokal** (seed dev, 17 tanaman total) dan terinstal:

`jahe, kunyit, temulawak, serai, pare, brotowali, mahkota-dewa, mengkudu, kayu-putih,
beluntas, eucalyptus, garcinia, kopi-hijau, saga`

**Kandidat instalasi baru dari tinjauan §3**: `saga` (sumber `data/media/docx-extract/050.jpg`)
adalah satu-satunya tanaman lokal tanpa foto utama yang mendapat kandidat baru dari
tinjauan §3, dan **sudah diinstal** via `apply-one saga` (lihat §4a untuk rincian
apply + bukti idempotensi). Rencana instalasi (`data/media/docx-image-upload-plan.json`)
sudah diregenerasi ulang setelah instalasi Saga selesai — Saga kini tercatat
`action: "skip"` dengan alasan "Tanaman sudah memiliki foto yang valid; foto existing
dipertahankan.", identik dengan 13 tanaman lain yang sudah lebih dulu terinstal
(`install=0` di seluruh 87 item plan). Tanaman lain yang naik status pada tinjauan §3
(paliasa, daun-dewa, kelor, kencur, boswellia, dong-quai, keladi-tikus) tidak ada di 17
tanaman seed lokal sehingga tidak menghasilkan kandidat instalasi apa pun di lingkungan
ini.

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

4 tanaman lokal (`delima, saga, daun-sirih, bunga-telang`) masih tanpa foto utama pada
saat instalasi pertama berjalan. Setelah tinjauan manual §3, `saga` mendapat kandidat
`confirmed` (gambar #50) dan **sudah diinstal** via `apply-one saga` (lihat §4a).
`delima`, `daun-sirih`, dan `bunga-telang` tetap tanpa kecocokan `confirmed` di 143
gambar DOCX (bukan kegagalan pipeline — DOCX memang tidak memuat foto untuk
tanaman-tanaman ini, atau tanaman ini bukan bagian dari katalog HerbaCode DOCX).

Foto yang sudah ada sebelumnya (valid) **tidak ada satupun yang ditimpa** — audit awal
menunjukkan 0 tanaman lokal dengan foto utama valid sebelum instalasi ini berjalan.

## 4a. Instalasi tunggal Saga (`apply-one`) + bukti idempotensi

Setelah tinjauan §3 mengonfirmasi kandidat baru untuk `saga`, dijalankan instalasi
**khusus satu tanaman** (bukan apply global) menggunakan mode `apply-one` baru yang
ditambahkan ke `scripts/media/docx-photo-install.ts` (juga `dry-run-one`) — memfilter
seluruh operasi ke `plant_slug === "saga"` dan berhenti bila plan memuat lebih dari satu
item `action=install` untuk slug tersebut.

Kondisi sebelum apply: `plant_id=ca31eee7-beac-4015-b466-e906346e7cdb`, `image_path`
null, 0 relasi `plant_media`, tanpa primary image, 26 `media_assets` di database,
checksum SHA-256 file sumber `data/media/docx-extract/050.jpg` =
`259f720266f50a6f19ab46dabef6d8eb294c18e2f5efb7570e5a3c2fe998eb03` (tidak ada
media_assets lain dengan checksum ini).

`dry-run-one saga`: source_file, source_hash, target_storage_path, plant_id, action,
replace_existing sesuai `docx-image-upload-plan.json`; `planned_changes=1`; tanpa
masalah (file ada, checksum cocok, plant_id ditemukan, tidak ada tabrakan path).

- **Apply run 1**: `installed=1, skip_sudah_primary=0, reuse_media=0, gagal=0`. Hasil:
  media_asset baru (checksum cover webp `fbcc35486f004d0c...`, berbeda dari raw-file
  hash karena checksum dihitung dari buffer webp terkompresi, bukan file mentah — pola
  yang sama berlaku untuk seluruh 13 instalasi sebelumnya, bukan perilaku baru),
  1 file di `media-originals/plants/saga/original-fbcc35486f00.webp`, 1 file di
  `media-public/plants/saga/cover-fbcc35486f00.webp` (terverifikasi dapat diunduh, 22970
  byte), 1 relasi `plant_media` (`is_primary: true, role: cover`). `media_assets` naik
  26→27, `plant_media` naik 13→14. 13 tanaman lain tidak berubah (media_id identik
  sebelum/sesudah, diverifikasi eksplisit).
- **Apply run 2 (idempotensi #1)**: `installed=0, skip_sudah_primary=1, reuse_media=0,
  gagal=0`. `media_assets`/`plant_media` tetap 27/14.
- **Apply run 3 (idempotensi #2)**: hasil identik dengan run 2 — `installed=0,
  skip_sudah_primary=1, reuse_media=0, gagal=0`. `media_assets`/`plant_media` tetap
  27/14.

Idempotensi terbukti: 0 upload baru, 0 media_asset baru, 0 relasi baru, 0 kegagalan,
0 operasi DELETE pada run 2 dan run 3.

**Pemeriksaan visual** (desktop 1440px, 375px, 320px, via Playwright):
halaman edit admin Saga (`/admin/tanaman/{id}/edit`) menampilkan foto baru dengan benar
(`alt="Foto Saga"`, tanpa overflow horizontal di ketiga lebar layar; placeholder
fallback tidak lagi tampil). Halaman publik `/tanaman/saga` render bersih tanpa error
di ketiga lebar layar, **namun foto DOCX yang baru tidak tampil di sana** — ini
keterbatasan lingkungan dev lokal yang sudah ada sebelumnya (sama akar masalah dengan
kasus jahe yang sudah didokumentasikan): tabel `herbacode_plant_zone_entries` kosong
secara lokal (`count=0`), sehingga `getHerbaCodePlantBySlug` jatuh ke dataset statis
`data/herbacode/herbacode-data.json` yang tidak pernah menyertakan `mediaByPlantId` ke
`buildProfiles(...)`. Jalur database (`fetchHerbaCodeProfilesFromDatabase`) sudah benar
memanggil `getPrimaryPlantMediaMap`, sehingga di production (tempat
`herbacode_plant_zone_entries` terisi) foto akan tampil normal. Bukan bug baru dari
pekerjaan ini.

## 5. File terkait

- `data/media/docx-image-match-report.json` — hasil pencocokan visual 143 gambar (sumber kebenaran per-gambar).
- `data/media/docx-image-reference-review.json` — tinjauan 5 gambar (§3b) dengan rujukan botani eksternal: bukti posisi, bukti visual, ciri kontradiktif, kandidat alternatif, kutipan rujukan lengkap (judul, sumber/lembaga, URL, bagian tanaman dibandingkan, ciri pendukung/kontra, tanggal akses).
- `data/media/docx-image-position-manifest.json` — manifest posisi/metadata teknis 143 gambar.
- `data/media/docx-image-upload-plan.json` — rencana instalasi terbaru, diregenerasi ulang (`plan`) setelah instalasi Saga selesai dan setelah tinjauan rujukan eksternal §3b: 87 kandidat, **0 install, 87 skip** (14 sudah punya foto termasuk Saga, 73 tidak ada di database lokal — termasuk `katuk` dari gambar #105 yang kini confirmed, tie-break tetap memilih gambar #67 sebagai kandidat utama karena bernomor lebih rendah). Tidak ada item `install` yang tersisa; tidak ada kandidat instalasi lokal baru dari kelima gambar §3b.
- `data/media/reports/docx-photo-audit.json` — audit foto existing vs kandidat confirmed.
- `data/media/reports/docx-photo-apply-log.json` — log eksekusi `apply-one saga` (kondisi sebelum, dry-run, run 1/2/3, bukti idempotensi).
- `data/media/docx-extract/001.*` … `143.*` — 143 file gambar hasil ekstraksi mentah dari DOCX.
- `scripts/media/docx-photo-install.ts` — CLI lokal-only (`audit` → `plan` → `dry-run` → `apply`, plus `dry-run-one <slug>` → `apply-one <slug>` untuk instalasi satu tanaman), tidak terhubung ke pipeline remote manapun.

Seluruh proses di atas berjalan terhadap Supabase lokal (`http://127.0.0.1:54321`).
Tidak ada upload ke storage remote, tidak ada migration remote, dan tidak ada
perubahan `image_path` production.
