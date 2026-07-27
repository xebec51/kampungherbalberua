# Pedoman Agen Proyek Kampung Herbal Berua

Pedoman ini berlaku untuk seluruh perubahan pada repository Kampung Herbal Berua.

## Prinsip Umum

- Seluruh teks antarmuka menggunakan Bahasa Indonesia.
- Gunakan TypeScript strict.
- Hindari penggunaan `any`.
- Gunakan Server Components secara default.
- Gunakan Client Components hanya untuk interaksi yang membutuhkan state, event browser, atau API browser.
- Buat komponen kecil, reusable, dan memiliki tanggung jawab jelas.
- Pisahkan data dari komponen.
- Gunakan data lokal TypeScript untuk tahap pertama.

## Aksesibilitas dan UI

- Gunakan semantic HTML.
- Pastikan navigasi dapat digunakan dengan keyboard.
- Navbar utama publik sebaiknya maksimal sekitar 5-6 elemen top-level; halaman sekunder dikelompokkan secara semantik.
- Dropdown navigasi wajib accessible: tidak hanya hover, memakai aria yang tepat, dapat ditutup dengan Escape, dan tetap dapat digunakan keyboard.
- Seluruh route publik harus tetap tersedia pada mobile meskipun desktop memakai dropdown.
- CTA navigasi tidak boleh menggantikan akses link yang jelas dan tetap wajib memiliki kontras yang cukup.
- Gunakan elemen heading secara berurutan.
- Semua form harus memiliki label yang jelas.
- Semua gambar harus memiliki alt text.
- Tampilkan focus state yang jelas untuk navigasi keyboard.

## Privasi Data

- Jangan menambahkan API key, token, kredensial, atau data sensitif.
- Jangan memasukkan file `.env.local` ke Git.
- Jangan memasukkan data kesehatan perorangan.
- Jangan menampilkan data warga berdasarkan nama atau alamat rumah.
- Jangan menampilkan nomor telepon warga.
- Jangan menampilkan nomor telepon mahasiswa KKN secara publik.
- Data kesehatan hanya boleh ditampilkan dalam bentuk agregat.
- Jangan menyimpan isi kotak saran menggunakan `localStorage`.

## Informasi Kesehatan

- Jangan membuat klaim bahwa tanaman atau ramuan pasti menyembuhkan penyakit.
- Gunakan istilah "pemanfaatan tradisional".
- Gunakan frasa "secara tradisional digunakan untuk membantu" bila diperlukan.
- Informasi kesehatan pada website adalah informasi umum.
- Informasi website bukan pengganti konsultasi dengan tenaga kesehatan.
- Jangan menyarankan pengguna mengganti obat dokter dengan ramuan.
- Jangan menulis bahwa ramuan aman untuk semua orang.
- Sertakan peringatan agar ibu hamil, anak-anak, lansia, penderita penyakit tertentu, dan pengguna obat rutin berkonsultasi dengan tenaga kesehatan.

## Database dan Supabase

- Seluruh schema database harus dibuat melalui migration SQL di `supabase/migrations/`, bukan melalui perubahan manual pada database.
- Row Level Security (RLS) wajib diaktifkan untuk setiap tabel di skema `public`.
- Jangan menggunakan service-role key pada aplikasi publik atau kode yang berjalan di browser.
- Seluruh query database harus berada dalam data-access layer (`src/lib/data/`), bukan langsung di komponen atau route.
- Komponen UI tidak boleh bergantung langsung pada row database (snake_case); gunakan mapper ke tipe aplikasi.
- Migration tidak boleh dijalankan ke project Supabase remote tanpa instruksi eksplisit dari pengguna.
- Data lokal TypeScript tetap menjadi fallback selama fase migrasi ke Supabase berlangsung.
- File `database.types.ts` harus digenerasi ulang setelah schema project remote berubah atau baru terhubung.
- Jangan membuat policy RLS terbuka (`using (true)`) untuk operasi insert, update, atau delete.
- Jangan menampilkan detail error database (pesan mentah Supabase/Postgres) kepada pengunjung publik.

## Autentikasi, Role, dan Otorisasi Admin

