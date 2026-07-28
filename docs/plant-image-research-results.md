# Hasil Riset Identitas dan Gambar Tanaman

Sprint ini menormalisasi batch awal tanaman poster Kampung Herbal Harmony secara
konservatif. Sumber taxonomy yang digunakan adalah GBIF Backbone Taxonomy melalui
species match accepted/exact; Wikimedia Commons hanya digunakan untuk kandidat
gambar, bukan sebagai satu-satunya sumber identitas.

## Ringkasan

- Total nama mentah poster: 89
- Identitas confirmed pada batch ini: 17 tanaman
- Identitas candidate: 0 tanaman
- Nama unresolved tersisa: 73 nama
- Nama disputed/ambigu yang ditahan: 12 nama
- Source entries mapped: 93 dari 206 entri
- Plants draft tersedia: 11 tanaman baru
- Wikimedia requests: 17
- Kandidat gambar approved: 15
- Kandidat unresolved: 2
- Kandidat rejected: 0
- Plant media attachments: 15

## Sumber Taxonomy

Setiap mapping menyimpan `taxonomy_source = "GBIF Backbone Taxonomy"` dan
`taxonomy_external_id` berupa key GBIF. Contoh sumber:

- Jahe, Zingiber officinale: https://www.gbif.org/species/2757280
- Kunyit, Curcuma longa: https://www.gbif.org/species/2757624
- Serai, Cymbopogon citratus: https://www.gbif.org/species/2705275
- Sambiloto, Andrographis paniculata: https://www.gbif.org/species/3173178
- Kelor, Moringa oleifera: https://www.gbif.org/species/3054181

## Keputusan Gambar

Gambar approved wajib memiliki:

- halaman sumber Wikimedia Commons;
- file download dari `upload.wikimedia.org`;
- lisensi whitelist;
- kreator atau atribusi;
- kecocokan nama ilmiah pada metadata/deskripsi;
- resolusi minimal sesuai guard script;
- tidak terindikasi kemasan produk, watermark, kolase, atau fokus manusia.

Dua tanaman belum mendapat gambar approved otomatis:

- Temulawak: kandidat tidak memiliki lisensi whitelist yang cukup jelas.
- Kunyit: kandidat terbaik otomatis berupa foto bubuk, sehingga tidak cocok
  sebagai cover botani.

## Nama Ambigu

Nama berikut tetap tidak dipaksa menjadi master plant atau image attachment tanpa
bukti konteks tambahan: Cincau, Garcinia, Eucalyptus, Brahmi, Miswak, Willow
Bark, Neem, Daun Jambu, Salam, Kunyit Putih, Temu Putih, Rosmary, dan Merigold.

Tidak ada klaim manfaat medis, dosis, klaim penyembuhan, klaim kanker, klaim
gula darah, atau klaim detoks yang dibuat pada record tanaman baru. Record baru
tetap `draft` dan `validation_status = data_demonstrasi`.
