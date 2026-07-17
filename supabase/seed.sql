-- Demonstration seed data for the plants catalog.
-- Mirrors src/data/plants.ts so the database and local fallback show the
-- same six example plants during this migration sprint.
--
-- Safe to run multiple times: each insert upserts by the unique `slug`.
-- Contains no personal data, no phone numbers, and no health/cure claims.
-- validator_id stays null — verification is a manual step performed later
-- by the Farmasi team, not something this seed can assert on their behalf.

insert into public.plants (
  slug, local_name, scientific_name, other_names, category,
  short_description, description, used_parts, traditional_uses,
  preparation, care_instructions, warnings, image_path, location_status,
  source_notes, validator_id, validator_name, validation_status,
  content_status, featured, published_at
) values (
  'jahe',
  'Jahe',
  'Zingiber officinale',
  array['Ginger'],
  'rimpang',
  'Rimpang aromatik yang secara tradisional digunakan untuk membantu menghangatkan tubuh.',
  'Jahe merupakan tanaman rimpang beraroma kuat yang sering dimanfaatkan dalam minuman hangat dan bumbu dapur. Informasi ini bersifat demonstrasi dan perlu diverifikasi sebelum publikasi final.',
  array['Rimpang'],
  array[
    'Secara tradisional digunakan untuk membantu menghangatkan tubuh.',
    'Sering dimanfaatkan sebagai bahan minuman herbal rumahan.',
    'Dipakai sebagai bumbu yang memberi aroma pada masakan.'
  ],
  array[
    'Cuci rimpang sampai bersih sebelum digunakan.',
    'Iris atau geprek rimpang, lalu seduh dengan air panas sesuai kebutuhan.',
    'Gunakan secukupnya dan hindari konsumsi berlebihan.'
  ],
  array[
    'Tanam pada media gembur dengan drainase baik.',
    'Letakkan di area yang mendapat cahaya matahari tidak terlalu terik.',
    'Jaga media tetap lembap, bukan tergenang.'
  ],
  array[
    'Pengguna obat rutin, ibu hamil, anak-anak, lansia, dan penderita penyakit tertentu perlu berkonsultasi dengan tenaga kesehatan.',
    'Informasi ini bukan pengganti diagnosis atau resep tenaga kesehatan.'
  ],
  '/images/placeholders/plant.svg',
  'Lokasi tanaman sedang dipetakan.',
  'Data demonstrasi berdasarkan pengetahuan umum tanaman TOGA.',
  null,
  'Menunggu verifikasi tim Farmasi.',
  'data_demonstrasi',
  'published',
  true,
  now()
)
on conflict (slug) do update set
  local_name = excluded.local_name,
  scientific_name = excluded.scientific_name,
  other_names = excluded.other_names,
  category = excluded.category,
  short_description = excluded.short_description,
  description = excluded.description,
  used_parts = excluded.used_parts,
  traditional_uses = excluded.traditional_uses,
  preparation = excluded.preparation,
  care_instructions = excluded.care_instructions,
  warnings = excluded.warnings,
  image_path = excluded.image_path,
  location_status = excluded.location_status,
  source_notes = excluded.source_notes,
  validator_name = excluded.validator_name,
  validation_status = excluded.validation_status,
  content_status = excluded.content_status,
  featured = excluded.featured;

