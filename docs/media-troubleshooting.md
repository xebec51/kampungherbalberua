# Media Troubleshooting

## Bucket mismatch

`npm run media:bootstrap` berhenti bila bucket sudah ada tetapi konfigurasi public/private, MIME, atau size limit berbeda. Periksa dashboard Supabase sebelum mengubah konfigurasi.

## Gambar ditolak

Penyebab umum:

- lisensi tidak whitelist
- kreator tidak tersedia
- source page tidak tersedia
- metadata tidak membuktikan nama ilmiah exact match
- ukuran terlalu kecil
- indikasi watermark, produk, kolase, atau orang sebagai fokus

## Build gagal karena image remote

Pastikan `next.config.ts` hanya mengizinkan:

```text
https://xkvgpauprhggykaxffkh.supabase.co/storage/v1/object/public/media-public/**
```

## Rollback tanpa delete

Jangan hapus object bulk. Untuk rollback tampilan, archive metadata atau lepaskan attachment media dari konten melalui migration/action yang teruji.
