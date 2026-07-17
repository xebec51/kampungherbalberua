# Panduan Dashboard Admin

Dashboard admin tersedia di `/admin` dan dilindungi Supabase Auth email/password. Registrasi publik, OAuth, magic link, reset password melalui dashboard, dan pengelolaan pengguna melalui UI belum tersedia.

## Membuat Staf

1. Buat user melalui Supabase Auth.
2. Trigger `public.handle_new_user()` membuat profile awal dengan role `viewer`.
3. Tetapkan role staf secara manual di tabel `public.profiles`.
4. Pastikan `is_active = true`.

Role yang didukung:

- `viewer`: tidak dapat membuka dashboard.
- `editor`: dapat membuat dan mengubah draft atau pending review.
- `validator`: read-only pada sprint ini.
- `admin`: dapat publish, archive, verified, rejected, dan delete.

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

Editor dapat menyimpan `draft` atau `pending_review`. Admin dapat publish, archive, verified, rejected, dan delete. Delete bersifat permanen dan hanya tersedia untuk admin.

## Zona Kesehatan

Route:

- `/admin/zona`
- `/admin/zona/baru`
- `/admin/zona/[id]/edit`

`zone_code` memakai format `khb-zNN` dan menjadi permanen setelah zona pernah dipublikasikan. QR menggunakan `zone_code`, bukan slug.

## Keterbatasan

- Tidak ada pengelolaan user melalui dashboard.
- Tidak ada upload gambar atau Supabase Storage.
- Validator masih read-only.
- Migration remote harus diterapkan manual oleh pengelola project.
