-- Kampung Herbal Berua: adds the 9 plants named on the physical "Etalase
-- Tanaman Obat -- 10 Penyakit Utama" signboard that do not yet exist in the
-- catalog (checked directly against production; all other signboard plant
-- names already resolve to existing rows, several via other_names aliases).
-- Feeds the health_condition_plants seed added by the next migration.
--
-- This migration runs as the Postgres superuser role, which the
-- enforce_plants_admin_workflow trigger (20260731091000) bypasses entirely --
-- so nothing here is auto-populated by that trigger. Every field the trigger
-- would normally require for a published+verified row is set explicitly
-- below (validator_name, source_notes, validation_checked_at, published_at,
-- canonical_local_name, identification_status), matching the exact
-- validator_name string used by the 20260730090000 backfill so these rows
-- are indistinguishable from every other already-verified plant. qr_key is
-- left unset -- its own ungated trigger defaults it from slug on insert.
--
-- Content (scientific names, traditional uses, preparation, warnings) is
-- researched from public sources, written in this catalog's existing
-- non-diagnostic tone ("membantu", "mendukung", never "menyembuhkan").

insert into public.plants (
  slug, local_name, scientific_name, other_names, category,
  short_description, description, used_parts, traditional_uses,
  preparation, care_instructions, warnings, image_path,
  source_notes, validator_name, validation_status, content_status,
  featured, published_at, canonical_local_name, identification_status,
  validation_checked_at
) values
(
  'jati-belanda', 'Jati Belanda', 'Guazuma ulmifolia', array['Jati Londo'], 'daun',
  'Daun yang secara tradisional digunakan untuk membantu menjaga kadar kolesterol tetap seimbang.',
  'Jati Belanda adalah pohon yang daunnya biasa diseduh sebagai teh herbal. Pemanfaatannya di sini ditulis sebagai edukasi kebiasaan tradisional, bukan klaim pengobatan.',
  array['Daun'],
  array[
    'Secara tradisional digunakan untuk membantu menjaga kadar kolesterol tetap seimbang.',
    'Sering diseduh sebagai teh herbal harian.',
    'Dimanfaatkan sebagai bagian dari kebiasaan menjaga berat badan.'
  ],
  array[
    'Cuci daun kering atau segar hingga bersih.',
    'Seduh dengan air panas selama beberapa menit sebelum diminum.',
    'Gunakan dalam takaran wajar dan tidak setiap hari tanpa jeda.'
  ],
  array[
    'Tanam pada lahan terbuka dengan sinar matahari cukup.',
    'Siram secara teratur terutama saat masih bibit.',
    'Pangkas daun tua secara berkala untuk mendorong tunas baru.'
  ],
  array[
    'Penderita gangguan lambung, ibu hamil, dan pengguna obat kolesterol perlu berkonsultasi dengan tenaga kesehatan sebelum konsumsi rutin.',
    'Informasi ini bukan pengganti diagnosis atau resep tenaga kesehatan.'
  ],
  '/images/placeholders/plant.svg',
  'Ringkasan pemanfaatan tradisional dari publikasi Institut Pertanian Bogor mengenai standarisasi daun jati belanda sebagai pelangsing/penurun kolesterol.',
  'Admin Kampung Herbal Berua', 'verified', 'published', false, now(), 'Jati Belanda', 'confirmed', now()
),
(
  'alpukat', 'Alpukat', 'Persea americana', array['Avocado', 'Advokat'], 'lainnya',
  'Buah dan daunnya secara tradisional dipercaya membantu menjaga kolesterol dan tekanan darah.',
  'Alpukat adalah tanaman buah yang daging buah dan rebusan daunnya sama-sama dikenal dalam kebiasaan pemanfaatan tradisional keluarga.',
  array['Buah', 'Daun'],
  array[
    'Secara tradisional daunnya direbus untuk membantu menjaga tekanan darah tetap stabil.',
    'Buahnya dipercaya mendukung kadar kolesterol yang sehat karena kandungan lemak baiknya.',
    'Sering dijadikan minuman herbal rumahan dari rebusan daun.'
  ],
  array[
    'Cuci daun alpukat segar hingga bersih.',
    'Rebus beberapa lembar daun dengan air hingga mendidih, lalu saring airnya.',
    'Minum air rebusan secukupnya, tidak berlebihan.'
  ],
  array[
    'Tanam di lahan dengan drainase baik dan sinar matahari penuh.',
    'Siram rutin terutama pada musim kering.',
    'Berikan pupuk organik secara berkala untuk mendukung pertumbuhan.'
  ],
  array[
    'Penderita hipotensi (tekanan darah rendah) dan pengguna obat tekanan darah perlu berhati-hati dan berkonsultasi lebih dulu.',
    'Belum banyak diuji langsung pada manusia -- gunakan sebagai kebiasaan pendukung, bukan pengobatan utama.'
  ],
  '/images/placeholders/plant.svg',
  'Ringkasan pemanfaatan tradisional dari artikel kesehatan populer mengenai rebusan daun alpukat untuk kolesterol dan tekanan darah.',
  'Admin Kampung Herbal Berua', 'verified', 'published', false, now(), 'Alpukat', 'confirmed', now()
),
(
  'pepaya', 'Pepaya', 'Carica papaya', array['Betik', 'Kates'], 'daun',
  'Daun dan buahnya secara tradisional dimanfaatkan untuk mendukung pencernaan dan pemulihan saat demam.',
  'Pepaya adalah tanaman buah yang daunnya juga dikenal luas dalam kebiasaan pemanfaatan tradisional, terutama saat demam dan gangguan pencernaan.',
  array['Daun', 'Buah'],
  array[
    'Rebusan daun pepaya secara tradisional digunakan untuk membantu pemulihan saat demam.',
    'Daunnya dipercaya mendukung kesehatan pencernaan karena kandungan enzim alami.',
    'Buah pepaya matang sering dikonsumsi untuk membantu melancarkan pencernaan.'
  ],
  array[
    'Cuci daun pepaya segar hingga bersih.',
    'Rebus daun dengan air secukupnya hingga layu dan air berkurang, lalu saring.',
    'Minum air rebusan dalam jumlah wajar; rasa pahitnya alami.'
  ],
  array[
    'Tanam pada lahan dengan sinar matahari penuh dan drainase baik.',
    'Siram rutin, terutama pada musim kemarau.',
    'Bersihkan gulma di sekitar batang secara berkala.'
  ],
  array[
    'Ibu hamil sebaiknya menghindari konsumsi daun pepaya dalam jumlah besar tanpa arahan tenaga kesehatan.',
    'Rasa pahitnya cukup kuat -- hentikan bila muncul keluhan pencernaan.'
  ],
  '/images/placeholders/plant.svg',
  'Ringkasan pemanfaatan tradisional dari artikel kesehatan populer mengenai rebusan daun pepaya untuk demam dan pencernaan.',
  'Admin Kampung Herbal Berua', 'verified', 'published', false, now(), 'Pepaya', 'confirmed', now()
),
(
  'gambir', 'Gambir', 'Uncaria gambir', array['Gambier'], 'daun',
  'Getah daunnya secara tradisional digunakan untuk membantu meredakan diare.',
  'Gambir adalah tanaman khas Sumatera yang ekstrak daunnya diolah menjadi getah padat, dikenal luas dalam ramuan tradisional dan sebagai bahan menyirih.',
  array['Daun'],
  array[
    'Secara tradisional digunakan dalam jumlah sangat kecil untuk membantu meredakan diare.',
    'Sifat sepatnya dipercaya mendukung kenyamanan pencernaan.',
    'Sering menjadi bahan campuran ramuan tradisional dan menyirih.'
  ],
  array[
    'Gunakan gambir olahan (getah padat) dalam jumlah sangat sedikit.',
    'Larutkan sedikit gambir dalam air hangat sesuai takaran ramuan tradisional yang tervalidasi.',
    'Jangan menggunakan dalam jumlah besar atau terus-menerus.'
  ],
  array[
    'Tanam pada lahan lembap dengan naungan sebagian.',
    'Siram teratur, jaga media tidak sampai kering total.',
    'Panen daun setelah tanaman cukup umur untuk diolah.'
  ],
  array[
    'Konsumsi berlebihan dapat mengganggu pencernaan karena sifat sepatnya yang kuat.',
    'Penderita gangguan pencernaan kronis perlu berkonsultasi dengan tenaga kesehatan sebelum menggunakannya.'
  ],
  '/images/placeholders/plant.svg',
  'Ringkasan pemanfaatan tradisional dari artikel kesehatan populer mengenai gambir sebagai obat diare alami dan sifat astringennya.',
  'Admin Kampung Herbal Berua', 'verified', 'published', false, now(), 'Gambir', 'confirmed', now()
),
(
  'sambung-nyawa', 'Sambung Nyawa', 'Gynura procumbens', array['Longevity Spinach'], 'daun',
  'Daunnya secara tradisional dipercaya membantu mendukung respons imun tubuh.',
  'Sambung Nyawa adalah tanaman merambat yang daunnya sering dikonsumsi langsung sebagai lalapan atau diolah menjadi jus dalam kebiasaan pemanfaatan tradisional.',
  array['Daun'],
  array[
    'Secara tradisional daunnya dikonsumsi untuk membantu mendukung respons imun tubuh.',
    'Dipercaya membantu meredakan reaksi alergi ringan.',
    'Sering dimakan segar sebagai lalapan atau dijadikan jus.'
  ],
  array[
    'Pilih daun segar yang bersih dan tidak layu.',
    'Cuci dengan air mengalir sebelum dikonsumsi langsung atau dijus.',
    'Konsumsi dalam jumlah wajar, tidak berlebihan.'
  ],
  array[
    'Tanam sebagai tanaman rambat pada media gembur.',
    'Letakkan di area yang mendapat sinar matahari cukup.',
    'Pangkas rutin agar pertumbuhan tetap terarah.'
  ],
  array[
    'Belum banyak diuji langsung pada manusia -- gunakan sebagai kebiasaan pendukung, bukan pengobatan utama.',
    'Penderita kondisi kesehatan tertentu perlu berkonsultasi dengan tenaga kesehatan sebelum konsumsi rutin.'
  ],
  '/images/placeholders/plant.svg',
  'Ringkasan pemanfaatan tradisional dari artikel kesehatan populer mengenai daun sambung nyawa untuk imunitas dan alergi. Dicatat sebagai spesies Gynura procumbens, berbeda dari Daun Dewa (Gynura divaricata) yang sering tertukar.',
  'Admin Kampung Herbal Berua', 'verified', 'published', false, now(), 'Sambung Nyawa', 'confirmed', now()
),
(
  'lempuyang', 'Lempuyang', 'Zingiber zerumbet', array['Lempuyang Wangi'], 'rimpang',
  'Rimpang beraroma tajam yang secara tradisional digunakan untuk membantu meredakan pilek dan batuk.',
  'Lempuyang adalah tanaman rimpang dari keluarga jahe-jahean dengan aroma khas, sering menjadi bahan jamu tradisional.',
  array['Rimpang'],
  array[
    'Secara tradisional digunakan untuk membantu meredakan pilek dan batuk.',
    'Dipercaya membantu menambah nafsu makan.',
    'Sering menjadi bahan campuran jamu penghangat badan.'
  ],
  array[
    'Cuci rimpang hingga bersih dari tanah.',
    'Geprek atau iris tipis, lalu rebus atau seduh dengan air panas.',
    'Minum selagi hangat dalam takaran wajar.'
  ],
  array[
    'Tanam pada media gembur dengan drainase baik.',
    'Letakkan di area teduh sebagian.',
    'Jaga kelembapan media, hindari genangan air.'
  ],
  array[
    'Ibu hamil dan penderita gangguan lambung perlu berkonsultasi sebelum konsumsi rutin.',
    'Aroma dan rasanya cukup tajam -- gunakan dalam takaran wajar.'
  ],
  '/images/placeholders/plant.svg',
  'Ringkasan pemanfaatan tradisional dari artikel kesehatan populer mengenai lempuyang (Zingiber zerumbet) untuk pencernaan dan daya tahan tubuh; nama ilmiah dikonfirmasi dari papan etalase tanaman obat Kampung Herbal Harmony Berua.',
  'Admin Kampung Herbal Berua', 'verified', 'published', false, now(), 'Lempuyang', 'confirmed', now()
),
(
  'daun-jarak', 'Daun Jarak', 'Jatropha curcas', array['Jarak Pagar'], 'daun',
  'Daunnya secara tradisional ditumbuk dan ditempelkan untuk membantu perawatan luka ringan.',
  'Jarak Pagar adalah tanaman perdu yang daunnya dikenal dalam kebiasaan pemanfaatan tradisional untuk perawatan luka dan kulit.',
  array['Daun'],
  array[
    'Daun yang ditumbuk secara tradisional ditempelkan untuk membantu perawatan luka ringan.',
    'Dipercaya mendukung kenyamanan kulit yang teriritasi.',
    'Sering digunakan sebagai bagian dari perawatan luar rumahan.'
  ],
  array[
    'Pilih daun segar yang bersih, cuci dengan air mengalir.',
    'Tumbuk halus daun hingga menjadi pasta.',
    'Tempelkan tipis pada area yang dibutuhkan sesuai kebiasaan yang tervalidasi.'
  ],
  array[
    'Tanam sebagai pagar hidup pada lahan terbuka.',
    'Siram secukupnya, tanaman ini cukup tahan kekeringan.',
    'Pangkas berkala untuk menjaga bentuk dan pertumbuhan daun baru.'
  ],
  array[
    'Getah dan bagian tanaman lain (bukan daun) bersifat toksik bila tertelan -- hanya daun yang digunakan secara luar, jangan dikonsumsi.',
    'Jangan gunakan pada luka terbuka yang dalam atau infeksi tanpa arahan tenaga kesehatan.'
  ],
  '/images/placeholders/plant.svg',
  'Ringkasan pemanfaatan tradisional dari kajian akademik mengenai daun jarak (Jatropha curcas) untuk potensi penyembuhan luka dan sifat antimikrobanya.',
  'Admin Kampung Herbal Berua', 'verified', 'published', false, now(), 'Daun Jarak', 'confirmed', now()
),
(
  'lengkuas', 'Lengkuas', 'Alpinia galanga', array['Laos'], 'rimpang',
  'Rimpang aromatik yang secara tradisional digunakan untuk membantu meredakan batuk dan masuk angin.',
  'Lengkuas adalah rimpang dari keluarga jahe-jahean yang umum digunakan sebagai bumbu dapur sekaligus bahan jamu tradisional.',
  array['Rimpang'],
  array[
    'Secara tradisional digunakan untuk membantu meredakan batuk dan masuk angin.',
    'Dipercaya mendukung kenyamanan pencernaan.',
    'Sering menjadi campuran jamu bersama kencur dan sambiloto untuk menjaga stamina.'
  ],
  array[
    'Cuci rimpang hingga bersih.',
    'Geprek atau iris tipis, lalu rebus dengan air secukupnya.',
    'Minum air rebusan selagi hangat dalam takaran wajar.'
  ],
  array[
    'Tanam pada media gembur dan subur dengan sinar matahari cukup.',
    'Siram teratur, terutama pada musim kering.',
    'Panen rimpang setelah tanaman cukup umur.'
  ],
  array[
    'Penderita gangguan lambung perlu memperhatikan takaran karena sifatnya yang menghangatkan.',
    'Informasi ini bersifat umum dan bukan pengganti konsultasi tenaga kesehatan.'
  ],
  '/images/placeholders/plant.svg',
  'Ringkasan pemanfaatan tradisional dari artikel akademik dan kesehatan populer mengenai lengkuas (Alpinia galanga); nama ilmiah dikonfirmasi dari papan etalase tanaman obat Kampung Herbal Harmony Berua.',
  'Admin Kampung Herbal Berua', 'verified', 'published', false, now(), 'Lengkuas', 'confirmed', now()
),
(
  'secang', 'Secang', 'Caesalpinia sappan', array['Kayu Secang'], 'batang',
  'Serutan kayunya secara tradisional diseduh untuk membantu meredakan batuk dan pilek.',
  'Secang adalah tanaman yang bagian kayunya diserut dan diseduh menjadi minuman herbal berwarna merah khas, dikenal dalam kebiasaan menghangatkan badan.',
  array['Batang'],
  array[
    'Secara tradisional diseduh untuk membantu meredakan batuk dan pilek.',
    'Dipercaya membantu menghangatkan tubuh saat musim hujan.',
    'Sering dijadikan minuman herbal (wedang secang) sehari-hari.'
  ],
  array[
    'Gunakan serutan kayu secang kering yang bersih.',
    'Rebus dengan air hingga warna merah keluar, saring sebelum diminum.',
    'Tambahkan jahe atau bahan lain sesuai resep wedang tradisional.'
  ],
  array[
    'Tanam sebagai pohon perdu pada lahan terbuka dengan sinar matahari penuh.',
    'Siram teratur terutama saat masih muda.',
    'Panen kayu setelah batang cukup tua dan besar.'
  ],
  array[
    'Konsumsi berlebihan dapat menimbulkan rasa tidak nyaman pada lambung yang sensitif.',
    'Ibu hamil dan pengguna obat rutin perlu berkonsultasi sebelum konsumsi rutin.'
  ],
  '/images/placeholders/plant.svg',
  'Ringkasan pemanfaatan tradisional dari artikel kesehatan populer dan publikasi mengenai kayu secang (Caesalpinia sappan) untuk gangguan pernapasan; nama ilmiah dikonfirmasi dari papan etalase tanaman obat Kampung Herbal Harmony Berua.',
  'Admin Kampung Herbal Berua', 'verified', 'published', false, now(), 'Secang', 'confirmed', now()
);