- Server Action wajib memeriksa session, profile, status aktif, dan role sebelum mutation.
- UI bukan lapisan otorisasi; penyembunyian tombol tidak boleh menjadi satu-satunya proteksi.
- Role, user id, `created_by`, `updated_by`, `validator_id`, dan `published_at` tidak boleh diterima dari browser.
- Role harus dibaca dari `public.profiles` di server dan tetap dibatasi oleh RLS.
- Registrasi publik, OAuth, magic link, dan pengelolaan pengguna melalui dashboard tidak tersedia.
- `viewer` tidak boleh membuka `/admin`.
- `editor` dapat membuat dan mengubah draft atau pending review, tetapi tidak dapat publish, verified, rejected, atau delete.
- `validator` bersifat read-only pada sprint ini.
- `admin` mengelola publikasi, arsip, validasi, dan delete.
- Error login harus umum dan tidak boleh mengungkapkan apakah email terdaftar.

## Zona Kesehatan dan QR Permanen

- `zone_code` adalah identitas permanen QR dan tidak boleh berubah setelah zona pernah dipublikasikan.
- QR zona selalu memakai route berbasis `zone_code`, misalnya `/z/khb-z01`.
- QR tidak boleh memakai slug sebagai identitas permanen karena slug boleh berubah.
- Target QR harus dibangun server-side dari data zona dan `NEXT_PUBLIC_SITE_URL`, bukan dari input bebas pengguna.
- QR dibuat saat diminta dan tidak disimpan ke Supabase Storage.
- Route QR tidak boleh melakukan tracking scan, menyimpan cookie, meminta lokasi, atau mengambil data pribadi.
- Mutation tanaman dan zona wajib melakukan revalidation untuk halaman publik, admin, dan sitemap yang terkait.

## Materi Kesehatan dan Privasi Foto

- Materi kesehatan tidak boleh membuat klaim diagnosis, penyembuhan, pencegahan penyakit, dosis pengobatan, atau pengganti obat dokter.
- Gunakan bahasa konservatif seperti "materi edukasi umum", "kebiasaan hidup sehat", "pemanfaatan tradisional", dan "bukan pengganti konsultasi".
- Informasi untuk anak, ibu hamil, ibu menyusui, lansia, penderita penyakit tertentu, dan pengguna obat rutin harus diarahkan untuk berkonsultasi dengan tenaga kesehatan.
- Foto papan atau zona hanya digunakan sebagai dokumentasi visual.
- Foto tidak boleh digunakan untuk mengidentifikasi orang, mengambil nomor telepon, alamat rumah, metadata EXIF, GPS, atau data pribadi lain.

## Automated Testing

- Fitur tidak dianggap selesai bila automated test terkait masih gagal.
- Bug harus disertai regression test yang membuktikan perilaku yang diperbaiki.
- Rule RLS wajib diuji dengan pgTAP di `supabase/tests/`.
- Flow publik dan admin wajib diuji dengan Playwright bila menyentuh route, form, autentikasi, atau CRUD.
- CI tidak boleh memakai database production, project Supabase remote, atau service-role key production.
- Fixture test harus terpisah dari `supabase/seed.sql` production.
- Hasil test harus deterministic dan tidak bergantung pada urutan eksekusi acak.
- Data test harus memakai prefix jelas seperti `E2E-` dan dibersihkan setelah test.
- Manual testing bukan gate utama untuk merge; automated test adalah gate utama.
- QR fisik tetap memerlukan satu acceptance scan manual sebelum cetak massal.

## Git dan Kualitas

- Jalankan `npm run lint` dan `npm run build` setelah perubahan utama.
- Jalankan automated test yang relevan (`npm run test:unit`, `npm run test:db`, `npm run test:e2e`, atau `npm run test:ci`) setelah perubahan utama.
- Setiap tahap perubahan harus dibuatkan commit lokal.
- Gunakan Conventional Commits.
- Jangan melakukan push tanpa instruksi eksplisit.
- Jangan melakukan force push.
- Jangan mengubah remote repository.
- Jangan menggunakan `git reset --hard`, `git clean -fd`, atau `git checkout -- .`.
- Sebelum commit, periksa `git diff`, file yang berubah, dan pastikan tidak ada rahasia.
