# Integrasi Peta Kampung

Dokumen ini menjelaskan fondasi integrasi peta Kampung Herbal Harmony Berua. Peta final disusun oleh tim Perencanaan Wilayah dan Kota, sehingga website saat ini hanya menyiapkan ruang, legenda, navigasi zona/jalan, dan aturan aset.

## Status Implementasi

- Halaman publik: `/peta`.
- Komponen reusable: `MapLocationCard`, `CommunityMapPlaceholder`, dan `MapLegend`.
- Konfigurasi lokal: `src/data/map-config.ts`.
- Lokasi aset final: `public/maps/`.
- Link lokasi eksternal: `https://maps.app.goo.gl/LZi2bArDspCxwpgn6`.

Tidak ada Google Maps API key, iframe kosong, Leaflet, MapLibre, koordinat tebakan, marker rumah, atau data pribadi warga.

## Format Aset Final

Prioritas format:

- `SVG`: pilihan utama untuk peta web karena tajam, ringan, dan mudah diberi ID objek.
- `WebP` atau `PNG`: fallback raster bila peta final tidak dapat diekspor sebagai SVG.
- `PDF`: arsip cetak atau kebutuhan papan fisik, bukan sumber utama render web.
- `GeoJSON`: hanya dipakai bila tim menyediakan data GIS yang sudah disaring privasinya.

Aset final harus ditempatkan di `public/maps/` dengan nama versi yang jelas, misalnya:

- `kampung-herbal-map-v1.svg`
- `kampung-herbal-map-v1.webp`
- `kampung-herbal-map-print-v1.pdf`
- `kampung-herbal-map-v1.geojson`

## Aturan ID Objek

Bila peta final memakai SVG atau GeoJSON, setiap objek publik harus memiliki ID stabil dan mudah dipetakan ke data website.

Format yang disarankan:

- Jalan tematik: `street-digestia`, `street-feminia`, `street-pediatria`.
- Zona kesehatan: `zone-imunitas-kuat`, `zone-pencernaan-sehat`.
- Fasilitas publik: `facility-<slug>`.
- Pintu masuk: `entrance-<slug>`.
- Titik informasi: `info-<slug>`.

ID tidak boleh memakai `khb-zNN`, nomor rumah, nama warga, koordinat pribadi, atau kode internal yang ditujukan hanya untuk database/admin.

## Privasi

Peta publik hanya boleh menampilkan informasi kawasan yang layak dibaca pengunjung umum. Jangan menampilkan:

- titik rumah;
- nama warga;
- nomor telepon;
- koordinat rumah;
- status kesehatan warga;
- data kunjungan medis;
- informasi yang dapat mengidentifikasi kondisi pribadi.

Bila tim menyediakan GeoJSON, data harus diaudit sebelum masuk repository. Layer yang mengandung rumah atau data pribadi harus dihapus dari versi publik.

## Atribusi

Setiap aset final harus mencatat:

- penyusun: tim Perencanaan Wilayah dan Kota;
- tahun atau tanggal versi;
- sumber dokumentasi wilayah;
- perubahan yang dilakukan untuk versi web;
- catatan privasi bila ada layer yang disederhanakan.

Atribusi ringkas ditampilkan di halaman `/peta`, sedangkan detail teknis dapat ditambahkan ke dokumen ini atau metadata aset.

## Penggantian Placeholder

Komponen `CommunityMapPlaceholder` disiapkan agar dapat diganti dengan:

- komponen SVG statis;
- gambar WebP/PNG melalui `next/image`;
- viewer interaktif internal bila data final sudah siap dan aman.

Sebelum mengganti komponen, pastikan:

- rasio visual tetap stabil agar tidak menyebabkan layout shift;
- semua area interaktif dapat digunakan keyboard;
- tidak ada request ke layanan pihak ketiga tanpa keputusan eksplisit;
- halaman tetap bekerja pada lebar 320px.
