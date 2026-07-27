# Pemesanan Produk via WhatsApp

Katalog produk menyediakan tombol `Pesan via WhatsApp` pada kartu produk dan halaman detail produk. Tombol ini membuka `wa.me` dengan pesan awal yang menyebut nama produk dan Kampung Herbal Berua.

## Konfigurasi

Nomor kontak sementara produk disimpan di `src/config/contacts.ts`.

- Nomor input: `089623080501`
- Nomor untuk `wa.me`: `6289623080501`
- Produk dengan `whatsappNumber: null` memakai nomor fallback tersebut.
- Produk tetap dapat memakai nomor khusus melalui field `whatsappNumber` bila pendataan produsen sudah selesai.

## Batasan Tahap Ini

- Website belum menyimpan pesanan.
- Website belum memiliki keranjang, checkout, pembayaran, kurir, atau manajemen stok.
- Tombol WhatsApp hanya mengirim pesan awal yang aman dan dapat diedit oleh pengguna.
- Nomor kontak tidak disimpan di environment publik dan tidak memakai data pribadi warga.
