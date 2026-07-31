# Laporan Sinkronisasi HerbaCode dengan Dokumen Final

Laporan ini menjelaskan hasil sinkronisasi data HerbaCode dari dokumen sumber terbaru terhadap data HerbaCode produksi sebelumnya. Versi mesin (JSON) dari laporan yang sama tersedia di [`data/herbacode/latest-import-report.json`](../data/herbacode/latest-import-report.json).

Laporan ini adalah hasil **dry-run** yang dijalankan terhadap salinan lokal yang merepresentasikan data produksi saat ini (9 zona, 50 tanaman, 95 relasi tanaman-zona), sebelum diterapkan ke database Supabase remote. Detail proses penerapan ke remote ada di bagian [Status Penerapan](#status-penerapan) di akhir dokumen.

## Ringkasan Jumlah Data

| | Sebelum | Sesudah |
|---|---:|---:|
| Zona kesehatan | 9 | 20 |
| Tanaman unik | 50 | 90 |
| Relasi tanaman-zona | 95 | 205 |

- Dokumen sumber: `herba code (1).docx`
- SHA-256 dokumen: `d330d5415441533412ee0fd08434a38c268886989468df8d14b727d8a520dd85`
- Koreksi judul zona otomatis (artefak nomor sumber / duplikat): **0** (judul pada dokumen ini sudah bersih)

## Zona Kesehatan

### 9 zona lama dipertahankan (zone_code permanen tidak berubah)

zone_code adalah identitas permanen QR dan tidak pernah diubah. Kesembilan zona ini dicocokkan berdasarkan judul lewat mapping legacy eksplisit di `scripts/herbacode/import.ts`, **bukan** berdasarkan urutan kemunculan pada dokumen — empat di antaranya (Tulang & Sendi, Kesehatan Mulut, Anti Mikroba, Kesehatan Perempuan) pindah posisi ke urutan ke-11 sampai ke-14 pada dokumen baru, namun zone_code-nya tetap sama seperti sebelumnya.

| zone_code | Judul | Urutan tampil publik (display_order) |
|---|---|---:|
| khb-z01 | Zona Imunitas Kuat | 1 |
| khb-z02 | Zona Pencernaan Sehat | 2 |
| khb-z03 | Zona Ginjal Sehat | 3 |
| khb-z04 | Zona Hati Sehat | 4 |
| khb-z05 | Zona Jantung Sehat | 5 |
| khb-z06 | Zona Tulang & Sendi | 11 |
| khb-z07 | Zona Kesehatan Mulut | 12 |
| khb-z08 | Zona Anti Mikroba | 13 |
| khb-z09 | Zona Kesehatan Perempuan | 14 |

Tidak ada zona lama yang diganti nama (renamed) atau dihapus.

### 11 zona baru (khb-z10 sampai khb-z20)

Kode zona baru diberikan berurutan mengikuti posisi kemunculan pada dokumen, melanjutkan nomor setelah kode legacy tertinggi (khb-z09), sehingga tidak pernah bertabrakan dengan kesembilan zona lama.

| zone_code | Judul | Urutan tampil publik (display_order) |
|---|---|---:|
| khb-z10 | Zona Gula Darah Terkendali | 6 |
| khb-z11 | Zona Pernapasan Lega | 7 |
| khb-z12 | Zona Otak Cerdas | 8 |
| khb-z13 | Zona Anak Ceria | 9 |
| khb-z14 | Zona Kulit Cantik | 10 |
| khb-z15 | Zona Detoks dan Antioksidan | 15 |
| khb-z16 | Zona Antiinflamasi dan Nyeri | 16 |
| khb-z17 | Zona Antikanker (Potensial) | 17 |
| khb-z18 | Zona Obesitas dan Metabolik | 18 |
| khb-z19 | Zona Tidur dan Relaksasi | 19 |
| khb-z20 | Zona Kesehatan Mata | 20 |

Zona baru dibuat berstatus **draft** dengan status validasi **pending** — tidak otomatis dipublikasikan dan tidak diberi data pemeriksa (validator) buatan. Admin perlu meninjau dan mempublikasikan lewat dashboard `/admin/zona` setelah verifikasi konten.

Urutan tampil publik di halaman `/zona-kesehatan` sekarang mengikuti kolom `display_order` (baru, independen dari `zone_code`) sesuai urutan dokumen, bukan lagi urutan leksikal `zone_code`.

## Relasi Zona-Jalan

**Tidak ada perubahan.** Dokumen sumber tidak memuat data jalan sama sekali. Sembilan jalan tematik yang sudah ada (Jl. Digestia, Jl. Respiria, Jl. Glycemia, Jl. Lipidia, Jl. Imun, Jl. Hepatia, Jl. Feminia, Jl. Vaskulia, Jl. Pediatria) dan relasinya tidak disentuh oleh proses import ini.

## Tanaman

### 62 tanaman lama cocok dengan dokumen (dipertahankan, ID/slug/gambar/atribusi tidak berubah)

60 tanaman cocok tepat berdasarkan nama lokal, 2 tanaman cocok lewat nama ilmiah (lihat bagian [Tanaman yang Cocok Lewat Nama Ilmiah](#tanaman-yang-cocok-lewat-nama-ilmiah-cross-vernakular) di bawah). Dari 62 ini, hanya **14** yang datanya benar-benar berubah (alias/nama lain baru ditambahkan dari dokumen); sisanya tidak memerlukan penulisan apa pun karena datanya sudah identik.

Adas, Alang-alang, Bawang Putih, Belimbing Wuluh, Beluntas, Boswellia, Brotowali, Cengkeh, Cincau Hijau, Cissus, Daun Dewa, Daun Jambu, Daun Salam, Daun Ungu, Dong Quai, Eucalyptus, Garcinia, Jahe, Jeruk Nipis, Jintan Hitam, Kapulaga, Katuk, Kayu Manis, Kayu Putih, Keji Beling, Kelor, Kemangi, Ketumbar, Kopi Hijau, Kumis Kucing, Kunyit, Kunyit Putih, Lidah Buaya, Mahkota Dewa, Mengkudu, Meniran, Miana, Mimba, Mint, Miswak, Oregano, Paliasa, Pare, Pegagan, Rambut Jagung, Rosella, Rosemary, Saga, Sage, Sambiloto, Seledri, Serai, Sidaguri, Sirih, Tapak Liman, Teh Hijau, Tempuyung, Temu Mangga, Temu Putih, Temulawak.

Untuk seluruh tanaman ini: ID, slug, gambar, media, atribusi, dan audit trail dipertahankan. Hanya informasi HerbaCode (senyawa aktif, manfaat per zona, bagian digunakan, budidaya, perhatian, cara pemanfaatan) yang diperbarui mengikuti isi dokumen. Field `care_instructions`, `preparation`, `traditional_uses`, `warnings` pada tabel `plants` (dikelola admin lewat dashboard, bukan oleh importer ini) tidak disentuh sama sekali.

### Tanaman yang Cocok Lewat Nama Ilmiah (Cross-Vernakular)

Dua entri dokumen memakai nama lokal berbeda dari yang sudah tersimpan, namun berhasil dicocokkan ke tanaman existing yang sama lewat nama ilmiah (bukan digabung menjadi baris baru — tetap satu identitas tanaman yang sama):

| Nama pada dokumen | Nama ilmiah pencocok | Cocok dengan tanaman existing |
|---|---|---|
| Daun Katuk | Sauropus androgynus (L.) Merr. | Katuk |
| Jinten Hitam | Nigella sativa L. | Jintan Hitam |

### 28 Tanaman Baru

Ditambahkan sebagai baris baru, berstatus **draft** dengan status validasi **pending** (tidak otomatis dipublikasikan, tidak ada validator buatan):

Anggur, Ashwagandha, Bayam Merah, Binahong, Blueberry, Brahmi, Brokoli, Calendula, Chamomile, Ginkgo, Goji Berry, Kakao, Keladi Tikus, Kencur, Kulit Manggis, Lavender, Lemon Balm, Marigold, Melati, Pala, Passion Flower, Rosela, Safron, Salam, Sirsak, Valerian, Willow Bark, Wortel.

**Catatan kualitas data sumber**: beberapa entri di atas memiliki nama ilmiah yang tidak lengkap pada dokumen sumber (hanya otoritas taksonomi tanpa genus/spesies, mis. "Nama ilmiah: L." untuk Rosela/Safron/Goji Berry, atau fragmen seperti "(Lodd.) Blume" untuk Keladi Tikus dan "L.) Aiton" untuk Melati). Sesuai aturan proyek untuk tidak mengarang atau meneliti data tambahan, nilai ini disimpan **apa adanya** dari dokumen dan memerlukan verifikasi manual oleh admin/botanis sebelum dipublikasikan — bukan hasil kesalahan ekstraksi.

### Tanaman Lama yang Dipertahankan (Tidak Ada di Dokumen)

**0 tanaman.** Dokumen final ini adalah superset dari data sebelumnya — seluruh 50 tanaman produksi sebelumnya muncul kembali di dokumen baru (baik cocok tepat maupun lewat nama ilmiah). Tidak ada tanaman atau relasi tanaman-zona lama yang perlu dipertahankan karena hilang dari dokumen.

### Mapping Ambiguous (Wajib Ditinjau Manual, Tidak Digabung Otomatis)

| Nama lokal | Nama ilmiah (dinormalisasi) | Catatan |
|---|---|---|
| Kunyit Putih | curcuma zedoaria christm roscoe | Temu Putih |
| Temu Putih | curcuma zedoaria christm roscoe | Kunyit Putih |

"Kunyit Putih" dan "Temu Putih" memiliki nama ilmiah yang nyaris identik (`Curcuma zedoaria (Christm.) Roscoe`, hanya berbeda titik di akhir) namun nama lokal berbeda. Keduanya **tetap dipertahankan sebagai dua tanaman terpisah** (tidak digabung otomatis) sesuai aturan proyek; diperlukan verifikasi botani manual untuk memastikan apakah keduanya benar-benar spesies yang sama atau berbeda secara regional.

### Mapping Unresolved

**0 tanaman.** Seluruh tanaman pada dokumen berhasil dipetakan menjadi baik tanaman existing (cocok tepat/alias/nama ilmiah) maupun tanaman baru yang sah.

## Relasi Tanaman-Zona

- **110 relasi baru dibuat** (kombinasi tanaman-zona yang belum pernah ada, termasuk seluruh relasi pada 11 zona baru).
- **95 relasi diperbarui** (seluruh relasi tanaman-zona lama, kontennya disegarkan mengikuti dokumen — status kerja seperti `content_status`, `validation_status`, dan data pemeriksa/`validator_*` pada baris yang sudah ada **tidak diubah**, hanya konten HerbaCode-nya yang disegarkan).
- **0 relasi lama dipertahankan karena tidak ada di dokumen** — seluruh 95 relasi lama muncul kembali di dokumen baru.

## Perubahan Lain yang Perlu Diketahui

- **Perbaikan bug ekstraksi**: parser sebelumnya kehilangan seluruh isi 5 dari 20 zona (50 relasi) karena hanya mendeteksi batas entri lewat label "Nama lokal"; beberapa zona pada dokumen final tidak memakai label tersebut sama sekali. Sudah diperbaiki dengan jangkar cadangan pada label "Nama ilmiah".
- **Perbaikan bug infrastruktur**: migration `20260730090000_admin_only_workflow.sql` (sudah aktif di production) menghapus bypass service-role pada trigger workflow `plants`/`health_zones`/`media_assets`/`herbacode_plant_zone_entries`, yang akan membuat seluruh script import service-role gagal total begitu migration itu berlaku penuh. Migration baru `20260731091000_restore_import_service_role_bypass.sql` memulihkan bypass tersebut dan **wajib diterapkan ke remote sebelum** menjalankan `herbacode:import:execute` terhadap remote.
- **Kolom baru** `health_zones.display_order` (migration `20260731090000_add_health_zone_display_order.sql`) memisahkan urutan tampil publik dari `zone_code` permanen.

## Status Penerapan

Laporan ini dihasilkan dari **dry-run terhadap Supabase lokal** (bukan remote). Sebelum diterapkan ke database production, urutan yang wajib diikuti:

1. Backup database remote.
2. `npx supabase db push --dry-run` terhadap remote, tinjau hasilnya.
3. Terapkan migration ke remote (termasuk migration pemulihan service-role di atas) hanya bila aman.
4. Jalankan `npm run herbacode:import` (dry-run) terhadap remote, pastikan laporan konsisten dengan laporan ini.
5. Baru jalankan `npm run herbacode:import:execute` terhadap remote setelah mendapat konfirmasi eksplisit.

Laporan JSON di `data/herbacode/latest-import-report.json` akan diperbarui otomatis oleh `scripts/herbacode/import.ts` setiap kali perintah di atas dijalankan.
