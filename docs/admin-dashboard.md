# Panduan Dashboard Admin

Dashboard admin tersedia di `/admin` dan dilindungi Supabase Auth email/password. Registrasi publik, OAuth, magic link, reset password melalui dashboard, dan pengelolaan pengguna melalui UI belum tersedia.

## Membuat Staf

1. Buat user melalui Supabase Auth.
2. Trigger `public.handle_new_user()` membuat profile awal dengan role `viewer`.
3. Tetapkan role staf secara manual di tabel `public.profiles`.
4. Pastikan `is_active = true`.

Role yang didukung:

- `viewer`: role default dan tidak dapat membuka dashboard.
- `admin`: satu-satunya role akun yang dapat membuka dashboard, membuat, mengubah, publish, archive, verified, rejected, dan delete.
- Nilai enum PostgreSQL `editor` dan `validator` tetap ada untuk kompatibilitas, tetapi tidak dipakai UI, permission, RLS, atau test sebagai role dashboard aktif.

## Login dan Logout

- Halaman login: `/admin/login`.
- Login gagal selalu menampilkan pesan umum.
- Setelah logout pengguna diarahkan ke `/admin/login`.
- Route `/admin` dan turunannya memanggil pemeriksaan session/profile di server.

## Tanaman

Route:

- `/admin/tanaman`
- `/admin/tanaman/baru`
- `/admin/tanaman/[id]/edit`

Admin dapat menyimpan `draft` atau `pending_review`, menetapkan validasi, publish, archive, rejected, dan delete. Delete bersifat permanen dan hanya tersedia untuk admin.

Konten hanya dapat `published` bila `validation_status = verified`, nama pemeriksa terisi, sumber terisi, dan tanggal pemeriksaan tersedia. Validator disimpan sebagai metadata pemeriksa konten, bukan role akun.

## Zona Kesehatan

Route:

- `/admin/zona`
- `/admin/zona/baru`
- `/admin/zona/[id]/edit`

`zone_code` memakai format `khb-zNN` dan menjadi permanen setelah zona pernah dipublikasikan. QR menggunakan `zone_code`, bukan slug.

## Keterbatasan

- Tidak ada pengelolaan user melalui dashboard.
- Tidak ada upload gambar atau Supabase Storage.
- Dashboard memakai model admin-only.
- Migration remote harus diterapkan manual oleh pengelola project.
