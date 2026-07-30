# Katalog Produk

Katalog produk saat ini memakai data lokal di `src/data/products.ts`. Data yang tampil adalah produk contoh untuk menguji halaman katalog, detail produk, gambar, dan tautan WhatsApp sebelum daftar produk resmi Kampung Herbal Harmony Berua selesai dikonfirmasi.

## Lokasi Data

- Data produk: `src/data/products.ts`
- Kontak WhatsApp global: `src/config/contacts.ts`
- Helper pesan dan URL WhatsApp: `src/lib/whatsapp.ts`
- Helper label/perilaku tombol: `src/lib/product-actions.ts`
- Ilustrasi produk contoh: `public/images/products/examples/`

## Field Produk

- `id`: identitas stabil untuk key dan referensi internal.
- `slug`: path URL publik, harus unik dan stabil.
- `name`: nama produk yang tampil.
- `category`: kategori ringkas, misalnya minuman herbal atau bibit tanaman.
- `description`: deskripsi netral tanpa klaim menyembuhkan penyakit.
- `price`: harga dalam rupiah; gunakan `null` bila belum dikonfirmasi.
- `unit`: satuan jual; gunakan `null` bila belum dikonfirmasi.
- `image`: path aset lokal; kosongkan hanya bila perlu fallback visual.
- `producerName`: produsen/pengelola yang sudah dikonfirmasi.
- `whatsappNumber`: nomor khusus produk; gunakan `null` agar memakai kontak global.
- `availability`: `tersedia`, `terbatas`, `habis`, atau `segera-tersedia`.
- `featured`: tampil atau tidak pada bagian produk beranda.

## Mengganti Produk Contoh

Saat katalog resmi diterima:

1. Ganti entri di `src/data/products.ts` dengan produk asli.
2. Hapus label contoh dengan mengganti `producerName` menjadi produsen/pengelola yang benar.
3. Isi `price` dan `unit` hanya bila sudah dikonfirmasi.
4. Ubah `availability` sesuai stok aktual.
5. Ganti ilustrasi contoh dengan foto/ilustrasi yang sudah disetujui.
6. Pastikan tidak ada klaim diagnosis, penyembuhan, atau manfaat medis pasti.

Produk contoh harus dihapus setelah katalog resmi diterima agar pengunjung tidak salah memahami isi halaman.

## Format Nomor WhatsApp

Nomor ditulis sekali di `src/config/contacts.ts` dalam format lokal, misalnya `089623080501`. Helper `normalizeWhatsAppNumber` mengubahnya menjadi format `wa.me`, yaitu `6289623080501`.

Jangan menyalin nomor yang sama ke banyak komponen. Produk dengan `whatsappNumber: null` memakai nomor global.

## Format Gambar

Gunakan gambar lokal dari `public/images/products/`. Untuk produk contoh, gunakan ilustrasi, bukan foto yang tampak seperti dokumentasi nyata.

Rekomendasi:

- WebP untuk website.
- Rasio sekitar `16:10` untuk kartu.
- Rasio `4:3` tetap aman untuk detail.
- Alt text harus menjelaskan bila gambar adalah ilustrasi produk contoh.

## Status Stok dan Tombol

- `segera-tersedia`: tombol `Tanyakan via WhatsApp`.
- `tersedia`: tombol `Pesan via WhatsApp`.
- `terbatas`: tombol `Pesan via WhatsApp`.
- `habis`: tombol nonaktif `Stok habis`.

Website tidak menyimpan pesanan, nomor pengguna, isi pesan, checkout, pembayaran, atau pengiriman.

## Aturan Harga

Gunakan `price: null` bila harga belum final. UI dan pesan WhatsApp akan menampilkan `Belum dikonfirmasi`.

Jangan menampilkan harga perkiraan sebagai harga final. Bila harga berubah berdasarkan ukuran atau paket, isi harga setelah format resmi disepakati.

## Menguji Tautan WhatsApp

1. Buka `/produk`.
2. Klik dua produk berbeda.
3. Pastikan tombol mengarah ke `https://wa.me/6289623080501`.
4. Pastikan isi pesan memuat nama produk yang benar.
5. Pastikan harga dan satuan kosong tampil sebagai `Belum dikonfirmasi`.
6. Pastikan tidak ada teks `undefined` atau `null`.
