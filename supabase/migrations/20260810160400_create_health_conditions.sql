-- Kampung Herbal Berua: Katalog Penyakit (disease/health-condition catalog).
--
-- Transcribes the physical "Etalase Tanaman Obat -- 10 Penyakit Utama"
-- signboard: 10 disease/condition entries, each with 2-3 benefit bullets and
-- a list of recommended plants. This is a distinct classification from the
-- existing health_zones (physical street zones) and the 20-category poster
-- catalog -- not a replacement for either.
--
-- No draft/publish workflow, matching `products` (20260805000000): every
-- admin-authored row is instantly live. RLS/grants below are copied from
-- that migration's shape.

create table public.health_conditions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text not null,
  description text not null,
  benefits text[] not null default '{}',
  sort_order integer not null,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint health_conditions_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint health_conditions_name_not_blank check (btrim(name) <> ''),
  constraint health_conditions_short_description_not_blank check (btrim(short_description) <> ''),
  constraint health_conditions_description_not_blank check (btrim(description) <> ''),
  constraint health_conditions_sort_order_positive check (sort_order > 0)
);

comment on table public.health_conditions is
  'Disease/health-condition catalog (Katalog Penyakit). No workflow -- every row is public the moment it is saved, same documented exception as products.';

-- Plants linked to a condition. plant_id is nullable: two signboard entries
-- ("Madu Herbal", "Yodium") are not plants and never will resolve to one --
-- display_name is what renders regardless of whether the link resolves.
create table public.health_condition_plants (
  id uuid primary key default gen_random_uuid(),
  health_condition_id uuid not null references public.health_conditions (id) on delete cascade,
  plant_id uuid references public.plants (id) on delete set null,
  display_name text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  constraint health_condition_plants_display_name_not_blank check (btrim(display_name) <> ''),
  constraint health_condition_plants_unique unique (health_condition_id, display_name)
);

comment on table public.health_condition_plants is
  'Join table: which plants are recommended for a health condition. plant_id is null for signboard entries that are not plants (e.g. Madu Herbal, Yodium) -- display_name still renders as an unlinked label.';

create trigger set_health_conditions_updated_at
  before update on public.health_conditions
  for each row
  execute function public.set_updated_at();

create index health_condition_plants_health_condition_id_idx
  on public.health_condition_plants (health_condition_id);
create index health_condition_plants_plant_id_idx
  on public.health_condition_plants (plant_id);

-- ---------------------------------------------------------------------------
-- Row Level Security -- no workflow, mirrors products' shape exactly.
-- ---------------------------------------------------------------------------

alter table public.health_conditions enable row level security;
alter table public.health_condition_plants enable row level security;

grant select on public.health_conditions to anon, authenticated;
grant insert, update, delete on public.health_conditions to authenticated;
grant select, insert, update, delete on public.health_conditions to service_role;

grant select on public.health_condition_plants to anon, authenticated;
grant insert, update, delete on public.health_condition_plants to authenticated;
grant select, insert, update, delete on public.health_condition_plants to service_role;

create policy "health_conditions_select_public"
  on public.health_conditions
  for select
  to anon, authenticated
  using (true);

create policy "health_conditions_insert_admin"
  on public.health_conditions
  for insert
  to authenticated
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "health_conditions_update_admin"
  on public.health_conditions
  for update
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "health_conditions_delete_admin"
  on public.health_conditions
  for delete
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "health_condition_plants_select_public"
  on public.health_condition_plants
  for select
  to anon, authenticated
  using (true);

create policy "health_condition_plants_insert_admin"
  on public.health_condition_plants
  for insert
  to authenticated
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "health_condition_plants_update_admin"
  on public.health_condition_plants
  for update
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "health_condition_plants_delete_admin"
  on public.health_condition_plants
  for delete
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

-- ---------------------------------------------------------------------------
-- Seed: the 10 signboard conditions.
-- ---------------------------------------------------------------------------

