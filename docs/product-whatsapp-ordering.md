# Pemesanan Produk via WhatsApp

Katalog produk menyediakan tombol WhatsApp pada kartu produk dan halaman detail produk. Untuk produk contoh atau status `segera-tersedia`, tombol memakai label `Tanyakan via WhatsApp`. Untuk produk nyata berstatus `tersedia` atau `terbatas`, tombol memakai label `Pesan via WhatsApp`.

## Konfigurasi

Nomor kontak sementara produk disimpan di `src/config/contacts.ts`.

- Nomor input: `089623080501`
- Nomor untuk `wa.me`: `6289623080501`
- Produk dengan `whatsappNumber: null` memakai nomor fallback tersebut.
- Produk tetap dapat memakai nomor khusus melalui field `whatsappNumber` bila pendataan produsen sudah selesai.

## Format Pesan

Pesan dibuat oleh `createProductOrderMessage` dan memuat:

- nama produk;
- kategori;
- harga atau `Belum dikonfirmasi`;
- satuan atau `Belum dikonfirmasi`;
- status ketersediaan;
- jumlah awal `1`;
- permintaan informasi ketersediaan, harga final, dan cara pengambilan atau pengiriman.

## Batasan Tahap Ini

- Website belum menyimpan pesanan.
- Website belum memiliki keranjang, checkout, pembayaran, kurir, atau manajemen stok.
- Tombol WhatsApp hanya mengirim pesan awal yang aman dan dapat diedit oleh pengguna.
- Nomor kontak tidak disimpan di environment publik dan tidak memakai data pribadi warga.
- Website tidak menyimpan isi pesan, nomor pengguna, atau riwayat percakapan WhatsApp.
