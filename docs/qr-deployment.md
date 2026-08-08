# Panduan Pemasangan QR Jalan, Zona, Produk, dan Kotak Saran

QR publik baru memakai `qr_key` permanen yang terpisah dari slug halaman. Jangan memakai `khb-z01`, `khb-z02`, dan kode internal sejenis pada URL QR baru, teks cetak, nama file, atau UI publik.

## Prinsip

1. QR jalan hanya menuju `/qr/jalan/[qrKey]`, lalu redirect ke `/jalan/[slug]`.
2. QR zona hanya menuju `/qr/zona/[qrKey]`, lalu redirect ke `/zona-kesehatan/[slug]`.
3. QR tanaman hanya menuju `/qr/tanaman/[qrKey]`, lalu redirect ke `/tanaman/[slug]`.
4. QR katalog produk dan QR kotak saran menuju target tetap `/qr/produk` dan `/qr/kotak-saran` -- keduanya halaman statis tanpa baris database, jadi tidak ada `qr_key`/slug per entitas; redirect-nya tetap dipertahankan supaya QR yang sudah dicetak tidak perlu diganti walaupun struktur URL berubah suatu saat.
5. `qr_key` tidak berubah walaupun slug atau judul halaman diperbarui.
6. Route lama `/z/[code]` dipertahankan hanya untuk kompatibilitas QR zona lama.
7. Tidak ada tracking scan, cookie, lokasi, atau data pribadi.

Contoh production:

- `https://kampungherbalberua.web.id/qr/jalan/digestia`
- `https://kampungherbalberua.web.id/qr/zona/pencernaan-sehat`
- `https://kampungherbalberua.web.id/qr/produk`
- `https://kampungherbalberua.web.id/qr/kotak-saran`

## Memeriksa Domain

Pastikan `NEXT_PUBLIC_SITE_URL` memakai domain production `https://kampungherbalberua.web.id` sebelum QR dicetak massal. Jangan mencetak QR yang masih mengarah ke localhost atau Vercel Preview.

## Mengunduh QR

1. Login sebagai admin.
2. Untuk zona, buka `/admin/zona`, lalu halaman edit zona. Untuk tanaman, buka halaman edit tanaman.
3. Untuk jalan, gunakan endpoint admin jalan yang sesuai.
4. Untuk katalog produk, buka `/admin/produk` -- panel QR tampil di bagian atas halaman.
5. Untuk kotak saran, buka `/admin/kotak-saran` -- panel QR tampil di bagian atas halaman.
6. Periksa URL QR permanen dan halaman tujuan.
7. Unduh SVG untuk papan fisik dan kebutuhan cetak.
8. Unduh PNG untuk pratinjau, WhatsApp, atau dokumen digital.

Endpoint:

- `/admin/jalan/[id]/qr?format=svg`
- `/admin/jalan/[id]/qr?format=png`
- `/admin/zona/[id]/qr?format=svg`
- `/admin/zona/[id]/qr?format=png`
- `/admin/tanaman/[id]/qr?format=svg`
- `/admin/tanaman/[id]/qr?format=png`
- `/admin/produk/qr?format=svg`
- `/admin/produk/qr?format=png`
- `/admin/kotak-saran/qr?format=svg`
- `/admin/kotak-saran/qr?format=png`

PNG dibuat minimal 1024 x 1024 dengan latar putih dan margin cukup. SVG tetap menjadi pilihan utama untuk papan fisik.

## Ekspor Massal

`npm run qr:export` mengekspor seluruh QR jalan/zona/tanaman yang published, ditambah QR katalog produk dan kotak saran, sekaligus ke `data/qrcodes/{jalan,zona,tanaman,produk,kotak-saran}/` (SVG + PNG) beserta `data/qrcodes/manifest.json` sebagai indeks. Skrip ini hanya membaca Supabase lewat kunci publishable/anon, jadi aman dijalankan langsung terhadap production.

## Uji Sebelum Cetak

1. Scan QR dengan beberapa telepon.
2. Pastikan QR jalan membuka halaman jalan, bukan zona.
3. Pastikan QR zona membuka halaman zona kesehatan, bukan jalan.
4. Ubah slug pada data uji, lalu pastikan QR berbasis `qr_key` tetap menuju halaman terbaru.
5. Pastikan konten target berstatus published.
6. Lakukan uji cetak ukuran kecil sebelum produksi massal.
7. Verifikasi lagi setelah papan dipasang.

## Mengubah Materi

Perubahan materi, status validasi, judul, atau slug dilakukan dari dashboard admin. Selama `qr_key` tidak berubah, QR baru tidak perlu dicetak ulang.
