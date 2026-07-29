# Kampung Herbal Berua

Portal digital Kampung Herbal RT 009/RW 006 Kelurahan Berua untuk informasi tanaman TOGA, ramuan herbal, peta wilayah, produk warga, kinerja RT, dan layanan aspirasi masyarakat.

Website ini merupakan fondasi tahap pertama untuk ruang informasi publik Kampung Herbal Berua, Kecamatan Biringkanaya, Kota Makassar. Fokus tahap ini adalah halaman publik, struktur data lokal, desain responsif, dan dokumentasi pengembangan agar integrasi lanjutan dapat dilakukan secara bertahap.

## Production

Website sudah terdeploy di Vercel:

<https://kampungherbalberua.vercel.app/>

Deployment dilakukan melalui Vercel dan tidak dikelola secara manual dari repository ini. Perubahan pada `main` tidak otomatis berarti deployment production berubah tanpa proses deploy Vercel yang sesuai.

## Tujuan

- Mengenalkan tanaman obat keluarga dan pemanfaatan tradisional secara aman.
- Menyediakan katalog awal ramuan sehat dengan disclaimer kesehatan.
- Menyiapkan ruang integrasi peta wilayah hasil tim Perencanaan Wilayah dan Kota.
- Menyediakan zona kesehatan tematik Kampung Herbal Harmony dengan QR permanen.
- Menampilkan produk warga sebagai katalog demonstrasi.
- Mendokumentasikan kegiatan KKN dan Kampung Herbal.
- Menyediakan antarmuka kotak saran masyarakat tanpa penyimpanan data pada tahap pertama.

## Latar Belakang

Kampung Herbal Berua membutuhkan portal digital yang dapat menjadi induk integrasi berbagai program kerja: HerbaCode, informasi tanaman TOGA, ramuan sehat, denah wilayah, produk warga, potensi kunjungan edukasi, kinerja RT, aspirasi warga, dan dokumentasi kegiatan. Repository ini menyiapkan pondasi teknis agar data lapangan dapat dimasukkan secara aman setelah diverifikasi.

## Fitur Tahap Pertama

- Beranda publik dengan hero, akses cepat, profil singkat, HerbaCode, pratinjau peta, produk, kegiatan, dan disclaimer.
- Katalog tanaman TOGA dengan pencarian, filter kategori, detail tanaman, status validasi, placeholder lokasi, dan placeholder QR Code.
- Dashboard admin dengan login Supabase Auth, logout, proteksi `/admin`, dan CRUD tanaman berbasis role.
- Modul zona kesehatan: `/zona-kesehatan`, `/zona-kesehatan/[slug]`, `/z/[code]`, admin zona, dan QR SVG/PNG.
- Halaman ramuan sehat dengan bahan, takaran, langkah, saran penyajian, peringatan, dan disclaimer kesehatan.
- Katalog produk warga dengan detail produk dan tombol WhatsApp nonaktif saat kontak belum tersedia.
- Halaman tentang, peta, kunjungan edukasi, kegiatan, kinerja RT, kotak saran, dan tim KKN.
- Metadata dasar, Open Graph, sitemap, robots, ikon lokal, loading UI, dan not-found UI.
- Media Library global untuk metadata gambar, sumber, atribusi, fallback lokal, admin media dasar, dan halaman `/sumber-gambar`.

## Teknologi

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- Supabase Auth, Supabase SSR, dan PostgreSQL RLS
- Supabase Storage untuk `media-originals` dan `media-public`
- QR Code server-side dengan `qrcode`
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

## Automated Testing

Automated test menjadi gate utama untuk validasi fitur publik, Supabase, RLS, admin, CRUD tanaman, CRUD zona kesehatan, QR permanen, dan role `viewer`, `editor`, `validator`, serta `admin`.

Perintah utama:

```bash
npm run test
npm run test:unit
npm run test:db
npm run test:e2e
npm run test:e2e:report
npm run test:ci
```

`npm run test:unit` menjalankan Vitest. `npm run test:db` menjalankan pgTAP melalui Supabase CLI lokal. `npm run test:e2e` menjalankan Playwright Chromium. `npm run test:ci` menjalankan lint, build, unit test, database test, dan E2E.

Database dan E2E test membutuhkan Docker karena memakai Supabase local development. Jalankan hanya terhadap Supabase lokal:

```bash
npx supabase start
npx supabase db reset
npm run test:db
npm run test:e2e
npx supabase stop
```

Playwright report dapat dibuka dengan:

```bash
npm run test:e2e:report
```

GitHub Actions menjalankan check `quality`, `database-test`, dan `e2e` pada Pull Request menuju `main`, push ke `main`, dan manual `workflow_dispatch`. Workflow preview smoke berjalan terpisah saat deployment preview sukses dan hanya memeriksa halaman publik non-destruktif. Branch protection disarankan mensyaratkan check `quality`, `database-test`, `e2e`, dan `preview-smoke` bila workflow preview dipakai.

