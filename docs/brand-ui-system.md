# Brand UI System Kampung Herbal Harmony Berua

Dokumen ini merangkum fondasi visual website Kampung Herbal Harmony Berua setelah penyelarasan UI.

## Design Token

- Hijau tua: `#0C3E22`, warna identitas utama untuk header, footer, hero overlay, tombol primer gelap, dan section penekanan.
- Hijau muda: `#89BB5E`, aksen alami untuk chip, pattern halus, dan state pendukung.
- Cream: `#F5F1DD`, latar hangat utama halaman publik.
- Kuning: `#E5BA21`, aksen CTA/highlight yang dipakai terbatas.
- Coklat: `#7C592D`, aksen tanah untuk label, metadata, dan jalan tematik.
- Radius kartu utama: `var(--radius-card)` atau 8px.
- Shadow utama: `var(--shadow-soft)`; hover terangkat memakai `var(--shadow-lift)`.

## Tipografi

Website memakai Poppins lokal melalui `next/font/local`.

File yang digunakan:

- `src/assets/fonts/poppins/Poppins-Light.ttf`
- `src/assets/fonts/poppins/Poppins-Regular.ttf`
- `src/assets/fonts/poppins/Poppins-Medium.ttf`
- `src/assets/fonts/poppins/Poppins-Bold.ttf`

Aturan hierarki:

- Heading utama: Poppins Bold.
- Heading sekunder dan navigasi: Poppins Medium/Bold sesuai kepadatan.
- Body: Poppins Regular.
- Poppins Light hanya untuk teks besar dan kontras cukup.

## Logo

Aset produksi berada di `public/brand/logo/`. Varian Kampung Herbal diekspor ulang dari sumber brand 4501px dengan crop transparan agar tampil lebih tajam tanpa mengubah proporsi.

- Header dan footer memakai logo wide resmi.
- Hero memakai logo resmi putih pada overlay hijau tua.
- Logo putih dipakai pada latar hijau tua atau foto gelap.
- Logo utama dipakai pada latar cream/putih.
- Favicon lama dari `public/icons/leaf.svg` dipertahankan.
- Logo kolaborator berada di `public/images/partners/`: Kelompok KKN, KKN Universitas Hasanuddin, Universitas Hasanuddin, dan Pemerintah Kota Makassar.

Logo tidak boleh diregangkan, dipotong, diberi efek berlebihan, atau ditempatkan terlalu rapat dengan elemen lain.

## Komponen Utama

- `Logo`: memilih varian logo resmi berdasarkan tone.
- `PageHero`: pembuka halaman publik dengan pattern halus dan hierarki heading konsisten.
- `SectionHeading`: judul section dengan tone terang/gelap.
- `BrandCard`: panel konten umum.
- `PublicCard`: kartu publik untuk tanaman, zona, dan katalog.
- `StreetCard`: kartu jalan tematik dengan aksen coklat/kuning dan foto papan.
- `StatusBadge`: chip status/metadata.
- `SearchInput`: input pencarian katalog.
- `FilterChip`: chip filter aktif.
- `ImageFrame`: frame gambar detail.
- `Reveal`: wrapper animasi ringan berbasis IntersectionObserver bila diperlukan.

## Motion

Animasi dijaga ringan:

- hover lift beberapa pixel pada kartu;
- transisi shadow dan border;
- zoom gambar sangat halus pada hover;
- animasi carousel ringan;
- dekorasi hero bergerak perlahan.

Semua animasi penting dimatikan melalui `prefers-reduced-motion: reduce`.

## Responsive Behavior

- Header memakai navigasi desktop dan menu mobile accessible.
- Kartu publik memakai grid responsif dan carousel horizontal untuk ringkasan beranda.
- Detail tanaman menempatkan gambar di sisi kanan pada desktop dan setelah identitas pada mobile.
- Touch target tombol dan link utama minimal sekitar 44px.
- Layout diuji pada lebar mobile 390px dan tidak boleh horizontal overflow.

## Aksesibilitas

- Semua gambar memiliki alt text.
- Header, nav, breadcrumb, main, section, dan footer memakai semantic HTML.
- Fokus keyboard memakai outline kontras.
- Teks penting di atas foto selalu memakai overlay hijau tua.
- Kode internal seperti `khb-zNN` tidak digunakan sebagai teks publik.

## Lokasi Aset Resmi

- Logo website: `public/brand/logo/`
- Font Poppins lokal: `src/assets/fonts/poppins/`
- Favicon yang dipertahankan: `public/icons/leaf.svg`
- Logo Kelompok KKN: `public/images/partners/logo-kelompok-kkn.webp`
- Logo KKN Universitas Hasanuddin: `public/images/partners/logo-kkn-unhas.webp`
- Logo Universitas Hasanuddin: `public/images/partners/logo-unhas.webp`
- Logo Pemerintah Kota Makassar: `public/images/partners/logo-pemkot-makassar.webp`
- Arsip guideline mentah lokal diabaikan Git melalui `design/`.