insert into public.plants (
  slug, local_name, scientific_name, other_names, category,
  short_description, description, used_parts, traditional_uses,
  preparation, care_instructions, warnings, image_path, location_status,
  source_notes, validator_id, validator_name, validation_status,
  content_status, featured, published_at
) values (
  'kunyit',
  'Kunyit',
  'Curcuma longa',
  array['Kunir'],
  'rimpang',
  'Rimpang berwarna kuning yang umum digunakan sebagai bumbu dan bahan ramuan tradisional.',
  'Kunyit dikenal sebagai rimpang berwarna kuning jingga dengan aroma khas. Pemanfaatannya pada website ini ditulis sebagai edukasi pemanfaatan tradisional, bukan klaim pengobatan.',
  array['Rimpang'],
  array[
    'Secara tradisional digunakan untuk membantu menjaga kebugaran.',
    'Sering menjadi bahan minuman kunyit asam.',
    'Digunakan sebagai pewarna dan bumbu alami pada masakan.'
  ],
  array[
    'Kupas tipis atau sikat rimpang yang sudah dicuci bersih.',
    'Parut, iris, atau rebus sesuai resep tradisional yang tervalidasi.',
    'Hindari penggunaan berlebihan tanpa arahan tenaga kesehatan.'
  ],
  array[
    'Gunakan media tanam yang gembur dan kaya bahan organik.',
    'Siram secukupnya saat permukaan media mulai kering.',
    'Pisahkan rimpang sehat untuk perbanyakan.'
  ],
  array[
    'Orang dengan gangguan lambung, gangguan empedu, atau penggunaan obat rutin perlu berkonsultasi terlebih dahulu.',
    'Informasi ini bukan pengganti konsultasi dengan dokter, apoteker, atau tenaga kesehatan.'
  ],
  '/images/placeholders/plant.svg',
  'Lokasi tanaman sedang dipetakan.',
  'Data demonstrasi berdasarkan pengetahuan umum tanaman TOGA.',
  null,
  'Menunggu verifikasi tim Farmasi.',
  'data_demonstrasi',
  'published',
  true,
  now()
)
on conflict (slug) do update set
  local_name = excluded.local_name,
  scientific_name = excluded.scientific_name,
  other_names = excluded.other_names,
  category = excluded.category,
  short_description = excluded.short_description,
  description = excluded.description,
  used_parts = excluded.used_parts,
  traditional_uses = excluded.traditional_uses,
  preparation = excluded.preparation,
  care_instructions = excluded.care_instructions,
  warnings = excluded.warnings,
  image_path = excluded.image_path,
  location_status = excluded.location_status,
  source_notes = excluded.source_notes,
  validator_name = excluded.validator_name,
  validation_status = excluded.validation_status,
  content_status = excluded.content_status,
  featured = excluded.featured;

insert into public.plants (
  slug, local_name, scientific_name, other_names, category,
  short_description, description, used_parts, traditional_uses,
  preparation, care_instructions, warnings, image_path, location_status,
  source_notes, validator_id, validator_name, validation_status,
  content_status, featured, published_at
) values (
  'serai',
  'Serai',
  'Cymbopogon citratus',
  array['Sereh', 'Lemongrass'],
  'batang',
  'Tanaman beraroma segar yang umum digunakan pada masakan dan seduhan tradisional.',
  'Serai memiliki batang beraroma lemon yang banyak digunakan dalam dapur rumah tangga. Informasi ini merupakan data demonstrasi untuk struktur katalog tahap pertama.',
  array['Batang', 'Daun'],
  array[
    'Secara tradisional digunakan untuk membantu memberi rasa hangat dan segar pada minuman.',
    'Digunakan sebagai bumbu aromatik pada masakan.',
    'Dimanfaatkan sebagai tanaman pekarangan yang mudah dirawat.'
  ],
  array[
    'Cuci batang serai, buang bagian yang kering, lalu geprek.',
    'Seduh atau rebus ringan sesuai kebutuhan ramuan tradisional.',
    'Gunakan takaran wajar dan hentikan bila muncul keluhan.'
  ],
  array[
    'Tanam rumpun serai pada area yang cukup terkena matahari.',
    'Pangkas daun tua agar rumpun tetap rapi.',
    'Siram secara teratur saat musim kering.'
  ],
  array[
    'Ibu hamil, anak-anak, lansia, dan pengguna obat rutin perlu berhati-hati dan berkonsultasi bila diperlukan.',
    'Tidak semua orang cocok mengonsumsi ramuan herbal.'
  ],
  '/images/placeholders/plant.svg',
  'Lokasi tanaman sedang dipetakan.',
  'Data demonstrasi berdasarkan pengetahuan umum tanaman TOGA.',
  null,
  'Menunggu verifikasi tim Farmasi.',
  'data_demonstrasi',
  'published',
  true,
  now()
)
on conflict (slug) do update set
  local_name = excluded.local_name,
  scientific_name = excluded.scientific_name,
  other_names = excluded.other_names,
  category = excluded.category,
  short_description = excluded.short_description,
  description = excluded.description,
  used_parts = excluded.used_parts,
  traditional_uses = excluded.traditional_uses,
  preparation = excluded.preparation,
  care_instructions = excluded.care_instructions,
  warnings = excluded.warnings,
  image_path = excluded.image_path,
  location_status = excluded.location_status,
  source_notes = excluded.source_notes,
  validator_name = excluded.validator_name,
  validation_status = excluded.validation_status,
  content_status = excluded.content_status,
  featured = excluded.featured;

