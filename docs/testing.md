# Automated Testing

Dokumen ini menjelaskan strategi automated testing Kampung Herbal Berua. Tujuannya adalah mengganti pemeriksaan manual berulang dengan test yang bisa dijalankan lokal dan di GitHub Actions tanpa menyentuh database production.

## 1. Strategi Testing

Lapisan test dibagi menjadi tiga:

- Unit test dengan Vitest untuk validator, permission, normalisasi input, safe redirect, QR target, dan workflow status.
- Database test dengan pgTAP untuk schema, constraint, trigger, RLS, role, dan aturan permanen `zone_code`.
- E2E test dengan Playwright Chromium untuk route publik, autentikasi admin, CRUD tanaman, CRUD zona kesehatan, QR, dan responsive smoke.

Perintah utama:

```bash
npm run test
npm run test:unit
npm run test:db
npm run test:e2e
npm run test:ci
```

## 2. Unit Test

Unit test berada di `tests/unit/` dan berjalan dengan:

```bash
npm run test:unit
```

Cakupan unit test meliputi slug tanaman, `zone_code`, permission role, input array, image path, safe redirect, QR target, dan status workflow. Test ini tidak membutuhkan Supabase lokal.

## 3. pgTAP dan RLS

Database test berada di `supabase/tests/` dan berjalan dengan:

```bash
npm run test:db
```

Test ini menggunakan Supabase CLI lokal, pgTAP, dan role JWT lokal untuk membuktikan policy RLS. Cakupan utamanya:

- Struktur tabel `profiles`, `plants`, dan `health_zones`.
- Primary key, unique constraint `slug`, unique constraint `zone_code`, enum, trigger `updated_at`, dan RLS aktif.
- Akses anon, viewer, editor, validator, dan admin.
- Workflow draft, pending review, publish, archive, delete, dan verified.
- Aturan `zone_code` permanen setelah publish.

Jangan menjalankan database test terhadap project Supabase remote.

## 4. Playwright

E2E test berada di `tests/e2e/` dan berjalan dengan:

```bash
npm run test:e2e
```

Konfigurasi ada di `playwright.config.ts`. Test memakai Chromium saja, `workers = 1` di CI, screenshot saat gagal, trace pada retry pertama, video saat gagal, dan HTML report.

Report dapat dibuka dengan:

```bash
npm run test:e2e:report
```

`PLAYWRIGHT_BASE_URL` dapat digunakan untuk mengganti target lokal. `PLAYWRIGHT_SKIP_WEB_SERVER=1` digunakan untuk target yang sudah berjalan, seperti preview deployment.

## 5. Fixture Role

Fixture role lokal berada di `supabase/tests/fixtures/e2e-fixtures.sql`. Fixture ini hanya untuk database lokal dan CI, bukan untuk production seed.

User test:

- `viewer@test.invalid`
- `editor@test.invalid`
- `validator@test.invalid`
- `admin@test.invalid`

Domain `.invalid` dipakai agar tidak menyerupai email nyata. Password fixture hanya untuk automated local/CI environment.

## 6. Test Data Cleanup

Data E2E memakai prefix `E2E-` dan helper cleanup di `tests/e2e/helpers/supabase.ts`. Cleanup dijalankan sebelum dan sesudah test CRUD agar data tidak bocor antar-test.

Untuk zona test, gunakan rentang `khb-z90` sampai `khb-z99` agar tidak berbenturan dengan sembilan zona utama.

## 7. CI

Workflow utama berada di `.github/workflows/ci.yml` dan berjalan pada:

- Pull Request menuju `main`.
- Push ke `main`.
- `workflow_dispatch`.

Job:

- `quality`: `npm ci`, lint, build, `npm audit --omit=dev`, dan unit test.
- `database-test`: Supabase lokal, reset lokal, dan pgTAP.
- `e2e`: Supabase lokal, fixture role, Playwright Chromium, dan upload report.

Workflow memakai concurrency untuk membatalkan run lama pada branch yang sama.

## 8. Vercel Preview Smoke

Workflow `.github/workflows/preview-smoke.yml` berjalan pada `deployment_status` sukses. Test ini memakai URL deployment sebagai `PLAYWRIGHT_BASE_URL` dan hanya menjalankan smoke publik non-destruktif:

- `/`
- `/tanaman`
- `/zona-kesehatan`
- `/zona-kesehatan/digestia`
- `/z/khb-z01`
- `/peta`
- `/sitemap.xml`
- `/robots.txt`

CRUD dan role test tidak dijalankan terhadap Vercel Preview karena preview dapat terhubung ke database remote.

## 9. Troubleshooting

Jika `npm run test:db` gagal, pastikan Docker berjalan dan Supabase lokal sudah aktif:

```bash
npx supabase start
npx supabase db reset
npm run test:db
```

Jika E2E gagal login, pastikan fixture role sudah dimuat ke database lokal:

```bash
psql "$SUPABASE_DB_URL" -f supabase/tests/fixtures/e2e-fixtures.sql
```

Jika Playwright gagal menemukan browser:

```bash
npx playwright install chromium
```

Di CI, buka artifact `playwright-report` untuk membaca langkah dan failure trace.

## 10. Larangan Memakai Production Database

Automated test tidak boleh memakai database production, project Supabase remote, service-role key production, password database remote, atau token akses pribadi. Jangan menjalankan:

- `supabase db reset --linked`
- `supabase db push`
- seed test ke database remote
- test destructive CRUD terhadap preview yang terhubung ke database remote

Workflow CI hanya boleh memakai Supabase local development.

## 11. Kriteria Merge

Sebelum merge ke `main`, check berikut disarankan wajib hijau:

- `quality`
- `database-test`
- `e2e`
- `preview-smoke` bila workflow preview dipakai

Bug fix harus membawa regression test. Perubahan RLS harus membawa pgTAP. Perubahan public/admin flow harus membawa Playwright test.

## 12. QR Physical Acceptance Scan

Automated test memastikan target QR permanen memakai `zone_code` dan slug boleh berubah tanpa cetak ulang QR. Namun QR fisik tetap memerlukan satu acceptance scan manual sebelum cetak massal untuk memastikan kualitas cetak, ukuran, kontras, dan jarak pindai sesuai kondisi lapangan.