Detail strategi dan troubleshooting tersedia di [docs/testing.md](docs/testing.md).

## Media Library dan Atribusi

Media konten dikelola melalui schema `media_assets` dan tabel attachment untuk tanaman, zona kesehatan, serta slot konten transisi. Gambar public disajikan dari bucket `media-public`, sedangkan original yang sudah dibersihkan metadata privasi disimpan private di `media-originals`.

Command media:

```bash
npm run media:bootstrap
npm run media:poster:validate
npm run media:poster:import -- --dry-run
npm run media:migrate:zones -- --dry-run
npm run media:research:plants -- --dry-run
npm run media:import -- --dry-run
```

Execute remote hanya boleh dilakukan dengan `.env.media-import.local`, project ref yang tepat, dan flag `--execute`. Secret media import tidak boleh masuk aplikasi, browser, Vercel, log, atau Git.

Dokumentasi terkait:

- [docs/media-library.md](docs/media-library.md)
- [docs/media-import.md](docs/media-import.md)
- [docs/image-licensing.md](docs/image-licensing.md)
- [docs/image-attribution.md](docs/image-attribution.md)
- [docs/media-troubleshooting.md](docs/media-troubleshooting.md)
- [docs/plant-poster-import.md](docs/plant-poster-import.md)

## Struktur Folder

