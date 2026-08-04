-- Kampung Herbal Berua: produk warga (resident products) catalog.
-- Unlike plants/health_zones, products have no draft/pending-review/publish
-- workflow -- every row is immediately public. products_select_public is a
-- deliberate, documented exception to the "SELECT gated on content_status"
-- rule used elsewhere in this schema (see CLAUDE.md); there is no
-- content_status column on this table at all.

create type public.product_availability as enum (
  'tersedia',
  'terbatas',
  'habis',
  'segera-tersedia'
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  description text not null,
  benefits text[] not null default '{}',
  price integer,
  unit text,
  image_path text,
  producer_name text not null,
  whatsapp_number text,
  availability public.product_availability not null default 'tersedia',
  featured boolean not null default false,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint products_name_not_blank check (btrim(name) <> ''),
  constraint products_category_not_blank check (btrim(category) <> ''),
  constraint products_description_not_blank check (btrim(description) <> ''),
  constraint products_producer_name_not_blank check (btrim(producer_name) <> ''),
  constraint products_price_non_negative check (price is null or price >= 0)
);

comment on table public.products is
  'Katalog produk warga. Tidak ada alur draft/review/publish -- setiap baris langsung tampil publik begitu disimpan admin.';

create trigger set_products_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

create index products_category_idx on public.products (category);
create index products_availability_idx on public.products (availability);
create index products_featured_idx on public.products (featured);

alter table public.products enable row level security;

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.products to service_role;

create policy "products_select_public"
  on public.products
  for select
  to anon, authenticated
  using (true);

create policy "products_insert_admin"
  on public.products
  for insert
  to authenticated
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "products_update_admin"
  on public.products
  for update
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "products_delete_admin"
  on public.products
  for delete
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

-- Seed the current static catalog (src/data/products.ts) so the live site
-- loses nothing the moment the public fetcher switches to reading this
-- table instead of the static array.
insert into public.products
  (slug, name, category, description, benefits, price, unit, image_path, producer_name, whatsapp_number, availability, featured)
values
  (
    'empon-empon', 'Empon-Empon', 'Minuman herbal',
    'Racikan bubuk empon-empon dari temulawak, jahe merah, dan kunyit, diseduh sebagai teh hangat sehari-hari untuk menjaga daya tahan tubuh dan pencernaan.',
    array[
      'Membantu melancarkan peredaran darah.',
      'Membantu mencegah infeksi ringan.',
      'Membantu mengurangi peradangan.',
      'Membantu meningkatkan kekebalan tubuh.',
      'Mendukung kesehatan pencernaan dan reproduksi.',
      'Menjadi sumber antioksidan.'
    ],
    null, null, '/images/products/empon-empon.jpg', 'Ramuanku', null, 'tersedia', true
  ),
  (
    'beras-kencur', 'Beras Kencur', 'Minuman herbal',
    'Bubuk beras kencur dengan campuran jahe dan kunyit, diseduh hangat untuk menjaga daya tahan tubuh dan meredakan batuk berdahak.',
    array[
      'Membantu meningkatkan daya tahan tubuh.',
      'Mendukung kesehatan sistem kardiovaskuler.',
      'Menjadi sumber antioksidan.',
      'Membantu meringankan batuk berdahak.',
      'Membantu meningkatkan nafsu makan anak.',
      'Membantu meringankan gangguan pencernaan.',
      'Membantu meringankan stres.'
    ],
    null, null, '/images/products/beras-kencur.jpg', 'Ramuanku', null, 'tersedia', false
  ),
  (
    'bunga-telang-rempah', 'Bunga Telang Rempah', 'Minuman herbal',
    'Teh bubuk dari kelopak bunga telang dan rempah pilihan, menghasilkan seduhan ungu yang kaya antioksidan dan menenangkan.',
    array[
      'Menjadi sumber antioksidan.',
      'Mendukung kesehatan otak.',
      'Membantu menenangkan dan meredakan stres.',
      'Membantu mencegah gangguan pencernaan.',
      'Membantu meringankan kadar kolesterol.',
      'Membantu mencegah penuaan dini.',
      'Mendukung kesehatan kulit.',
      'Membantu mengatasi sembelit.'
    ],
    null, null, '/images/products/bunga-telang-rempah.jpg', 'Ramuanku', null, 'tersedia', true
  ),
  (
    'kelor-rempah', 'Kelor Rempah', 'Minuman herbal',
    'Bubuk daun kelor dicampur rempah hangat, diseduh sebagai teh harian untuk menjaga stamina dan kadar kolesterol.',
    array[
      'Menjadi sumber antioksidan.',
      'Membantu meningkatkan stamina.',
      'Membantu mencegah peningkatan kolesterol.',
      'Membantu mencegah anemia.',
      'Mendukung produksi ASI.'
    ],
    null, null, '/images/products/kelor-rempah.jpg', 'Ramuanku', null, 'tersedia', true
  ),
  (
    'secang-rempah', 'Secang Rempah', 'Minuman herbal',
    'Teh bubuk kayu secang berpadu jahe dan rempah lain, diseduh hangat untuk melancarkan peredaran darah dan meredakan pegal linu.',
    array[
      'Membantu meningkatkan vitalitas.',
      'Membantu melancarkan peredaran darah.',
      'Membantu meredakan gangguan pencernaan.',
      'Membantu meredakan gejala asam urat.',
      'Membantu meredakan pegal linu.',
      'Mendukung kesehatan tulang.',
      'Menjadi sumber antioksidan.'
    ],
    null, null, '/images/products/secang-rempah.jpg', 'Ramuanku', null, 'tersedia', false
  ),
  (
    'jahe-rempah', 'Jahe Rempah', 'Minuman herbal',
    'Teh bubuk jahe merah dengan kayu manis dan rempah hangat lain, diseduh untuk meredakan masuk angin dan menjaga daya tahan tubuh.',
    array[
      'Membantu melancarkan peredaran darah.',
      'Membantu meredakan masuk angin dan gejala flu atau batuk.',
      'Membantu meningkatkan vitalitas.',
      'Membantu meningkatkan kekebalan tubuh.',
      'Membantu meredakan nyeri haid.',
      'Membantu meredakan nyeri kepala.',
      'Mendukung kesehatan pencernaan.'
    ],
    null, null, '/images/products/jahe-rempah.jpg', 'Ramuanku', null, 'tersedia', true
  ),
  (
    'ecoenzym-soap', 'EcoEnzym Soap', 'Perawatan rumah tangga',
    'Sabun cair dari fermentasi limbah dapur (eco-enzyme), diproses warga menjadi pembersih alami yang ramah lingkungan.',
    array[]::text[],
    null, null, '/images/products/ecoenzym-soap.jpg', 'Kampung Herbal Harmony Berua', null, 'tersedia', false
  ),
  (
    'jahe-bubuk', 'Jahe Bubuk', 'Bahan herbal',
    'Bubuk jahe murni tanpa bahan tambahan, siap diseduh sebagai minuman hangat atau dicampur ke masakan sehari-hari.',
    array[]::text[],
    null, null, '/images/products/jahe-bubuk.jpg', 'Ramuanku', null, 'tersedia', false
  );