insert into public.health_conditions (slug, name, short_description, description, benefits, sort_order) values
(
  'hiperkolesterolemia', 'Hiperkolesterolemia',
  'Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu menjaga kadar kolesterol tetap seimbang.',
  'Hiperkolesterolemia adalah kondisi kadar kolesterol dalam darah yang tinggi. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional untuk mendukung kesehatan jantung dan pembuluh darah.',
  array['Membantu menjaga kadar kolesterol normal', 'Kaya antioksidan', 'Mendukung kesehatan jantung'], 1
),
(
  'diabetes-melitus', 'Diabetes Melitus',
  'Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu menjaga kadar gula darah.',
  'Diabetes Melitus adalah kondisi kadar gula darah yang tinggi. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional untuk mendukung sensitivitas insulin tubuh.',
  array['Membantu menjaga gula darah', 'Mendukung sensitivitas insulin'], 2
),
(
  'gastritis-maag', 'Gastritis (Maag)',
  'Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu kenyamanan lambung.',
  'Gastritis atau maag adalah peradangan pada lapisan lambung. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional untuk mendukung kesehatan saluran cerna.',
  array['Membantu kenyamanan lambung', 'Mendukung kesehatan saluran cerna'], 3
),
(
  'demam', 'Demam',
  'Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu menjaga daya tahan tubuh saat demam.',
  'Demam adalah kenaikan suhu tubuh yang umumnya menyertai infeksi. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional untuk mendukung pemulihan tubuh.',
  array['Membantu menjaga daya tahan tubuh', 'Mendukung pemulihan saat demam'], 4
),
(
  'diare', 'Diare',
  'Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu mengurangi frekuensi buang air besar.',
  'Diare adalah kondisi buang air besar dengan frekuensi tinggi dan konsistensi cair. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional untuk mendukung kesehatan usus.',
  array['Membantu mengurangi frekuensi BAB', 'Mendukung kesehatan usus'], 5
),
(
  'hiperurisemia-asam-urat', 'Hiperurisemia (Asam Urat)',
  'Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu menjaga kadar asam urat.',
  'Hiperurisemia atau asam urat adalah kondisi kadar asam urat dalam darah yang tinggi. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional untuk mendukung fungsi ginjal.',
  array['Membantu menjaga kadar asam urat', 'Mendukung fungsi ginjal'], 6
),
(
  'alergi', 'Alergi',
  'Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu menjaga respons imun tubuh.',
  'Alergi adalah reaksi berlebihan sistem imun terhadap suatu zat. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional karena kandungan antioksidannya.',
  array['Membantu menjaga respons imun tubuh', 'Kaya antioksidan'], 7
),
(
  'hipertensi', 'Hipertensi',
  'Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu menjaga tekanan darah tetap normal.',
  'Hipertensi adalah kondisi tekanan darah yang tinggi secara terus-menerus. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional untuk mendukung kesehatan pembuluh darah.',
  array['Membantu menjaga tekanan darah normal', 'Mendukung kesehatan pembuluh darah'], 8
),
(
  'common-cold-pilek-batuk', 'Common Cold (Pilek dan Batuk)',
  'Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu melegakan pernapasan saat pilek dan batuk.',
  'Common cold adalah infeksi saluran pernapasan ringan yang umum terjadi. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional untuk mendukung kenyamanan bernapas.',
  array['Membantu melegakan pernapasan', 'Membantu mengurangi batuk'], 9
),
(
  'obat-luka', 'Obat Luka',
  'Kumpulan tanaman yang secara tradisional dimanfaatkan untuk mendukung perawatan luka ringan.',
  'Perawatan luka secara tradisional memanfaatkan berbagai tanaman untuk mendukung proses pemulihan kulit. Tanaman pada kategori ini dikenal dalam kebiasaan perawatan luar rumahan.',
  array['Mendukung penyembuhan luka', 'Membantu regenerasi jaringan'], 10
);

-- ---------------------------------------------------------------------------
-- Seed: plant links per condition, resolved by slug (reviewable, not
-- hardcoded UUIDs). plant_slug = null for the two non-plant signboard items
-- (Madu Herbal, Yodium) -- the left join naturally leaves plant_id null.
-- All plant slugs verified directly against production before writing this.
-- ---------------------------------------------------------------------------