```text
src/
  app/                 Route App Router dan metadata route
  components/          Komponen layout, home, kartu, form, dan UI dasar
  data/                Data lokal TypeScript (fallback)
  lib/                 Helper format, metadata, utilitas, dan WhatsApp
    auth/              Helper session, profile, role, dan redirect aman
    data/              Data-access layer tanaman, zona, dan admin
    qr/                Utility QR zona kesehatan
    supabase/          Konfigurasi dan client Supabase
  types/               Tipe data konten
public/
  icons/               Ikon lokal
  images/placeholders/ Aset placeholder lokal
supabase/
  migrations/          Migration SQL
  seed.sql             Seed data demonstrasi
  tests/               pgTAP, RLS test, dan fixture lokal automated test
docs/
  admin-dashboard.md   Panduan dashboard admin
  qr-deployment.md     Panduan unduh dan uji QR zona
  supabase-setup.md    Panduan setup Supabase
  testing.md           Strategi automated testing dan CI
  zona-kesehatan.md    Dokumentasi modul zona
  zona-photo-manifest.md Manifest foto zona yang diharapkan
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

Untuk deployment Vercel, isi minimal `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, dan `NEXT_PUBLIC_SITE_URL` pada
environment Production dan Preview. Aplikasi juga menerima alias
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, atau `NEXT_PUBLIC_SUPABASE_ANON_KEY` untuk
render server publik, tetapi client admin tetap membutuhkan key publik yang
tersedia di browser.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Jangan membuat atau mengisi `.env.local` dengan kredensial palsu. Aplikasi tetap dapat di-build dan dijalankan tanpa environment Supabase — lihat [Status Database dan Supabase](#status-database-dan-supabase).

## Status Database dan Supabase

Sprint ini menambahkan fondasi database Supabase untuk modul tanaman TOGA, autentikasi admin, zona kesehatan, dan QR permanen. Cakupan yang sudah tersedia:

- Migration SQL untuk tabel `profiles` dan `plants`, lengkap dengan enum, trigger `updated_at`, trigger pembuatan profile otomatis, index, dan Row Level Security (RLS).
- Migration tambahan untuk workflow tanaman.
- Migration SQL untuk tabel `health_zones`, constraint `zone_code`, trigger workflow, trigger permanensi QR, index, dan RLS.
- Seed data demonstrasi untuk enam tanaman (Jahe, Kunyit, Serai, Daun Sirih, Bunga Telang, Temulawak).
- Seed sembilan zona kesehatan Kampung Herbal Harmony.
- Data-access layer publik untuk tanaman dan zona.
- Data-access layer admin untuk dashboard, tanaman, dan zona.
- **Local fallback**: halaman publik tanaman dan zona tetap memakai data lokal bila Supabase belum dikonfigurasi, client gagal dibuat, query gagal, atau tabel masih kosong.
- Halaman yang sudah memakai data-access layer: `/`, `/tanaman`, `/tanaman/[slug]`, `/zona-kesehatan`, `/zona-kesehatan/[slug]`, `/z/[code]`, `/peta`, dan `sitemap.xml`.

Belum tersedia pada sprint ini (lihat juga [Fitur yang Sengaja Ditunda](#fitur-yang-sengaja-ditunda)):

- Supabase Storage / upload gambar.
- Migrasi modul ramuan, produk, kegiatan, dan program RT ke database.

**Service-role key tidak digunakan** di aplikasi ini. Seluruh akses database publik menggunakan publishable key yang tunduk pada RLS. Otorisasi data sepenuhnya ditegakkan oleh RLS di database, bukan oleh kode aplikasi.

RLS mengatur: pengunjung publik hanya dapat membaca tanaman berstatus `published`; staf aktif (`editor`, `validator`, `admin`) dapat membaca seluruh data termasuk draft; hanya `editor` dan `admin` yang dapat menambah/mengubah data; hanya `admin` yang dapat menghapus data; pengguna tidak dapat menaikkan role miliknya sendiri.

Panduan lengkap menghubungkan project Supabase, menjalankan migration, seed, dan menetapkan admin pertama ada di [docs/supabase-setup.md](docs/supabase-setup.md).

## Auth Admin dan Route Pengelolaan

Route admin:

- Login: `/admin/login`
- Dashboard: `/admin`
- Tanaman: `/admin/tanaman`, `/admin/tanaman/baru`, `/admin/tanaman/[id]/edit`
- Zona: `/admin/zona`, `/admin/zona/baru`, `/admin/zona/[id]/edit`
- QR zona: `/admin/zona/[id]/qr?format=svg` atau `?format=png`

Role dibaca dari `public.profiles` di server. `viewer` tidak dapat membuka dashboard, `editor` tidak dapat publish/delete, `validator` read-only, dan `admin` mengelola publikasi serta delete.

## Zona Kesehatan dan QR Permanen

Route publik:

- `/zona-kesehatan`
- `/zona-kesehatan/[slug]`
- `/z/[code]`

QR selalu memakai `zone_code` seperti `khb-z01`. Slug boleh berubah tanpa mencetak ulang QR karena `/z/[code]` melakukan redirect sementara ke halaman canonical terbaru.

Panduan operasional:

- [docs/admin-dashboard.md](docs/admin-dashboard.md)
- [docs/zona-kesehatan.md](docs/zona-kesehatan.md)
- [docs/qr-deployment.md](docs/qr-deployment.md)
- [docs/testing.md](docs/testing.md)
- [docs/zona-photo-manifest.md](docs/zona-photo-manifest.md)

## Migration Manual

Migration baru harus diterapkan manual oleh pengelola project Supabase setelah review:

- `supabase/migrations/20260717001000_enforce_plant_admin_workflow.sql`
- `supabase/migrations/20260717002000_create_health_zones.sql`

Codex tidak menjalankan `npx supabase db push`, seed remote, reset database, atau koneksi ke project Supabase lain.

## Roadmap

- Migrasi data ramuan, produk, kegiatan, dan program RT ke Supabase.
- Alur validasi khusus untuk validator.
- Supabase Storage untuk foto dokumentasi dan aset lapangan.
- Integrasi pemetaan PWK menggunakan data denah, koordinat, GeoJSON, atau KML.
- HerbaCode dan QR Code tanaman setelah data tanaman diverifikasi.
- Penyimpanan kotak saran ke database.

## Fitur yang Sengaja Ditunda

Sprint ini belum mengimplementasikan: Supabase Storage, upload gambar, crop gambar, galeri media, CRUD ramuan, CRUD produk, CRUD kegiatan, CRUD program RT, pengiriman kotak saran ke database, migrasi ramuan/produk/kegiatan/program RT ke database, Leaflet, peta interaktif, GeoJSON/KML runtime, tracking scan QR, GPS, data kesehatan individual, diagnosis, rekomendasi pengobatan, rekam medis, pengelolaan pengguna melalui dashboard, registrasi publik, OAuth, rich text editor, audit log lengkap, pembayaran, checkout, kurir, dan notifikasi WhatsApp otomatis.

## Perintah yang Tidak Boleh Dijalankan Terhadap Production Tanpa Backup

- `npx supabase db push` ke project production tanpa peninjauan SQL dan backup terlebih dahulu.
- `npx supabase db reset` — perintah ini hanya untuk database lokal/development, **jangan pernah** dijalankan terhadap project remote.
- Menjalankan `supabase/seed.sql` terhadap database production di luar proses seed yang eksplisit dan disengaja.
- Mengubah atau menghapus policy RLS langsung dari SQL editor production tanpa peninjauan.

## Status Proyek

Website publik tahap pertama sudah live di Vercel dengan route utama, desain responsif, metadata, sitemap, robots, dan ikon lokal. Sprint saat ini menambahkan auth admin, CRUD tanaman, zona kesehatan, dan QR permanen. Data lokal tetap dipertahankan sebagai fallback publik selama fase migrasi. Modul ramuan, produk, kegiatan, dan program RT masih memakai data lokal sepenuhnya.
