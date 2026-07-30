# Supabase Setup

Panduan ini menjelaskan cara menghubungkan repository Kampung Herbal Berua ke sebuah project Supabase, menjalankan migration dan seed, serta menetapkan admin pertama. Panduan ini tidak membuat project, tidak menjalankan migration ke remote, dan tidak mengisi kredensial apa pun secara otomatis — setiap langkah di bawah dilakukan secara sadar oleh pengelola project.

Sprint ini hanya memigrasikan modul **tanaman**. Belum ada login, dashboard admin, atau CRUD melalui antarmuka — lihat [Status Database dan Supabase](../README.md#status-database-dan-supabase) di README untuk cakupan lengkap.

## 1. Membuat project

Buat project baru melalui [dashboard Supabase](https://supabase.com/dashboard). Pilih organisasi, nama project, database password, dan region sesuai kebutuhan Anda sendiri. Simpan database password di pengelola kata sandi — jangan menuliskannya di repository ini.

Dokumen ini sengaja tidak mencantumkan nama project, password, region, atau project reference tertentu karena nilai-nilai tersebut spesifik untuk project Supabase milik Anda.

## 2. Mengambil environment variables

Di dashboard Supabase, buka **Project Settings → API**. Anda akan menemukan:

- **Project URL** → nilai untuk `NEXT_PUBLIC_SUPABASE_URL`.
- **Publishable key** (kunci publik yang aman dipakai di browser) → nilai untuk `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Halaman yang sama juga menampilkan **service-role key**. Kunci ini **tidak boleh** dipasang ke:

- Browser atau kode Client Component mana pun.
- Environment variable dengan prefix `NEXT_PUBLIC_`.
- Vercel Environment Variables pada scope apa pun.
- Repository ini, dalam bentuk apa pun.

Sprint ini tidak menggunakan service-role key sama sekali. Jangan menambahkannya sekarang.

## 3. Membuat `.env.local`

Buat file `.env.local` secara manual di root repository (file ini tidak dibuat otomatis oleh siapa pun). Isi dengan nilai dari langkah 2:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=isi-dengan-publishable-key-anda
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.env.local` sudah diabaikan oleh Git (lihat `.gitignore`), sehingga tidak akan pernah ter-commit. Jangan mengisi contoh di atas dengan kredensial palsu jika Anda hanya ingin menjalankan website tanpa Supabase — biarkan `.env.local` tidak dibuat sama sekali dan aplikasi akan otomatis memakai data lokal.

## 4. Menghubungkan CLI

Supabase CLI dijalankan melalui `npx` sehingga tidak perlu instalasi global. Login lalu hubungkan repository ke project Supabase Anda:

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
```

`<PROJECT_REF>` ada di URL dashboard project Anda (`https://supabase.com/dashboard/project/<PROJECT_REF>`). Jangan menjalankan `supabase link` tanpa project reference dan sesi login Anda sendiri — perintah ini mengikat repository ke project Supabase spesifik milik Anda.

## 5. Menjalankan migration

Migration SQL sudah tersedia di `supabase/migrations/`. Untuk menerapkannya ke project yang sudah di-link:

```bash
npx supabase db push
```

Perintah ini **mengubah schema project yang sedang terhubung**. Sebelum menjalankannya:

- Pastikan `npx supabase link` mengarah ke project yang benar (`npx supabase projects list` dapat membantu memverifikasi).
- Baca isi migration di `supabase/migrations/*_create_profiles_and_plants.sql` agar Anda memahami perubahan yang akan diterapkan (enum, tabel `profiles` dan `plants`, trigger, index, dan RLS policy).
- Jika project sudah memiliki data penting, buat backup terlebih dahulu (lihat bagian [10. Rollback dan backup](#10-rollback-dan-backup)).

Migration ini belum pernah dijalankan terhadap project remote mana pun oleh perubahan di repository ini. Anda yang menjalankannya, terhadap project Anda sendiri, secara sadar.

## 6. Menjalankan seed

`supabase/seed.sql` berisi enam tanaman demonstrasi (Jahe, Kunyit, Serai, Daun Sirih, Bunga Telang, Temulawak) yang identik dengan data lokal di `src/data/plants.ts`. Seed ini idempotent — aman dijalankan berulang kali karena menggunakan `slug` sebagai kunci `ON CONFLICT`.

**Local development**: jika Anda menjalankan Supabase secara lokal dengan Docker, `supabase/seed.sql` otomatis dijalankan setiap kali:

```bash
npx supabase db reset
```

**Remote**: perintah ini **tidak boleh** dijalankan terhadap project remote — `db reset` menghapus dan membangun ulang seluruh database. Untuk mengisi seed pada project remote, jalankan file SQL secara eksplisit melalui SQL Editor di dashboard Supabase, atau:

```bash
npx supabase db execute --file supabase/seed.sql --linked
```

Jalankan perintah ini hanya setelah Anda meninjau isi `supabase/seed.sql` dan yakin project yang terhubung (`--linked`) benar.

## 7. Membuat admin pertama

Tidak ada user yang otomatis menjadi admin. Setiap user baru yang mendaftar melalui Supabase Auth otomatis mendapat profile dengan `role = 'viewer'` melalui trigger database — role tidak pernah diambil dari metadata pendaftaran.

Langkah menetapkan admin pertama:

1. Buat user melalui **Authentication → Users → Add user** di dashboard Supabase (atau melalui alur signup aplikasi Anda sendiri di masa depan).
2. Salin **User UID** (UUID) milik user tersebut dari dashboard.
3. Buka **SQL Editor** di dashboard Supabase, lalu jalankan (ganti placeholder dengan UUID yang benar):

   ```sql
   update public.profiles
   set role = 'admin'
   where id = '<USER_UUID>';
   ```

4. Periksa kembali `<USER_UUID>` sebelum menjalankan query — query ini mengubah role secara langsung dan tidak melalui aplikasi. Jangan menjalankan update ini berdasarkan alamat email; selalu gunakan UUID yang sudah diverifikasi dari dashboard.

Dashboard admin untuk mengelola role melalui antarmuka belum dibangun pada sprint ini; langkah di atas adalah proses manual sampai dashboard tersedia.

## 8. Vercel environment

Tambahkan tiga environment variable berikut di **Vercel Project Settings → Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (isi dengan `https://kampungherbalberua.web.id` untuk Production)

Tambahkan variable ini pada scope **Development**, **Preview**, dan **Production** sesuai kebutuhan masing-masing (misalnya Preview dapat menunjuk ke project Supabase yang berbeda dari Production bila Anda ingin memisahkan data).

Deployment baru diperlukan setelah environment variable ditambahkan atau diubah — Vercel tidak menerapkan environment variable baru ke deployment yang sudah berjalan. Trigger redeploy dari dashboard Vercel setelah menyimpan environment variable.

## 9. Verifikasi RLS

Setelah migration diterapkan, verifikasi checklist berikut (misalnya melalui SQL Editor dengan `set role` atau melalui API dengan token user sungguhan):

- [ ] `anon` hanya dapat membaca tanaman dengan `content_status = 'published'`.
- [ ] `anon` tidak dapat melakukan `insert`, `update`, atau `delete` pada tabel `plants` maupun `profiles`.
- [ ] User dengan role `viewer` tidak dapat mengubah `role` miliknya sendiri (tidak ada policy update untuk non-admin).
- [ ] User dengan role `admin` dapat membuka dashboard dan mengelola draft, validasi, publish, archive, dan delete.
- [ ] User dengan role `viewer`, `editor`, atau `validator` tidak dapat membuka dashboard dan tidak dapat membaca draft admin.
- [ ] User dengan role `admin` dapat mengelola (`insert`/`update`/`delete`) seluruh tanaman dan membaca/memperbarui seluruh profile.
- [ ] User anonim tidak dapat membaca tabel `profiles` sama sekali.

## 10. Rollback dan backup

Sebelum menjalankan migration apa pun terhadap project production:

- Pastikan Anda benar-benar terhubung ke project yang dimaksud (`npx supabase projects list`, periksa `project-ref` yang ter-link).
- Buat backup melalui **Database → Backups** di dashboard Supabase, atau `pg_dump` manual bila Anda memerlukan salinan di luar Supabase.
- Tinjau seluruh isi file SQL yang akan diterapkan — jangan menjalankan migration atau seed yang belum Anda baca.
- Pahami dampaknya: migration di sprint ini bersifat aditif (membuat tipe/tabel/trigger/policy baru), tetapi migration di sprint mendatang bisa saja mengubah struktur yang sudah berisi data nyata.

`npx supabase db reset` **hanya untuk database lokal/development** dan akan menghapus seluruh data pada database yang sedang aktif. Jangan pernah menjalankan perintah ini terhadap project remote/production.
