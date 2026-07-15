# Kampung Herbal Berua

Portal digital Kampung Herbal RT 009/RW 006 Kelurahan Berua untuk informasi tanaman TOGA, ramuan herbal, peta wilayah, produk warga, kinerja RT, dan layanan aspirasi masyarakat.

Website ini merupakan fondasi tahap pertama untuk ruang informasi publik Kampung Herbal Berua, Kecamatan Biringkanaya, Kota Makassar. Fokus tahap ini adalah halaman publik, struktur data lokal, desain responsif, dan dokumentasi pengembangan agar integrasi lanjutan dapat dilakukan secara bertahap.

## Tujuan

- Mengenalkan tanaman obat keluarga dan pemanfaatan tradisional secara aman.
- Menyediakan katalog awal ramuan sehat dengan disclaimer kesehatan.
- Menyiapkan ruang integrasi peta wilayah hasil tim Perencanaan Wilayah dan Kota.
- Menampilkan produk warga sebagai katalog demonstrasi.
- Mendokumentasikan kegiatan KKN dan Kampung Herbal.
- Menyediakan antarmuka kotak saran masyarakat tanpa penyimpanan data pada tahap pertama.

## Latar Belakang

Kampung Herbal Berua membutuhkan portal digital yang dapat menjadi induk integrasi berbagai program kerja: HerbaCode, informasi tanaman TOGA, ramuan sehat, denah wilayah, produk warga, potensi kunjungan edukasi, kinerja RT, aspirasi warga, dan dokumentasi kegiatan. Repository ini menyiapkan pondasi teknis agar data lapangan dapat dimasukkan secara aman setelah diverifikasi.

## Fitur Tahap Pertama

- Beranda publik dengan hero, akses cepat, profil singkat, HerbaCode, pratinjau peta, produk, kegiatan, dan disclaimer.
- Katalog tanaman TOGA dengan pencarian, filter kategori, detail tanaman, status validasi, placeholder lokasi, dan placeholder QR Code.
- Halaman ramuan sehat dengan bahan, takaran, langkah, saran penyajian, peringatan, dan disclaimer kesehatan.
- Katalog produk warga dengan detail produk dan tombol WhatsApp nonaktif saat kontak belum tersedia.
- Halaman tentang, peta, kunjungan edukasi, kegiatan, kinerja RT, kotak saran, dan tim KKN.
- Metadata dasar, Open Graph, sitemap, robots, ikon lokal, loading UI, dan not-found UI.

## Teknologi

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- ESLint
- npm

## Cara Instalasi

```bash
npm install
```

## Menjalankan Development Server

```bash
npm run dev
```

Development server default berjalan di `http://localhost:3000`.

## Pemeriksaan Kualitas

```bash
npm run lint
npm run build
```

Kedua perintah tersebut wajib dijalankan setelah perubahan utama.

## Struktur Folder

```text
src/
  app/                 Route App Router dan metadata route
  components/          Komponen layout, home, kartu, form, dan UI dasar
  data/                Data lokal TypeScript tahap pertama
  lib/                 Helper format, metadata, utilitas, dan WhatsApp
  types/               Tipe data konten
public/
  icons/               Ikon lokal
  images/placeholders/ Aset placeholder lokal
```

## Data Demonstrasi

Data tanaman, ramuan, produk, program RT, kegiatan, dan tim masih berupa data demonstrasi. Data final harus berasal dari pendataan lapangan dan proses verifikasi oleh pihak terkait sebelum dipublikasikan.

Status yang digunakan:

- `Data demonstrasi`
- `Menunggu verifikasi`
- `Segera tersedia`
- `Dalam pendataan`

## Pedoman Privasi Data Warga

- Jangan memasukkan data pribadi warga ke repository.
- Jangan menampilkan nomor telepon warga, alamat rumah, atau identitas kesehatan individual.
- Data kesehatan hanya boleh ditampilkan dalam bentuk agregat per zona.
- Kotak saran tahap pertama tidak menyimpan data, tidak memakai `localStorage`, dan tidak mengirim data ke API eksternal.
- File `.env`, `.env.local`, dan file kredensial lain tidak boleh di-commit.

## Pedoman Informasi Kesehatan

Informasi tanaman dan ramuan pada website ini disediakan untuk edukasi mengenai pemanfaatan tradisional. Informasi ini bukan diagnosis, resep, atau pengganti konsultasi dengan dokter, apoteker, maupun tenaga kesehatan lainnya.

Konten kesehatan harus menghindari klaim bahwa tanaman atau ramuan pasti menyembuhkan penyakit. Ibu hamil, anak-anak, lansia, penderita penyakit tertentu, dan pengguna obat rutin perlu diarahkan untuk berkonsultasi dengan tenaga kesehatan.

## Kontribusi Program KKN

Website disiapkan untuk mengintegrasikan hasil program kerja lintas bidang secara bertahap:

- Sistem Informasi: fondasi portal digital dan struktur integrasi data.
- Farmasi: informasi tanaman, ramuan sehat, dan validasi kesehatan.
- Perencanaan Wilayah dan Kota: denah, peta, dan data spasial.
- Administrasi Publik: layanan aspirasi dan informasi kinerja RT.
- Ilmu Ekonomi: katalog produk warga dan potensi ekonomi lokal.
- Psikologi: komunikasi warga dan penguatan partisipasi masyarakat.

## Environment

Contoh variabel tersedia di `.env.example`.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Jangan membuat atau mengisi `.env.local` dengan kredensial palsu untuk tahap ini.

## Roadmap

- Integrasi Supabase untuk data tanaman, ramuan, produk, kegiatan, dan kotak saran.
- Autentikasi admin dan dashboard pengelolaan konten.
- Integrasi pemetaan PWK menggunakan data denah, koordinat, GeoJSON, atau KML.
- HerbaCode dan QR Code dinamis setelah data tanaman diverifikasi.
- Penyimpanan foto dokumentasi dan aset lapangan.
- Deployment Vercel setelah konfigurasi domain dan environment siap.

## Fitur yang Sengaja Ditunda

Tahap pertama belum mengimplementasikan Supabase, database, login admin, dashboard admin, CRUD, penyimpanan foto, Leaflet, peta interaktif, GeoJSON/KML runtime, QR Code dinamis, pembayaran, checkout, kurir, rekam medis, data kesehatan individual, notifikasi WhatsApp otomatis, pengiriman formulir ke server, atau deployment Vercel.

## Status Proyek

Website publik tahap pertama sudah memiliki route utama, data lokal demonstrasi, desain responsif, metadata, sitemap, robots, ikon lokal, dan struktur yang siap menerima integrasi lanjutan.