insert into public.plants (
  slug, local_name, scientific_name, other_names, category,
  short_description, description, used_parts, traditional_uses,
  preparation, care_instructions, warnings, image_path, location_status,
  source_notes, validator_id, validator_name, validation_status,
  content_status, featured, published_at
) values (
  'daun-sirih',
  'Daun Sirih',
  'Piper betle',
  array['Sirih'],
  'daun',
  'Tanaman merambat yang daunnya dikenal dalam pemanfaatan tradisional masyarakat.',
  'Daun sirih merupakan tanaman merambat yang sering ditanam di pekarangan. Penjelasan pada halaman ini perlu validasi lebih lanjut sebelum menjadi informasi publik final.',
  array['Daun'],
  array[
    'Secara tradisional digunakan dalam praktik kebersihan keluarga.',
    'Dimanfaatkan sebagai tanaman pekarangan dan edukasi TOGA.',
    'Sering menjadi contoh tanaman obat keluarga di lingkungan warga.'
  ],
  array[
    'Pilih daun yang bersih dan tidak rusak.',
    'Cuci dengan air mengalir sebelum digunakan.',
    'Ikuti panduan tenaga kesehatan untuk pemanfaatan yang melibatkan tubuh.'
  ],
  array[
    'Sediakan rambatan sederhana agar tanaman tumbuh terarah.',
    'Letakkan di area teduh terang.',
    'Jaga kelembapan media dan hindari genangan.'
  ],
  array[
    'Jangan digunakan pada luka, area sensitif, atau keluhan kesehatan tanpa arahan tenaga kesehatan.',
    'Informasi ini bersifat umum dan tidak menggantikan konsultasi profesional.'
  ],
  '/images/placeholders/plant.svg',
  'Lokasi tanaman sedang dipetakan.',
  'Data demonstrasi berdasarkan pengetahuan umum tanaman TOGA.',
  null,
  'Menunggu verifikasi tim Farmasi.',
  'data_demonstrasi',
  'published',
  false,
  now()
)
on conflict (slug) do update set
  local_name = excluded.local_name,
  scientific_name = excluded.scientific_name,
  other_names = excluded.other_names,
  category = excluded.category,
  short_description = excluded.short_description,
  description = excluded.description,
  used_parts = excluded.used_parts,
  traditional_uses = excluded.traditional_uses,
  preparation = excluded.preparation,
  care_instructions = excluded.care_instructions,
  warnings = excluded.warnings,
  image_path = excluded.image_path,
  location_status = excluded.location_status,
  source_notes = excluded.source_notes,
  validator_name = excluded.validator_name,
  validation_status = excluded.validation_status,
  content_status = excluded.content_status,
  featured = excluded.featured;

