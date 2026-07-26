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

insert into public.health_zones (
  zone_code, slug, program_name, street_name, zone_name, block_ranges,
  health_topic, sign_text, short_description, overview, educational_points,
  healthy_habits, important_notes, source_notes, image_path, location_notes,
  validator_name, validator_id, validation_status, content_status, featured,
  published_at
) values
(
  'khb-z01',
  'digestia',
  'Kampung Herbal Harmony',
  'Jl. Digestia',
  'Zona Pencernaan Sehat',
  array['E1-10', 'H1-5'],
  'Edukasi umum mengenai sistem pencernaan dan kebiasaan hidup sehat.',
  'Digestia - Zona Pencernaan Sehat',
  'Zona edukasi masyarakat mengenai sistem pencernaan dan kebiasaan hidup sehat. Materi ini bersifat umum dan masih menunggu verifikasi tenaga kesehatan.',
  'Digestia mengenalkan kebiasaan harian yang mendukung kenyamanan sistem pencernaan, seperti konsumsi makanan seimbang, kecukupan cairan, kebersihan pangan, dan aktivitas fisik ringan.',
  array['Sistem pencernaan dipengaruhi pola makan, kebersihan, istirahat, dan aktivitas.', 'Tanaman herbal pada zona ini diperkenalkan sebagai bagian pemanfaatan tradisional yang perlu diverifikasi.', 'Keluhan pencernaan berulang perlu dikonsultasikan dengan tenaga kesehatan.'],
  array['Cuci tangan sebelum makan dan menyiapkan bahan pangan.', 'Pilih makanan beragam dengan porsi seimbang.', 'Minum air yang cukup sesuai kebutuhan tubuh.'],
  array['Informasi ini bukan diagnosis atau resep.', 'Jangan mengganti obat dokter dengan ramuan tradisional.', 'Ibu hamil, anak-anak, lansia, penderita penyakit tertentu, dan pengguna obat rutin perlu berkonsultasi dengan tenaga kesehatan.'],
  array[]::text[],
  '/images/zones/digestia.jpg',
  'Blok E1-10 dan H1-5.',
  'Menunggu verifikasi tenaga kesehatan',
  null,
  'data_demonstrasi',
  'published',
  true,
  now()
),
(
  'khb-z02',
  'respiria',
  'Kampung Herbal Harmony',
  'Jl. Respiria',
  'Zona Pernapasan Sehat',
  array['A1-7', 'D1-4', 'D9-14'],
  'Edukasi umum mengenai sistem pernapasan dan lingkungan sehat.',
  'Respiria - Zona Pernapasan Sehat',
  'Zona edukasi masyarakat mengenai sistem pernapasan dan lingkungan sehat. Materi ini bersifat umum dan masih menunggu verifikasi tenaga kesehatan.',
  'Respiria menekankan kebiasaan menjaga kualitas udara sekitar, etika batuk, aktivitas fisik yang sesuai kemampuan, dan pengenalan tanda keluhan pernapasan yang perlu diperiksa.',
  array['Kualitas udara, kebersihan rumah, dan kebiasaan merokok memengaruhi kesehatan pernapasan.', 'Tanaman aromatik dapat dikenalkan sebagai edukasi pemanfaatan tradisional, bukan terapi utama.', 'Sesak napas atau keluhan berat perlu pertolongan tenaga kesehatan.'],
  array['Jaga ventilasi dan kebersihan ruang bersama.', 'Hindari paparan asap rokok dan pembakaran sampah.', 'Gunakan masker saat sakit atau berada di lingkungan berdebu.'],
  array['Informasi ini bukan diagnosis atau terapi pernapasan.', 'Keluhan sesak, nyeri dada, atau demam tinggi perlu pemeriksaan segera.', 'Pengguna obat rutin perlu berkonsultasi sebelum menggunakan ramuan.'],
  array[]::text[],
  '/images/zones/respiria.jpg',
  'Blok A1-7, D1-4, dan D9-14.',
  'Menunggu verifikasi tenaga kesehatan',
  null,
  'data_demonstrasi',
  'published',
  true,
  now()
),
(
  'khb-z03',
  'glycemia',
  'Kampung Herbal Harmony',
  'Jl. Glycemia',
  'Zona Gula Darah Terkendali',
  array['H6-10', 'J2-4'],
  'Edukasi umum mengenai pola hidup sehat dan pemantauan gula darah oleh tenaga kesehatan.',
  'Glycemia - Zona Gula Darah Terkendali',
  'Zona edukasi masyarakat mengenai pola hidup sehat dan pemantauan gula darah oleh tenaga kesehatan. Materi ini bersifat umum dan masih menunggu verifikasi tenaga kesehatan.',
  'Glycemia berfokus pada literasi pola makan, aktivitas fisik, dan pentingnya pemeriksaan gula darah oleh tenaga kesehatan bagi warga yang membutuhkan.',
  array['Gula darah dipengaruhi makanan, aktivitas, istirahat, stres, dan kondisi kesehatan.', 'Pemantauan gula darah harus dilakukan dengan alat dan pendampingan yang tepat.', 'Tanaman herbal tidak boleh digunakan untuk mengganti obat dokter.'],
  array['Kurangi minuman berpemanis berlebihan.', 'Biasakan bergerak sesuai kemampuan tubuh.', 'Ikuti jadwal pemeriksaan kesehatan bila disarankan tenaga kesehatan.'],
  array['Zona ini tidak memberikan diagnosis diabetes.', 'Jangan menghentikan obat dokter karena informasi herbal.', 'Pengguna obat rutin wajib berkonsultasi sebelum mencoba ramuan.'],
  array[]::text[],
  '/images/zones/glycemia.jpg',
  'Blok H6-10 dan J2-4.',
  'Menunggu verifikasi tenaga kesehatan',
  null,
  'data_demonstrasi',
  'published',
  false,
  now()
),
(
  'khb-z04',
  'lipidia',
  'Kampung Herbal Harmony',
  'Jl. Lipidia',
  'Zona Lemak Sehat',
  array['D5-14', 'E1-4', 'E13-14'],
  'Edukasi umum mengenai pola makan seimbang dan kesehatan metabolik.',
  'Lipidia - Zona Lemak Sehat',
  'Zona edukasi masyarakat mengenai pola makan seimbang dan kesehatan metabolik. Materi ini bersifat umum dan masih menunggu verifikasi tenaga kesehatan.',
  'Lipidia memperkenalkan kebiasaan makan seimbang, pemilihan sumber lemak yang bijak, dan pemeriksaan kesehatan berkala sesuai saran tenaga kesehatan.',
  array['Kesehatan metabolik berkaitan dengan pola makan, aktivitas, tidur, dan faktor risiko lain.', 'Informasi herbal pada zona ini bersifat edukasi umum.', 'Pemeriksaan laboratorium hanya dilakukan oleh fasilitas atau tenaga kesehatan.'],
  array['Pilih cara masak yang tidak berlebihan minyak.', 'Konsumsi sayur, buah, dan sumber protein secara seimbang.', 'Lakukan aktivitas fisik ringan secara rutin sesuai kemampuan.'],
  array['Informasi ini tidak menyatakan tanaman dapat menurunkan kolesterol.', 'Hasil pemeriksaan dan obat harus dibahas dengan tenaga kesehatan.', 'Penderita penyakit tertentu perlu konsultasi sebelum memakai ramuan.'],
  array[]::text[],
  '/images/zones/lipidia.jpg',
  'Blok D5-14, E1-4, dan E13-14.',
  'Menunggu verifikasi tenaga kesehatan',
  null,
  'data_demonstrasi',
  'published',
  false,
  now()
),
(
  'khb-z05',
  'imun',
  'Kampung Herbal Harmony',
  'Jl. Imun',
  'Zona Daya Tahan Tubuh',
  array['B1-9', 'C1-7'],
  'Edukasi umum mengenai kebiasaan hidup sehat yang mendukung daya tahan tubuh.',
  'Imun - Zona Daya Tahan Tubuh',
  'Zona edukasi masyarakat mengenai kebiasaan hidup sehat yang mendukung daya tahan tubuh. Materi ini bersifat umum dan masih menunggu verifikasi tenaga kesehatan.',
  'Imun menekankan kebiasaan tidur cukup, gizi seimbang, aktivitas fisik, kebersihan diri, dan pemanfaatan tradisional tanaman secara hati-hati.',
  array['Daya tahan tubuh dipengaruhi banyak faktor, bukan satu tanaman atau ramuan.', 'Kebersihan diri dan lingkungan membantu menurunkan risiko paparan penyakit.', 'Keluhan menetap perlu dikonsultasikan dengan tenaga kesehatan.'],
  array['Tidur cukup dan kelola stres dengan cara sehat.', 'Cuci tangan pada waktu penting.', 'Konsumsi makanan beragam dan air yang cukup.'],
  array['Tidak ada klaim ramuan aman untuk semua orang.', 'Informasi herbal harus diverifikasi sebelum digunakan.', 'Anak-anak, ibu hamil, lansia, dan pengguna obat rutin perlu berkonsultasi.'],
  array[]::text[],
  '/images/zones/imun.jpg',
  'Blok B1-9 dan C1-7.',
  'Menunggu verifikasi tenaga kesehatan',
  null,
  'data_demonstrasi',
  'published',
  true,
  now()
),
(
  'khb-z06',
  'hepatia',
  'Kampung Herbal Harmony',
  'Jl. Hepatia',
  'Zona Hati Sehat',
  array['C8-13', 'F1-5'],
  'Edukasi umum mengenai fungsi hati dan perilaku hidup sehat.',
  'Hepatia - Zona Hati Sehat',
  'Zona edukasi masyarakat mengenai fungsi hati dan perilaku hidup sehat. Materi ini bersifat umum dan masih menunggu verifikasi tenaga kesehatan.',
  'Hepatia mengenalkan peran hati secara umum serta kebiasaan yang mendukung kesehatan tubuh, seperti makan seimbang, kehati-hatian konsumsi obat, dan konsultasi tenaga kesehatan.',
  array['Hati berperan dalam banyak proses tubuh dan dapat dipengaruhi obat, alkohol, infeksi, dan pola hidup.', 'Tanaman herbal tidak boleh diklaim membersihkan hati.', 'Penggunaan obat dan herbal bersamaan perlu dibahas dengan tenaga kesehatan.'],
  array['Gunakan obat sesuai aturan tenaga kesehatan.', 'Hindari konsumsi bahan yang belum jelas keamanan dan takarannya.', 'Jaga pola makan dan aktivitas sesuai kemampuan.'],
  array['Informasi ini bukan pemeriksaan fungsi hati.', 'Jangan menggunakan ramuan untuk mengganti terapi medis.', 'Penderita gangguan hati atau pengguna obat rutin wajib berkonsultasi.'],
  array[]::text[],
  '/images/zones/hepatia.jpg',
  'Blok C8-13 dan F1-5.',
  'Menunggu verifikasi tenaga kesehatan',
  null,
  'data_demonstrasi',
  'published',
  false,
  now()
),
(
  'khb-z07',
  'feminia',
  'Kampung Herbal Harmony',
  'Jl. Feminia',
  'Zona Wanita Sehat Alami',
  array['F6-9', 'G1-3', 'G4-5'],
  'Edukasi kesehatan perempuan yang bersifat umum dan tidak menggantikan konsultasi tenaga kesehatan.',
  'Feminia - Zona Wanita Sehat Alami',
  'Zona edukasi kesehatan perempuan yang bersifat umum dan tidak menggantikan konsultasi tenaga kesehatan. Materi ini masih menunggu verifikasi tenaga kesehatan.',
  'Feminia membahas kebiasaan hidup sehat, literasi kesehatan perempuan secara umum, dan kehati-hatian dalam memanfaatkan ramuan tradisional.',
  array['Kesehatan perempuan dipengaruhi usia, siklus hidup, gizi, aktivitas, dan kondisi kesehatan pribadi.', 'Keluhan reproduksi atau nyeri yang mengganggu perlu diperiksa tenaga kesehatan.', 'Ramuan tradisional tidak boleh mengganti konsultasi atau obat dokter.'],
  array['Jaga kebersihan diri dengan cara yang aman.', 'Catat keluhan yang berulang untuk dibahas saat konsultasi.', 'Pilih informasi kesehatan dari sumber yang dapat diverifikasi.'],
  array['Ibu hamil dan ibu menyusui harus berkonsultasi sebelum menggunakan ramuan herbal.', 'Pengguna obat rutin dan penderita penyakit tertentu perlu berkonsultasi.', 'Informasi ini bukan diagnosis atau resep.'],
  array[]::text[],
  '/images/zones/feminia.jpg',
  'Blok F6-9, G1-3, dan G4-5.',
  'Menunggu verifikasi tenaga kesehatan',
  null,
  'data_demonstrasi',
  'published',
  false,
  now()
),
(
  'khb-z08',
  'vaskulia',
  'Kampung Herbal Harmony',
  'Jl. Vaskulia',
  'Zona Jantung dan Pembuluh Darah Sehat',
  array['J5-8', 'K1-6'],
  'Edukasi umum mengenai kesehatan jantung, pembuluh darah, dan pola hidup sehat.',
  'Vaskulia - Zona Jantung dan Pembuluh Darah Sehat',
  'Zona edukasi masyarakat mengenai kesehatan jantung, pembuluh darah, dan pola hidup sehat. Materi ini bersifat umum dan masih menunggu verifikasi tenaga kesehatan.',
  'Vaskulia mengajak warga mengenal kebiasaan hidup sehat yang berhubungan dengan kesehatan jantung dan pembuluh darah tanpa membuat klaim pengobatan.',
  array['Kesehatan jantung berkaitan dengan pola makan, aktivitas, tidur, stres, rokok, dan pemeriksaan berkala.', 'Nyeri dada, sesak berat, atau gejala mendadak membutuhkan pertolongan medis.', 'Tanaman herbal tidak boleh diklaim mencegah penyakit jantung.'],
  array['Batasi garam, gula, dan lemak berlebihan sesuai anjuran umum.', 'Lakukan aktivitas fisik sesuai kemampuan dan kondisi tubuh.', 'Ikuti pemeriksaan tekanan darah bila tersedia melalui tenaga kesehatan.'],
  array['Informasi ini bukan diagnosis penyakit jantung.', 'Jangan mengganti obat dokter dengan ramuan.', 'Pengguna obat tekanan darah, pengencer darah, atau obat rutin lain wajib berkonsultasi.'],
  array[]::text[],
  '/images/zones/vaskulia.jpg',
  'Blok J5-8 dan K1-6.',
  'Menunggu verifikasi tenaga kesehatan',
  null,
  'data_demonstrasi',
  'published',
  false,
  now()
),
(
  'khb-z09',
  'pediatria',
  'Kampung Herbal Harmony',
  'Jl. Pediatria',
  'Zona Anak Ceria',
  array['I1-4', 'I5-11'],
  'Edukasi umum mengenai tumbuh kembang dan kebiasaan sehat anak.',
  'Pediatria - Zona Anak Ceria',
  'Zona edukasi masyarakat mengenai tumbuh kembang dan kebiasaan sehat anak. Materi ini bersifat umum dan masih menunggu verifikasi tenaga kesehatan.',
  'Pediatria memperkenalkan kebiasaan sehat anak, keamanan lingkungan, gizi seimbang, aktivitas bermain, dan pentingnya konsultasi tenaga kesehatan saat anak sakit.',
  array['Kebutuhan anak berbeda menurut usia dan kondisi kesehatan.', 'Ramuan herbal tidak boleh dianggap aman untuk semua anak.', 'Demam, diare, sesak, atau keluhan berat pada anak perlu pemeriksaan tenaga kesehatan.'],
  array['Biasakan cuci tangan dan kebersihan makanan.', 'Dorong aktivitas bermain yang aman dan cukup istirahat.', 'Pantau tumbuh kembang melalui layanan kesehatan yang sesuai.'],
  array['Anak-anak harus berkonsultasi dengan tenaga kesehatan sebelum menggunakan ramuan herbal.', 'Ibu hamil, ibu menyusui, dan pengguna obat rutin juga perlu berkonsultasi.', 'Informasi ini bukan diagnosis, resep, atau pengganti pemeriksaan anak.'],
  array[]::text[],
  '/images/zones/pediatria.jpg',
  'Blok I1-4 dan I5-11.',
  'Menunggu verifikasi tenaga kesehatan',
  null,
  'data_demonstrasi',
  'published',
  false,
  now()
)
on conflict (zone_code) do update set
  slug = excluded.slug,
  program_name = excluded.program_name,
  street_name = excluded.street_name,
  zone_name = excluded.zone_name,
  block_ranges = excluded.block_ranges,
  health_topic = excluded.health_topic,
  sign_text = excluded.sign_text,
  short_description = excluded.short_description,
  overview = excluded.overview,
  educational_points = excluded.educational_points,
  healthy_habits = excluded.healthy_habits,
  important_notes = excluded.important_notes,
  source_notes = excluded.source_notes,
  image_path = excluded.image_path,
  location_notes = excluded.location_notes,
  validator_name = excluded.validator_name,
  validator_id = excluded.validator_id,
  validation_status = excluded.validation_status,
  content_status = excluded.content_status,
  featured = excluded.featured,
  published_at = coalesce(public.health_zones.published_at, excluded.published_at);

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
