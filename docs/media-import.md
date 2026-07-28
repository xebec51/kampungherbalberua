# Media Import

Import media dijalankan lokal memakai `.env.media-import.local`.

Environment wajib:

```env
SUPABASE_URL=
SUPABASE_SECRET_KEY=
SUPABASE_PROJECT_REF=
MEDIA_IMPORT_TARGET=remote
WIKIMEDIA_USER_AGENT=
```

Secret tidak boleh dicetak, dikomit, dipasang ke `NEXT_PUBLIC_*`, atau dipakai di aplikasi Next.js.

## Command

```bash
npm run media:bootstrap
npm run media:poster:validate
npm run media:poster:import -- --dry-run
npm run media:poster:import -- --execute
npm run media:migrate:zones -- --dry-run
npm run media:migrate:zones -- --execute
npm run media:research:plants -- --dry-run
npm run media:research:plants -- --execute
npm run media:import -- --dry-run
npm run media:import -- --execute
npm run media:report
```

Semua command import default dry-run kecuali `media:bootstrap` yang membuat atau memverifikasi bucket. Execute hanya berjalan dengan guard project ref dan target remote yang tepat.

## Output

Manifest dan laporan aman dikomit:

- `data/media/manifests/plant-images.json`
- `data/media/manifests/zone-images.json`
- `data/media/reports/unresolved-plants.json`
- `data/media/reports/rejected-images.json`
- `data/media/reports/import-summary.json`

Cache, download, dan output gambar tidak dikomit.