insert into public.health_condition_plants (health_condition_id, plant_id, display_name, sort_order)
select hc.id, p.id, v.display_name, v.sort_order
from (values
  ('hiperkolesterolemia', 'bawang-putih', 'Bawang Putih', 1),
  ('hiperkolesterolemia', 'daun-salam', 'Daun Salam', 2),
  ('hiperkolesterolemia', 'kelor', 'Kelor', 3),
  ('hiperkolesterolemia', 'rosella', 'Rosella', 4),
  ('hiperkolesterolemia', 'pegagan', 'Pegagan', 5),
  ('hiperkolesterolemia', 'jati-belanda', 'Jati Belanda', 6),
  ('hiperkolesterolemia', 'teh-hijau', 'Teh Hijau', 7),
  ('hiperkolesterolemia', 'alpukat', 'Alpukat', 8),

  ('diabetes-melitus', 'pare', 'Pare', 1),
  ('diabetes-melitus', 'brotowali', 'Brotowali', 2),
  ('diabetes-melitus', 'daun-salam', 'Salam', 3),
  ('diabetes-melitus', 'sambiloto', 'Sambiloto', 4),
  ('diabetes-melitus', 'kayu-manis', 'Kayu Manis', 5),
  ('diabetes-melitus', 'mahkota-dewa', 'Mahkota Dewa', 6),
  ('diabetes-melitus', 'kelor', 'Kelor', 7),
  ('diabetes-melitus', 'mengkudu', 'Mengkudu', 8),

  ('gastritis-maag', 'kunyit', 'Kunyit', 1),
  ('gastritis-maag', 'temulawak', 'Temulawak', 2),
  ('gastritis-maag', 'lidah-buaya', 'Lidah Buaya', 3),
  ('gastritis-maag', 'cincau-hijau', 'Cincau Hijau', 4),
  ('gastritis-maag', 'daun-jambu', 'Daun Jambu', 5),
  ('gastritis-maag', 'adas', 'Adas', 6),
  ('gastritis-maag', 'pepaya', 'Pepaya', 7),
  ('gastritis-maag', null, 'Madu Herbal', 8),

  ('demam', 'meniran', 'Meniran', 1),
  ('demam', 'sambiloto', 'Sambiloto', 2),
  ('demam', 'pepaya', 'Daun Pepaya', 3),
  ('demam', 'rosella', 'Rosella', 4),
  ('demam', 'temulawak', 'Temulawak', 5),
  ('demam', 'kunyit', 'Kunyit', 6),
  ('demam', 'pegagan', 'Pegagan', 7),
  ('demam', 'bunga-telang', 'Bunga Telang', 8),

  ('diare', 'daun-jambu', 'Daun Jambu Biji', 1),
  ('diare', 'kunyit', 'Kunyit', 2),
  ('diare', 'temulawak', 'Temulawak', 3),
  ('diare', 'daun-salam', 'Daun Salam', 4),
  ('diare', 'sambiloto', 'Sambiloto', 5),
  ('diare', 'meniran', 'Meniran', 6),
  ('diare', 'gambir', 'Gambir', 7),
  ('diare', 'teh-hijau', 'Teh Hijau', 8),

  ('hiperurisemia-asam-urat', 'sidaguri', 'Sidaguri', 1),
  ('hiperurisemia-asam-urat', 'kumis-kucing', 'Kumis Kucing', 2),
  ('hiperurisemia-asam-urat', 'tempuyung', 'Tempuyung', 3),
  ('hiperurisemia-asam-urat', 'seledri', 'Seledri', 4),
  ('hiperurisemia-asam-urat', 'daun-salam', 'Daun Salam', 5),
  ('hiperurisemia-asam-urat', 'meniran', 'Meniran', 6),
  ('hiperurisemia-asam-urat', 'sambiloto', 'Sambiloto', 7),
  ('hiperurisemia-asam-urat', 'jahe', 'Jahe', 8),

  ('alergi', 'meniran', 'Meniran', 1),
  ('alergi', 'pegagan', 'Pegagan', 2),
  ('alergi', 'daun-ungu', 'Daun Ungu', 3),
  ('alergi', 'sambung-nyawa', 'Sambung Nyawa', 4),
  ('alergi', 'kelor', 'Kelor', 5),
  ('alergi', 'rosella', 'Rosella', 6),
  ('alergi', 'temu-putih', 'Temu Putih', 7),
  ('alergi', 'bunga-telang', 'Bunga Telang', 8),

  ('hipertensi', 'seledri', 'Seledri', 1),
  ('hipertensi', 'kumis-kucing', 'Kumis Kucing', 2),
  ('hipertensi', 'rosella', 'Rosella', 3),
  ('hipertensi', 'belimbing-wuluh', 'Belimbing Wuluh', 4),
  ('hipertensi', 'bawang-putih', 'Bawang Putih', 5),
  ('hipertensi', 'pegagan', 'Pegagan', 6),
  ('hipertensi', 'daun-salam', 'Salam', 7),
  ('hipertensi', 'tempuyung', 'Tempuyung', 8),

  ('common-cold-pilek-batuk', 'jahe', 'Jahe', 1),
  ('common-cold-pilek-batuk', 'kencur', 'Kencur', 2),
  ('common-cold-pilek-batuk', 'jeruk-nipis', 'Jeruk Nipis', 3),
  ('common-cold-pilek-batuk', 'daun-sirih', 'Sirih', 4),
  ('common-cold-pilek-batuk', 'kayu-putih', 'Kayu Putih', 5),
  ('common-cold-pilek-batuk', 'saga', 'Saga', 6),
  ('common-cold-pilek-batuk', 'adas', 'Adas', 7),
  ('common-cold-pilek-batuk', 'lempuyang', 'Lempuyang', 8),

  ('obat-luka', 'binahong', 'Binahong', 1),
  ('obat-luka', 'pegagan', 'Pegagan', 2),
  ('obat-luka', 'daun-jarak', 'Daun Jarak', 3),
  ('obat-luka', 'sambung-nyawa', 'Sambung Nyawa', 4),
  ('obat-luka', 'daun-ungu', 'Daun Ungu', 5),
  ('obat-luka', 'lidah-buaya', 'Lidah Buaya', 6),
  ('obat-luka', null, 'Yodium', 7),
  ('obat-luka', 'tapak-liman', 'Tapak Liman', 8)
) as v(condition_slug, plant_slug, display_name, sort_order)
join public.health_conditions hc on hc.slug = v.condition_slug
left join public.plants p on p.slug = v.plant_slug;