insert into public.plants (
  slug, local_name, scientific_name, other_names, category,
  short_description, description, used_parts, traditional_uses,
  preparation, care_instructions, warnings, image_path, location_status,
  source_notes, validator_id, validator_name, validation_status,
  content_status, featured, published_at
) values (
  'bunga-telang',
  'Bunga Telang',
  'Clitoria ternatea',
  array['Telang'],
  'bunga',
  'Bunga berwarna biru yang sering dimanfaatkan sebagai pewarna alami minuman.',
  'Bunga telang dikenal karena warna birunya yang menarik dan sering digunakan sebagai pewarna alami. Data ini masih demonstrasi dan belum menjadi rekomendasi kesehatan.',
  array['Bunga'],
  array[
    'Secara tradisional digunakan untuk memberi warna alami pada minuman.',
    'Dimanfaatkan sebagai tanaman edukasi karena perubahan warna seduhan saat diberi bahan asam.',
    'Menjadi tanaman hias pekarangan yang mudah dikenali.'
  ],
  array[
    'Gunakan bunga yang bersih dan layak konsumsi.',
    'Seduh secukupnya dengan air panas.',
    'Pastikan tidak ada pestisida atau kontaminan pada bunga yang dipakai.'
  ],
  array[
    'Tanam pada area yang mendapat sinar matahari cukup.',
    'Sediakan rambatan agar tanaman tidak menjalar sembarangan.',
    'Pangkas ringan untuk menjaga pertumbuhan.'
  ],
  array[
    'Orang dengan kondisi kesehatan tertentu perlu berkonsultasi sebelum konsumsi rutin.',
    'Pastikan bahan berasal dari tanaman yang aman dan bersih.'
  ],
  '/images/placeholders/plant.svg',
  'Lokasi tanaman sedang dipetakan.',
  'Data demonstrasi berdasarkan pengetahuan umum tanaman TOGA.',
  null,
  'Menunggu verifikasi tim Farmasi.',
  'data_demonstrasi',
  'published',
  true,
  now()
)
on conflict (slug) do update set
  local_name = excluded.local_name,
  scientific_name = excluded.scientific_name,
  other_names = excluded.other_names,
  category = excluded.category,
  short_description = excluded.short_description,
  description = excluded.description,
  used_parts = excluded.used_parts,
  traditional_uses = excluded.traditional_uses,
  preparation = excluded.preparation,
  care_instructions = excluded.care_instructions,
  warnings = excluded.warnings,
  image_path = excluded.image_path,
  location_status = excluded.location_status,
  source_notes = excluded.source_notes,
  validator_name = excluded.validator_name,
  validation_status = excluded.validation_status,
  content_status = excluded.content_status,
  featured = excluded.featured;

insert into public.plants (
  slug, local_name, scientific_name, other_names, category,
  short_description, description, used_parts, traditional_uses,
  preparation, care_instructions, warnings, image_path, location_status,
  source_notes, validator_id, validator_name, validation_status,
  content_status, featured, published_at
) values (
  'temulawak',
  'Temulawak',
  'Curcuma xanthorrhiza',
  array['Javanese turmeric'],
  'rimpang',
  'Rimpang khas Indonesia yang umum dikenalkan dalam edukasi tanaman obat keluarga.',
  'Temulawak merupakan tanaman rimpang yang sering dikaitkan dengan tradisi jamu Indonesia. Informasi ini disediakan sebagai contoh struktur data dan menunggu verifikasi.',
  array['Rimpang'],
  array[
    'Secara tradisional digunakan untuk membantu menjaga kebugaran.',
    'Sering diperkenalkan dalam edukasi jamu keluarga.',
    'Digunakan sebagai bahan ramuan tradisional dengan takaran terbatas.'
  ],
  array[
    'Cuci rimpang hingga bersih sebelum diolah.',
    'Iris tipis atau rebus ringan sesuai panduan ramuan yang tervalidasi.',
    'Hindari konsumsi jangka panjang tanpa konsultasi tenaga kesehatan.'
  ],
  array[
    'Tanam pada tanah gembur dengan kelembapan cukup.',
    'Berikan ruang agar rumpun rimpang dapat berkembang.',
    'Panen hanya setelah tanaman cukup umur.'
  ],
  array[
    'Pengguna obat rutin dan orang dengan gangguan hati atau empedu perlu berkonsultasi dengan tenaga kesehatan.',
    'Ramuan tradisional tidak menggantikan terapi medis.'
  ],
  '/images/placeholders/plant.svg',
  'Lokasi tanaman sedang dipetakan.',
  'Data demonstrasi berdasarkan pengetahuan umum tanaman TOGA.',
  null,
  'Menunggu verifikasi tim Farmasi.',
  'data_demonstrasi',
  'published',
  false,
  now()
)
on conflict (slug) do update set
  local_name = excluded.local_name,
  scientific_name = excluded.scientific_name,
  other_names = excluded.other_names,
  category = excluded.category,
  short_description = excluded.short_description,
  description = excluded.description,
  used_parts = excluded.used_parts,
  traditional_uses = excluded.traditional_uses,
  preparation = excluded.preparation,
  care_instructions = excluded.care_instructions,
  warnings = excluded.warnings,
  image_path = excluded.image_path,
  location_status = excluded.location_status,
  source_notes = excluded.source_notes,
  validator_name = excluded.validator_name,
  validation_status = excluded.validation_status,
  content_status = excluded.content_status,
  featured = excluded.featured;
