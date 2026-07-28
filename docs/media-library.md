# Media Library Global

Media Library menyimpan metadata, status hak, status privasi, atribusi, checksum, dan attachment gambar untuk seluruh website.

## Bucket

- `media-originals`: private, berisi original yang sudah dibersihkan EXIF/GPS.
- `media-public`: public, hanya WebP teroptimasi untuk website.

Object path memakai stable key:

```text
plants/{plant_code}/cover-{hash}.webp
health-zones/{zone_code}/documentation-{hash}.webp
recipes/{content_key}/...
products/{content_key}/...
activities/{content_key}/...
programs/{content_key}/...
team/{content_key}/...
site/{slot_key}/...
maps/{content_key}/...
```

Script tidak boleh overwrite object lama dan tidak melakukan delete bulk.

## Schema

Tabel utama:

- `media_assets`
- `plant_media`
- `health_zone_media`
- `content_media_slots`

Media published wajib memiliki `public_path`, `rights_status = approved`, dan `privacy_status` `approved` atau `not_required`.

## Website

Urutan fallback:

1. Media Library public path.
2. Field gambar lama atau asset lokal.
3. Placeholder.

Produk, kegiatan, tim, dan peta tidak boleh memakai gambar internet sebagai dokumentasi nyata.
