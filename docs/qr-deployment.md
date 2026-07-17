# Panduan Pemasangan QR Zona

QR zona selalu memakai `zone_code`, bukan slug.

## Prinsip

1. Target QR adalah `/z/[zone_code]`.
2. Contoh: `https://kampungherbalberua.vercel.app/z/khb-z01`.
3. Route `/z/[zone_code]` melakukan redirect sementara ke slug aktif.
4. Perubahan slug tidak memerlukan cetak ulang QR.
5. Tidak ada tracking scan.

## Memeriksa Domain

Pastikan `NEXT_PUBLIC_SITE_URL` memakai domain produksi sebelum QR dicetak massal. Jangan mencetak QR yang masih mengarah ke localhost atau Vercel Preview.

## Mengunduh QR

1. Login sebagai staf.
2. Buka `/admin/zona`.
3. Masuk ke halaman edit zona.
4. Periksa target URL pada panel QR.
5. Gunakan tombol `Unduh SVG` untuk kebutuhan desain/cetak vektor.
6. Gunakan tombol `Unduh PNG` untuk kebutuhan gambar raster.

PNG dibuat minimal 1024 x 1024 dengan latar putih dan margin cetak. SVG tetap menjadi pilihan utama untuk papan fisik.

## Uji Sebelum Cetak

1. Scan QR dengan beberapa telepon.
2. Pastikan target membuka halaman zona yang benar.
3. Ubah slug pada data uji, lalu pastikan `/z/[zone_code]` tetap menuju slug baru.
4. Lakukan uji cetak ukuran kecil sebelum produksi massal.
5. Verifikasi lagi setelah papan dipasang.

## Mengubah Materi

Perubahan materi, status validasi, atau slug dilakukan dari admin zona. Selama `zone_code` tidak berubah, QR tidak perlu dicetak ulang.
