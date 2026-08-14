export type PeduliZoneId = "anak" | "dewasa" | "rentan";

export type PeduliCharacteristic = {
  title: string;
  items?: string[];
  paragraphs?: string[];
};

export type PeduliGuidance = {
  id: string;
  slug: string;
  zoneId: PeduliZoneId;
  title: string;
  englishTitle: string;
  ageRange?: string;
  sourcePages: number[];
  characteristics: PeduliCharacteristic[];
  mainNeeds: string[];
  avoidances: string[];
  generalApproach: string[];
  recommendedInterventions: string[];
};

export type PeduliZone = {
  id: PeduliZoneId;
  title: string;
  description: string;
  guidanceSlugs: string[];
};

export const peduliSource = {
  title: "Buku Saku PEDULI",
  subtitle: "Pemetaan Lingkungan Berbasis Profil Lingkungan Masyarakat",
  program: "KKN Prestasi Universitas Hasanuddin Gel. 116",
  location: "Kel. Berua, Kec. Biringkanaya, Kota Makassar",
  author: {
    label: "Penyusun",
    name: "Malika Az Zahra Bahtiar",
    studyProgram: "Psikologi, 2023",
  },
  supervisor: {
    label: "DPK",
    name: "Prof. Dr. Ir. Suhasman, S.Hut., M.Si.",
  },
} as const;

export const peduliPreface =
  "Buku saku ini disusun sebagai panduan praktis guna mengenali karakteristik perkembangan psikologis pada setiap kelompok usia dan kelompok rentan. Informasi yang disajikan bertujuan sebagai gambaran kebutuhan dan rekomendasi intervensi yang sesuai.";

export const peduliIntroduction =
  "Warga Kampung Herbal merupakan bagian dari komunitas yang memiliki karakteristik, kebutuhan, dan tantangan yang beragam pada setiap tahap kehidupan. Keberagaman tersebut mencakup perbedaan usia, kondisi sosial, perkembangan psikologis, serta keberadaan kelompok yang membutuhkan perhatian dan dukungan khusus, seperti anak-anak, remaja, orang dewasa, lansia, penyandang disabilitas, individu dengan kondisi kesehatan mental, ibu hamil dan pascapersalinan, dan sebagainya. Oleh karena itu, pemahaman terhadap karakteristik dan kebutuhan setiap kelompok menjadi penting agar upaya pengembangan kesejahteraan warga dapat dilakukan secara tepat sasaran dan sesuai dengan kondisi komunitas. Program PEDULI hadir sebagai panduan informasi yang membantu mengenali karakteristik psikologis dan kebutuhan masing-masing kelompok warga, sekaligus memberikan rekomendasi pendekatan atau intervensi yang relevan. Dengan adanya panduan ini, diharapkan warga dan pihak terkait dapat memiliki dasar yang lebih sistematis dalam membangun lingkungan Kampung Herbal yang inklusif, suportif, dan responsif terhadap kebutuhan psikologis warganya.";

export const peduliDisclaimer =
  "PEDULI adalah panduan edukatif dan bukan pengganti asesmen, diagnosis, atau layanan profesional.";

export const peduliZones: PeduliZone[] = [
  {
    id: "anak",
    title: "Zona Anak",
    description: "Bayi, anak usia dini, prasekolah, anak usia pertengahan, dan remaja.",
    guidanceSlugs: [
      "infancy",
      "early-childhood",
      "preschool",
      "school-age",
      "adolescence",
    ],
  },
  {
    id: "dewasa",
    title: "Zona Dewasa",
    description: "Dewasa awal, dewasa pertengahan, dan dewasa akhir.",
    guidanceSlugs: ["early-adulthood", "middle-adulthood", "late-adulthood"],
  },
  {
    id: "rentan",
    title: "Zona Rentan",
    description:
      "Ibu hamil pada masa kehamilan dan pascapersalinan, penyandang disabilitas, individu dengan kondisi kesehatan mental, serta individu dengan kondisi atau penyakit kronis.",
    guidanceSlugs: [
      "pregnant-women",
      "persons-with-disabilities",
      "mental-health-conditions",
      "chronic-conditions",
    ],
  },
];

export const peduliGuidance: PeduliGuidance[] = [
  {
    id: "peduli-infancy",
    slug: "infancy",
    zoneId: "anak",
    title: "Bayi",
    englishTitle: "Infancy",
    ageRange: "0 - 18 bulan",
    sourcePages: [6, 7, 8, 9],
    characteristics: [
      {
        title: "Fisik",
        items: [
          "Periode pertumbuhan tercepat.",
          "Otak tumbuh lebih cepat dari organ lain.",
          "Refleks bawaan berangsur digantikan gerakan yang disengaja.",
          "Perkembangan motorik kasar berurutan mulai dari mengangkat kepala, tengkurap, hingga mulai berdiri dan berjalan.",
          "Morotik halus diawali dari aksi meraih dan menggenggam yang semakin akurat dan terkoordinasi.",
        ],
      },
      {
        title: "Kognitif",
        items: [
          "Tahap sensori motor diawali melalui indra dan gerakan tubuh.",
          "Object permanence atau pemahaman bahwa benda tetap ada walau tidak terlihat mulai berkembang.",
          "Kapasitas belajar melalui pengkondisian, habituasi, dan imitasi dasar sudah ada sejak lahir.",
          "Perkembangan bahasa pralinguistik seperti babbling dan memahami kata umum walau belum bisa diucapkan.",
        ],
      },
      {
        title: "Emosional",
        items: [
          "Emosi dasar seperti senang, terkejut, tertarik, sedih, mulai muncul secara bertahap dan makin terorganisasi sebagai sinyal yang jelas.",
          "Senyum sosial muncul sekitar usia 6-10 minggu, sementara tawa muncul sekitar 3-4 bulan.",
          "Kecemasan terhadap orang asing (stranger anxiety) dan perpisahan (separation anxiety) mulai muncul di paruh kedua tahun pertama sebagai tanda kelekatan yang terbentuk.",
          "Regulasi emosi masih sangat bergantung pada bantuan pengasuh (co-regulation).",
        ],
      },
      {
        title: "Sosial",
        items: [
          "Pembentukan kelekatan atau attachment dengan pengasuh utama.",
          "Social referencing atau melihat ekspresi pengasuh untuk memaknai situasi mulai muncul menjelang akhir tahun pertama.",
          "Kualitas pengasuhan yang hangat, sensitif, dan responsif menentukan resolusi positif konflik psikososial trust vs mistrust.",
        ],
      },
    ],
    mainNeeds: [
      "Rasa aman fisik dan emosional yang konsisten.",
      "Pengasuhan stabil dari figur lekat utama (contoh, ibu).",
      "Stimulasi sensorik dan sosial yang cukup dan sesuai.",
      "Nutrisi memadai (diawali dengan ASI atau susu formula, kemudian dilanjutkan MPASI sesuai usia).",
      "Kesempatan membangun kelekatan yang aman (secure attachment).",
    ],
    avoidances: [
      "Pengasuhan yang tidak konsisten maupun pergantian pengasuh utama.",
      "Mengabaikan sinyal distres (seperti tangisan) dengan alasan kemandirian.",
      "Kekerasan fisik, guncangan (shaken baby syndrome), atau penelantaran dalam bentuk apapun.",
      "Stimulasi berlebihan (over-stimulation) maupun stimulasi yang terlalu minim.",
      "Memisahkan bayi dari pengasuh utama untuk waktu lama tanpa figur pengganti.",
    ],
    generalApproach: [
      "Bersikap responsif dan konsisten terhadap sinyal/isyarat bayi (tangisan, ocehan, dst).",
      "Berikan kontak fisik yang hangat, seperti pelukan atau tatapan muka secara rutin.",
      "Bangun rutinitas yang teratur agar bayi merasa aman.",
      "Ajak bayi berkomunikasi untuk membangun ikatan.",
      "Hormati ritme dan temperamen individual bayi.",
    ],
    recommendedInterventions: [
      "Psikoedukasi parenting mengenai responsive caregiving, pentingnya kontak skin-to-skin, dst.",
      "Program dukungan keluarga berisiko tinggi (mis. model home-visiting/dukungan sosial bagi ibu dengan stres tinggi) untuk mencegah pengasuhan yang tidak sensitif.",
      "Skrining perkembangan rutin pasa aspek motorik, sensorik, dan sosio-emosional.",
      "Deteksi dini tanda gangguan kelekatan dan rujukan ke tenaga profesional.",
      "Edukasi kesehatan mental ibu pascamelahirkan guna menjaga kualitas interaksi dengan bayi.",
    ],
  },
  {
    id: "peduli-early-childhood",
    slug: "early-childhood",
    zoneId: "anak",
    title: "Anak Usia Dini",
    englishTitle: "Early Childhood",
    ageRange: "18 bulan - 3 tahun",
    sourcePages: [10, 11, 12, 13],
    characteristics: [
      {
        title: "Fisik",
        items: [
          "Laju pertumbuhan tinggi/berat melambat dibanding tahun pertama, namun tetap signifikan.",
          "Kemampuan berjalan mandiri berkembang menjadi berlari, memanjat, dan menendang.",
          "Motorik halus berkembang, seperti mulai makan dan berpakaian dengan bantuan minimal.",
          "Kesiapan neurologis untuk toilet training biasanya mulai muncul.",
        ],
      },
      {
        title: "Kognitif",
        items: [
          "Transisi dari tahap sensorimotor menuju tahap praoperasional.",
          "Permainan pura-pura (make-believe play) sederhana mulai muncul.",
          "Ledakan kosakata (vocabulary spurt) dan munculnya ucapan dua kata (telegraphic speech, mis. 'mau susu').",
          "Object permanence sudah matang, termasuk memahami perpindahan benda yang tidak terlihat langsung (invisible displacement).",
        ],
      },
      {
        title: "Emosional",
        items: [
          "Kesadaran diri (self-awareness) berkembang pesat, seperti anak mulai mengenali dirinya di cermin/foto sekitar usia 18-24 bulan.",
          "Emosi self-conscious mulai muncul, seperti malu, bangga, rasa bersalah, iri, yang didorong oleh kesadaran diri dan arahan orang dewasa.",
          "Tantrum sering muncul sebagai ekspresi frustrasi akibat keterbatasan kemampuan regulasi emosi yang masih berkembang.",
          "Regulasi emosi mulai berkembang seiring pematangan korteks prefrontal dan dukungan pengasuh.",
        ],
      },
      {
        title: "Sosial",
        items: [
          "Negativisme khas ('tidak!', 'aku sendiri!') mencerminkan dorongan kuat untuk mandiri dan menentukan pilihan sendiri.",
          "Kepatuhan (compliance) terhadap permintaan sederhana mulai muncul sekitar 12-18 bulan, serta kemampuan menunda kepuasan (delay of gratification) berkembang antara usia 1,5-4 tahun.",
          "Mulai membedakan diri dan orang lain berdasarkan kategori sosial sederhana (categorical self).",
        ],
      },
    ],
    mainNeeds: [
      "Kesempatan mencoba dan gagal dalam lingkungan yang aman.",
      "Batasan yang konsisten namun tetap fleksibel dan penuh kasih.",
      "Validasi emosi tanpa harus selalu menuruti semua keinginan anak.",
      "Rutinitas dan struktur harian yang dapat diprediksi.",
    ],
    avoidances: [
      "Kontrol yang berlebihan (over-control) yang mematikan inisiatif, maupun pengasuhan yang terlalu permisif tanpa batas.",
      "Mempermalukan atau mengkritik keras saat anak gagal mencoba hal baru karena dapat memicu rasa malu dan ragu yang berlebihan.",
      "Menghukum keras atau memaksakan toilet training sebelum anak siap.",
      "Membandingkan anak dengan anak lain secara negatif.",
    ],
    generalApproach: [
      "Berikan pilihan terbatas dan wajar (misalnya baju yang dipakai) agar anak merasa memiliki kendali.",
      "Toleransi terhadap usaha mandiri walau hasilnya belum sempurna, beri waktu ekstra agar anak bisa 'melakukannya sendiri'.",
      "Tetapkan batasan yang jelas namun disampaikan dengan hangat, bukan terlalu mengontrol maupun tanpa batas.",
      "Jalani toilet training dengan sabar mengikuti kesiapan anak.",
      "Bantu anak memberi nama pada perasaannya untuk mendukung regulasi emosi.",
    ],
    recommendedInterventions: [
      "Pelatihan pola asuh positif (positive discipline) dan gaya asuh otoritatif bagi orang tua/pengasuh.",
      "Psikoedukasi bahwa tantrum adalah bagian normal dari perkembangan regulasi emosi, bukan 'kenakalan'.",
      "Pendekatan goodness-of-fit atau menyesuaikan gaya pengasuhan dengan temperamen anak (easy, difficult, atau slow-to-warm-up).",
      "Deteksi dini keterlambatan bahasa atau motorik untuk rujukan terapi wicara/okupasi bila diperlukan.",
      "Dukungan bagi pengasuh dalam manajemen perilaku sederhana (mis. pengalihan perhatian, konsistensi respons).",
    ],
  },
  {
    id: "peduli-preschool",
    slug: "preschool",
    zoneId: "anak",
    title: "Prasekolah",
    englishTitle: "Preschool",
    ageRange: "3 - 5 tahun",
    sourcePages: [14, 15, 16, 17],
    characteristics: [
      {
        title: "Fisik",
        items: [
          "Pertumbuhan tinggi dan berat melambat namun stabil, serta proporsi tubuh semakin menyerupai orang dewasa.",
          "Perkembangan motorik kasar pesat dengan koordinasi yang makin baik.",
          "Motorik halus meningkat pesat seperti berpakaian dan makan sendiri.",
          "Preferensi tangan (dominasi lateral) semakin menguat.",
        ],
      },
      {
        title: "Kognitif",
        items: [
          "Kemampuan berpikir simbolik berkembang pesat.",
          "Karakteristik pemikiran seperti egosentrisme, animisme, sentrasi mulai muncul.",
          "Anak mulai bahwa orang lain bisa memiliki keinginan, dan perasaan yang berbeda dari dirinya.",
          "Kosakata dan tata bahasa berkembang pesat, literasi awal (pengenalan huruf, cerita) mulai terbentuk.",
        ],
      },
      {
        title: "Emosional",
        items: [
          "Pemahaman emosi meningkat, seperti anak mulai mengenali penyebab dan konsekuensi emosi sederhana pada diri dan orang lain.",
          "Regulasi emosi berkembang lewat dukungan dan pemodelan orang tua.",
          "Empati dan simpati awal muncul, mendukung perilaku prososial sederhana.",
          "Ketakutan khas masa kecil (gelap, monster, suara keras) umum terjadi dan biasanya bersifat sementara.",
        ],
      },
      {
        title: "Sosial",
        items: [
          "Pertemanan pertama terbentuk melalui permainan bersama.",
          "Identifikasi dan pemahaman peran gender mulai terbentuk, dipengaruhi faktor biologis dan lingkungan (termasuk pemodelan orang tua dan media).",
          "Perkembangan moral awal dimana anak mulai memahami aturan sederhana tentang benar-salah, meski penalaran masih konkret dan berpusat pada konsekuensi.",
          "Gaya pengasuhan otoritatif (hangat namun tegas) secara konsisten berkaitan dengan hasil perkembangan sosial-emosional terbaik.",
        ],
      },
    ],
    mainNeeds: [
      "Kesempatan bermain bebas maupun bermain terstruktur yang berimbang.",
      "Interaksi rutin dengan teman sebaya.",
      "Lingkungan yang mendorong rasa ingin tahu tanpa kritik yang berlebihan.",
      "Pendidikan anak usia dini (PAUD) yang berkualitas dan sesuai tahap perkembangan (developmentally appropriate practice).",
    ],
    avoidances: [
      "Kritik, ancaman, dan hukuman berlebihan yang membentuk superego terlalu keras sehingga memicu rasa bersalah kronis.",
      "Screen time berlebihan yang menggantikan waktu bermain aktif dan interaksi sosial langsung.",
      "Membatasi eksplorasi dan inisiatif anak secara berlebihan (overprotective/helicopter parenting).",
      "Pengasuhan otoriter yang keras atau sebaliknya permisif tanpa batasan yang jelas.",
      "Mengabaikan tanda kekerasan/pelecehan pada anak.",
    ],
    generalApproach: [],
    recommendedInterventions: [],
  },
  {
    id: "peduli-school-age",
    slug: "school-age",
    zoneId: "anak",
    title: "Anak Usia Pertengahan",
    englishTitle: "School Age",
    ageRange: "5 - 12 tahun",
    sourcePages: [18, 19, 20],
    characteristics: [
      {
        title: "Fisik",
        items: [
          "Pertumbuhan berlangsung stabil dan relatif lambat dibanding periode sebelum dan sesudahnya.",
          "Koordinasi motorik kasar dan halus terus meningkat, mendukung partisipasi dalam olahraga terorganisir dan kegiatan fisik yang lebih kompleks.",
          "Masalah kesehatan umum periode ini meliputi risiko obesitas, gangguan penglihatan/pendengaran, dan cedera tidak disengaja.",
        ],
      },
      {
        title: "Kognitif",
        items: [
          "Anak mampu berpikir logis tentang objek dan peristiwa konkret, namun belum mampu berpikir abstrak sepenuhnya.",
          "Metakognisi semakin matang.",
          "Regulasi kognitif diri berkembang bertahap dengan bimbingan orang dewasa.",
          "Kemampuan bahasa makin kompleks seperti pragmatik percakapan, narasi, dan literasi (membaca-menulis).",
        ],
      },
      {
        title: "Emosional",
        items: [
          "Pemahaman emosi lebih kompleks, termasuk kemampuan mengenali emosi campuran (mixed emotions).",
          "Regulasi emosi makin matang, meski tetap membutuhkan dukungan dalam situasi menantang.",
          "Konsep diri bergeser dari ciri fisik/perilaku konkret ke sifat-sifat psikologis yang lebih abstrak.",
          "Harga diri (self-esteem) menjadi multidimensi (akademik, sosial, atletik, penampilan fisik) dan mulai rentan terhadap perbandingan sosial dengan teman sebaya.",
        ],
      },
      {
        title: "Sosial",
        items: [
          "Hubungan pertemanan menjadi lebih mendalam, selektif, dan berbasis kepercayaan serta dukungan emosional timbal balik.",
          "Kelompok sebaya menjadi konteks sosial yang semakin penting.",
          "Anak mulai memahami aturan, hak individu, dan konsep keadilan secara lebih fleksibel.",
          "Risiko dinamika bullying (baik sebagai pelaku, korban, maupun saksi) meningkat pada periode ini.",
          "Keterlibatan sekolah dan hubungan guru-murid berperan besar dalam membentuk rasa kompeten anak.",
        ],
      },
    ],
    mainNeeds: [
      "Pengalaman sukses yang nyata dan bermakna sesuai kapasitas anak.",
      "Pengakuan atas usaha dan pencapaian, bukan hanya perbandingan dengan orang lain.",
      "Persahabatan sebaya yang sehat dan suportif.",
      "Lingkungan sekolah dan rumah yang suportif serta konsisten.",
    ],
    avoidances: [
      "Perbandingan sosial berlebihan atau pelabelan negatif ('bodoh', 'malas', 'nakal').",
      "Menetapkan standar terlalu tinggi tanpa dukungan yang memadai, memicu kecemasan berlebihan.",
      "Membiarkan bullying terjadi tanpa intervensi dari orang dewasa.",
      "Mengabaikan tanda kesulitan belajar tanpa asesmen lebih lanjut.",
      "Terlalu menekankan kompetisi dan evaluasi publik yang dapat menurunkan harga diri anak dengan pencapaian rendah.",
    ],
    generalApproach: [],
    recommendedInterventions: [],
  },
  {
    id: "peduli-adolescence",
    slug: "adolescence",
    zoneId: "anak",
    title: "Remaja",
    englishTitle: "Adolescence",
    ageRange: "12 - 18 tahun",
    sourcePages: [21, 22, 23, 24],
    characteristics: [
      {
        title: "Fisik",
        items: [
          "Pubertas, lonjakan pertumbuhan (growth spurt), & pematangan seksual primer dan sekunder.",
          "Perkembangan otak berlanjut, pemangkasan sinaptik dan mielinisasi meningkatkan efisiensi kognitif.",
          "Kebutuhan nutrisi, tidur, dan pola aktivitas berubah signifikan dan risiko gangguan makan meningkat, terutama terkait tekanan sosial soal citra tubuh.",
        ],
      },
      {
        title: "Kognitif",
        items: [
          "Kemampuan berpikir abstrak, hipotetis-deduktif, dan penalaran proposisional berkembang.",
          "Kapasitas pengambilan keputusan meningkat namun belum sepenuhnya matang, terutama dalam situasi emosional atau bertekanan sosial (peer pressure).",
          "Pemikiran menjadi lebih idealis dan kritis terhadap otoritas serta institusi sosial.",
        ],
      },
      {
        title: "Emosional",
        items: [
          "Fluktuasi emosi (labilitas) yang terkait perubahan hormonal dan tuntutan sosial baru.",
          "Harga diri secara umum meningkat dari awal ke akhir remaja bagi sebagian besar remaja, meski dapat menurun sementara setelah transisi sekolah.",
          "Peningkatan kerentanan terhadap gejala depresi dan kecemasan, terutama pada remaja perempuan dan mereka yang mengalami pubertas di luar waktu normatif (terlalu dini/terlambat).",
        ],
      },
      {
        title: "Sosial",
        items: [
          "Pencarian dan pembentukan identitas (vokasional, nilai, ideologi, seksual) menjadi tugas psikososial utama.",
          "Hubungan dengan orang tua bergeser ke arah otonomi yang lebih besar, namun kelekatan yang aman dengan orang tua tetap menjadi fondasi penting penyesuaian remaja.",
          "Kelompok sebaya (clique, crowd) dan relasi berpacaran mulai berperan besar dalam kehidupan sosial.",
          "Peningkatan risiko perilaku berisiko, seperti penyalahgunaan zat, perilaku seksual berisiko, dan kenakalan.",
        ],
      },
    ],
    mainNeeds: [
      "Ruang aman untuk eksplorasi identitas tanpa penghakiman.",
      "Dukungan otonomi dari orang tua (autonomy-supportive parenting) sekaligus kelekatan yang tetap terjaga.",
      "Penerimaan dan relasi sebaya yang sehat.",
      "Akses pendidikan kesehatan reproduksi dan kesehatan mental yang akurat dan sesuai usia.",
    ],
    avoidances: [
      "Memaksakan pilihan hidup/identitas tanpa memberi ruang eksplorasi (memicu identity foreclosure paksa).",
      "Kontrol berlebihan (over-controlling) di satu sisi, atau pengabaian/permisivitas total di sisi lain.",
      "Meremehkan atau mengejek pergolakan emosi maupun pencarian jati diri remaja.",
      "Stigmatisasi terhadap identitas seksual/gender yang sedang dieksplorasi remaja.",
      "Tekanan berlebihan terkait prestasi akademik/pilihan karier tanpa mempertimbangkan minat dan kesiapan remaja.",
    ],
    generalApproach: [
      "Sediakan ruang eksplorasi identitas (minat, nilai, pilihan karier) yang aman dan tidak menghakimi.",
      "Pertahankan komunikasi terbuka sambil memberi otonomi secara bertahap.",
      "Terapkan pemantauan (parental monitoring) yang suportif.",
      "Libatkan remaja dalam pengambilan keputusan keluarga sesuai kapasitasnya untuk memupuk rasa tanggung jawab.",
      "Validasi pergolakan emosi remaja tanpa meremehkannya sebagai 'lebay' atau 'fase yang akan hilang sendiri'.",
    ],
    recommendedInterventions: [
      "Layanan bimbingan konseling karier dan identitas di sekolah.",
      "Program pencegahan penyalahgunaan zat dan perilaku berisiko berbasis keluarga dan sekolah.",
      "Skrining kesehatan mental remaja (depresi, kecemasan, ide bunuh diri) dengan jalur rujukan yang jelas ke tenaga profesional.",
      "Pendidikan kesehatan reproduksi dan pencegahan kehamilan remaja yang komprehensif dan berbasis bukti.",
      "Pelatihan bagi orang tua remaja mengenai komunikasi efektif dan pemantauan positif (positive parental monitoring).",
    ],
  },
  {
    id: "peduli-early-adulthood",
    slug: "early-adulthood",
    zoneId: "dewasa",
    title: "Dewasa Awal",
    englishTitle: "Early Adulthood",
    ageRange: "19 - 40 tahun",
    sourcePages: [26, 27, 28, 29],
    characteristics: [
      {
        title: "Fisik",
        items: [
          "Kapasitas fisik (kekuatan otot, kesuburan, fungsi imun, performa atletik) mencapai puncaknya di awal 20-an dan mulai menurun bertahap (senescence/proses penuaan biologis) sejak akhir 20-an hingga 30-an.",
          "Gaya hidup (nutrisi, olahraga, konsumsi zat) pada periode ini berdampak besar terhadap lintasan kesehatan jangka panjang.",
        ],
      },
      {
        title: "Kognitif",
        items: [
          "Berkembangnya kemampuan berpikir relativistik, pragmatis, dan mentoleransi ambiguitas/kontradiksi.",
          "Perkembangan keahlian (expertise) di bidang pekerjaan/studi yang ditekuni, disertai peningkatan kompleksitas kognitif-afektif dalam menghadapi masalah kehidupan nyata.",
          "Kognisi epistemik berkembang.",
        ],
      },
      {
        title: "Emosional",
        items: [
          "Ditandai eksplorasi berkelanjutan dan ketidakpastian peran dewasa, terutama di kalangan yang memiliki akses pendidikan lanjutan.",
          "Rasa kendali pribadi (personal control) atas hidup meningkat dan sering mencapai puncaknya di dekade ini.",
          "Regulasi emosi umumnya makin matang dibanding masa remaja.",
        ],
      },
      {
        title: "Sosial",
        items: [
          "Pembentukan hubungan intim/romantis jangka panjang menjadi tugas psikososial inti.",
          "Variasi gaya hidup dewasa meningkat, seperti lajang, kohabitasi, menikah, atau kombinasi lain.",
          "Transisi karier dan pengembangan profesional menjadi fokus utama.",
          "Bagi banyak orang, periode ini juga mencakup transisi menjadi orang tua dan membentuk unit keluarga baru yang terpisah dari keluarga asal.",
        ],
      },
    ],
    mainNeeds: [
      "Hubungan yang saling percaya dan suportif, baik pasangan, sahabat, maupun kolega.",
      "Stabilitas dan kejelasan arah karier/pekerjaan.",
      "Rasa kompetensi dan kontribusi yang nyata.",
      "Dukungan sosial dalam menghadapi transisi peran besar (menikah, menjadi orang tua, pindah kota/karier).",
    ],
    avoidances: [
      "Isolasi sosial berkepanjangan atau beban kerja berlebihan yang mengorbankan hubungan personal.",
      "Tekanan sosial berlebihan terkait 'jadwal sosial' (social clock) tanpa mempertimbangkan variasi dan konteks individu.",
      "Mengabaikan tanda kelelahan/stres terkait tekanan peran ganda (karier dan keluarga).",
      "Menstigma pilihan hidup yang berbeda dari norma mayoritas (lajang, menikah terlambat, tidak memiliki anak).",
    ],
    generalApproach: [
      "Dukung keseimbangan kerja-kehidupan (work-life balance), terutama bagi individu yang baru membangun keluarga atau menjalani transisi peran.",
      "Fasilitasi jalur pengembangan karier yang jelas sebagai bentuk aktualisasi identitas dan kompetensi.",
      "Bangun budaya relasi kolegial yang sehat dan suportif di lingkungan kerja/organisasi.",
      "Hormati variasi jalur hidup (lajang, menikah, memiliki anak atau tidak) tanpa menghakimi berdasarkan norma sosial 'jadwal usia' yang kaku.",
    ],
    recommendedInterventions: [
      "Konseling pranikah dan konseling pasangan untuk membangun fondasi relasi yang sehat.",
      "Program dukungan karyawan (Employee Assistance Program) untuk manajemen stres kerja dan keseimbangan hidup.",
      "Kelas persiapan menjadi orang tua (parenting baru) untuk mendukung transisi peran.",
      "Kelompok dukungan sosial bagi dewasa muda yang mengalami tekanan sosial terkait status lajang/childless.",
      "Program pengembangan karier dan mentoring di tempat kerja untuk mendukung konsolidasi identitas profesional.",
    ],
  },
  {
    id: "peduli-middle-adulthood",
    slug: "middle-adulthood",
    zoneId: "dewasa",
    title: "Dewasa Pertengahan",
    englishTitle: "Middle Adulthood",
    ageRange: "40 - 65 tahun",
    sourcePages: [30, 31, 32, 33],
    characteristics: [
      {
        title: "Fisik",
        items: [
          "Perubahan terkait penuaan mulai lebih terasa presbiopia, presbikusis, penurunan elastisitas kulit, penurunan massa otot, dan kepadatan tulang.",
          "Perempuan mengalami klimakterik yang berpuncak pada menopause dan laki-laki mengalami penurunan bertahap kapasitas reproduksi tanpa titik akhir yang jelas.",
          "Risiko penyakit kronis.",
        ],
      },
      {
        title: "Kognitif",
        items: [
          "Pengetahuan dan keterampilan verbal terakumulasi cenderung stabil atau meningkat, sementara kecepatan pemrosesan dan penalaran abstrak baru) mulai menurun bertahap.",
          "Keahlian (expertise) praktis dan kemampuan memecahkan masalah dunia nyata seringkali mencapai puncaknya.",
          "Kreativitas dapat tetap tinggi.",
        ],
      },
      {
        title: "Emosional",
        items: [
          "Stabilitas kepribadian relatif tinggi dibanding periode kehidupan lain.",
          "Pergolakan emosional signifikan lebih terkait peristiwa hidup negatif tertentu daripada usia semata.",
          "Kepuasan hidup dan kesejahteraan psikologis umumnya tetap tinggi, dengan refleksi aktif terhadap makna dan tujuan hidup.",
        ],
      },
      {
        title: "Sosial",
        items: [
          "Puncak generativitas: dorongan kuat untuk membimbing dan berkontribusi pada generasi berikutnya melalui peran sebagai orang tua, mentor, atasan, atau kontributor komunitas.",
          "Hubungan pernikahan/pasangan umumnya makin stabil; sebagian mengalami transisi menjadi kakek/nenek.",
          "Perencanaan transisi karier atau pensiun mulai menjadi pertimbangan aktif.",
        ],
      },
    ],
    mainNeeds: [
      "Kesempatan berkontribusi dan bermakna melalui pekerjaan, mentoring, atau kegiatan komunitas.",
      "Pengelolaan stres dan kesehatan fisik yang proaktif (skrining rutin, gaya hidup sehat).",
      "Dukungan sosial dalam menjalankan peran generasi sandwich.",
      "Pengakuan atas kontribusi, pengalaman, dan keahlian yang telah dibangun selama bertahun-tahun.",
    ],
    avoidances: [
      "Mengabaikan tanda peringatan kesehatan.",
      "Meremehkan transisi karier/pensiun sebagai isu yang tidak memerlukan dukungan psikologis.",
      "Membiarkan beban perawatan (caregiving) menumpuk tanpa dukungan, yang berisiko menimbulkan kelelahan pengasuh (caregiver burnout).",
      "Menstigma perempuan terkait menopause sebagai bentuk 'kelemahan' atau isu tabu.",
      "Membiarkan diri terjebak pada keasyikan diri sendiri tanpa keterlibatan terhadap orang lain atau generasi berikutnya.",
    ],
    generalApproach: [
      "Fasilitasi dan hargai peran mentoring di tempat kerja, keluarga, maupun komunitas.",
      "Dukung transisi karier (perubahan bidang kerja, kembali menempuh pendidikan) sebagai hal yang wajar dan positif, bukan tanda kegagalan.",
      "Perhatikan beban ganda generasi sandwich dan berikan fleksibilitas (misalnya pengaturan kerja yang lebih adaptif).",
      "Dorong refleksi bermakna terhadap kontribusi dan warisan (legacy) yang ingin ditinggalkan, sebagai bagian alami perkembangan, bukan sesuatu yang perlu dihindari.",
    ],
    recommendedInterventions: [
      "Program manajemen stres dan kesehatan preventif di tempat kerja atau layanan kesehatan primer.",
      "Kelompok dukungan bagi pengasuh keluarga (caregiver support group) untuk mencegah burnout.",
      "Perencanaan pensiun dan transisi karier yang terstruktur, mencakup aspek finansial maupun psikologis.",
      "Program mentoring lintas generasi di organisasi untuk menyalurkan generativitas secara produktif.",
      "Konseling terkait makna hidup (purpose) dan penyesuaian psikologis bagi mereka yang mengalami pergolakan pertengahan hidup.",
    ],
  },
  {
    id: "peduli-late-adulthood",
    slug: "late-adulthood",
    zoneId: "dewasa",
    title: "Dewasa Akhir",
    englishTitle: "Late Adulthood",
    ageRange: ">65 tahun - wafat",
    sourcePages: [34, 35, 36, 37],
    characteristics: [
      {
        title: "Fisik",
        items: [
          "Penurunan bertahap fungsi sistem saraf dan sensorik.",
          "Risiko penyakit kronis dan disabilitas meningkat, namun dengan gaya hidup dan dukungan yang tepat, sebagian besar lansia tetap dapat menjalankan aktivitas hidup sehari-hari secara mandiri.",
          "Perubahan pola tidur dan penurunan mobilitas fisik umum terjadi.",
        ],
      },
      {
        title: "Kognitif",
        items: [
          "Penurunan kecepatan pemrosesan informasi dan kapasitas memori kerja.",
          "Risiko gangguan kognitif seperti demensia (termasuk Alzheimer) meningkat seiring usia, namun ini bukan bagian normal dari penuaan itu sendiri.",
          "Pengetahuan pragmatis mendalam tentang makna dan tuntunan hidup berpotensi terus berkembang pada usia ini.",
        ],
      },
      {
        title: "Emosional",
        items: [
          "Terdapat kecenderungan untuk lebih memperhatikan dan mengingat informasi positif dibanding negatif.",
          "Regulasi emosi pada umumnya tetap baik atau bahkan membaik dibanding usia dewasa yang lebih muda.",
          "Risiko depresi meningkat terkait pengalaman kehilangan berulang (pasangan, teman, peran sosial, kemandirian) dan masalah kesehatan, meski depresi bukan bagian normal dari penuaan.",
        ],
      },
      {
        title: "Sosial",
        items: [
          "Penyempitan jaringan sosial yang bersifat selektif (socioemotional selectivity).",
          "Transisi pensiun membawa perubahan besar dalam struktur waktu, identitas, dan relasi sosial.",
          "Kemungkinan menjadi janda/duda meningkat, dengan proses berduka (bereavement) yang perlu mendapat perhatian.",
          "Risiko kesepian dan penelantaran/kekerasan pada lansia (elder maltreatment) perlu diwaspadai.",
        ],
      },
    ],
    mainNeeds: [
      "Rasa bermakna dan penghargaan atas hidup yang telah dijalani.",
      "Kemandirian yang dihormati dan didukung, bukan diambil alih.",
      "Dukungan sosial yang konsisten untuk mencegah kesepian dan isolasi.",
      "Akses terhadap layanan kesehatan yang layak serta manajemen penyakit kronis yang berkelanjutan.",
    ],
    avoidances: [
      "Infantilisasi atau mengambil alih keputusan tanpa melibatkan lansia yang bersangkutan.",
      "Membiarkan isolasi sosial dan pengabaian (neglect) terjadi tanpa intervensi.",
      "Stereotip negatif tentang penuaan (ageism) yang meremehkan kapasitas dan kontribusi lansia.",
      "Mengabaikan tanda depresi atau keputusasaan dengan menganggapnya 'wajar karena sudah tua'.",
      "Mengabaikan risiko elder maltreatment (kekerasan fisik, finansial, atau emosional terhadap lansia).",
    ],
    generalApproach: [
      "Fasilitasi proses reminiscence/life review secara positif, bukan sekadar nostalgia, melainkan refleksi bermakna atas perjalanan hidup, termasuk penerimaan atas penyesalan yang ada.",
      "Dukung lansia untuk tetap aktif secara fisik, sosial, dan kognitif, dan menyesuaikan strategi dengan keterbatasan yang muncul.",
      "Hormati otonomi dan pengambilan keputusan lansia dan hindari infantilisasi.",
      "Fasilitasi hubungan yang bermakna dengan keluarga, teman lama, dan komunitas, sesuai preferensi selektif lansia terhadap relasi emosional yang berkualitas.",
    ],
    recommendedInterventions: [
      "Terapi reminiscence/life review untuk mendukung resolusi positif atas perjalanan hidup.",
      "Program lansia aktif, seperti kegiatan fisik, sosial, dan sukarela (seperti program lintas generasi) yang mendukung keterlibatan berkelanjutan.",
      "Dukungan terstruktur bagi pengasuh keluarga lansia dengan demensia atau kondisi kronis lain.",
      "Program dukungan duka (bereavement support) bagi lansia yang menjadi janda/duda.",
      "Perencanaan lingkungan yang ramah lansia (aging in place) serta akses terhadap pilihan tempat tinggal yang sesuai kebutuhan.",
    ],
  },
  {
    id: "peduli-pregnant-women",
    slug: "pregnant-women",
    zoneId: "rentan",
    title: "Ibu Hamil pada Masa Kehamilan dan Pascapersalinan",
    englishTitle: "Pregnant Women",
    sourcePages: [39, 40, 41],
    characteristics: [
      {
        title: "Karakteristik Utama",
        paragraphs: [
          "Masa kehamilan hingga pascapersalinan ditandai oleh perubahan fisik, hormonal, psikologis, dan sosial yang besar, termasuk pemulihan tubuh serta penyesuaian terhadap peran sebagai orang tua. Perubahan tersebut dapat disertai fluktuasi emosi, mulai dari baby blues yang umumnya bersifat sementara hingga depresi dan, pada kasus yang jarang, psikosis pascapersalinan. Penurunan kualitas tidur, perubahan identitas, serta tuntutan pengasuhan dapat meningkatkan stres dan memengaruhi fungsi sehari-hari, sementara proses bonding dengan bayi berkembang secara bertahap dan tidak selalu terjadi secara instan. Pada masa ini, kebutuhan akan dukungan sosial dari pasangan, keluarga, dan tenaga kesehatan meningkat, dan pasangan/ayah juga dapat mengalami tantangan psikologis dalam menyesuaikan diri. Kesulitan penyesuaian lebih mungkin terjadi pada individu dengan riwayat gangguan mood atau kecemasan, kehamilan tidak direncanakan, komplikasi kehamilan atau persalinan, dukungan sosial yang rendah, maupun tekanan ekonomi.",
        ],
      },
    ],
    mainNeeds: [
      "Pemulihan fisik yang cukup meliputi istirahat, nutrisi, dan perawatan pascapersalinan yang memadai.",
      "Dukungan emosional yang konsisten dari pasangan dan keluarga.",
      "Informasi akurat mengenai perawatan bayi serta perubahan tubuh dan emosi yang dialami.",
      "Akses terhadap skrining dan layanan kesehatan mental perinatal.",
      "Waktu dan ruang untuk beradaptasi tanpa tekanan berlebihan untuk selalu tampak bahagia atau kompeten seketika.",
    ],
    avoidances: [
      "Meremehkan atau mengabaikan keluhan emosional ibu tanpa menilai tingkat keparahannya.",
      "Membebankan ekspektasi yang tidak realistis bahwa ibu harus selalu bahagia dan kompeten sejak awal.",
      "Membiarkan ibu pascapersalinan mengalami isolasi sosial.",
      "Menyalahkan ibu atas kesulitan bonding dengan bayi atau kesulitan menyusui.",
      "Mengabaikan tanda bahaya (pikiran menyakiti diri sendiri/bayi, gejala psikotik seperti halusinasi/delusi) dengan menganggapnya sekadar 'baby blues biasa'.",
    ],
    generalApproach: [
      "Normalisasikan fluktuasi emosi pascapersalinan sebagai hal yang umum, tanpa meremehkan gejala yang lebih berat dan menetap.",
      "Libatkan pasangan dan keluarga besar secara aktif dalam pengasuhan bayi maupun proses pemulihan ibu.",
      "Sediakan informasi yang jelas mengenai perbedaan antara baby blues dan depresi pascapersalinan agar dapat dikenali lebih dini oleh ibu maupun keluarga.",
      "Dukung ibu untuk tetap terhubung dengan sistem dukungan di luar rumah tangga inti (keluarga besar, komunitas, layanan kesehatan).",
    ],
    recommendedInterventions: [
      "Skrining rutin depresi dan kecemasan perinatal pada setiap kunjungan pascapersalinan.",
      "Rujukan ke psikolog maupun psikiater untuk kasus kondisi depresi.",
      "Fasilitasi kelompok dukungan sesama ibu baru (peer support group).",
      "Edukasi dan pelibatan aktif pasangan serta keluarga besar dalam program persiapan dan pendampingan pascapersalinan.",
      "Penanganan segera (kegawatdaruratan) untuk tanda psikosis pascapersalinan atau ide bunuh diri/menyakiti bayi.",
    ],
  },
  {
    id: "peduli-persons-with-disabilities",
    slug: "persons-with-disabilities",
    zoneId: "rentan",
    title: "Penyandang Disabilitas",
    englishTitle: "Persons with Disabilities",
    sourcePages: [42, 43, 44],
    characteristics: [
      {
        title: "Karakteristik Utama",
        paragraphs: [
          "Penyandang disabilitas merupakan kelompok yang sangat heterogen, mencakup disabilitas fisik, sensorik, intelektual, dan psikososial dengan tingkat keparahan serta dampak fungsional yang beragam. Pengalaman disabilitas tidak hanya dipengaruhi oleh kondisi individu, tetapi juga oleh lingkungan fisik, sosial, dan sikap masyarakat yang dapat mendukung maupun menghambat partisipasi. Kelompok ini rentan mengalami stigma, diskriminasi, dan ableism yang dapat meningkatkan risiko masalah kesehatan mental sekunder seperti depresi, kecemasan, dan harga diri rendah, terutama akibat eksklusi sosial dan hambatan akses. Kebutuhan akomodasi sangat bervariasi dan perlu disesuaikan dengan kondisi individu, baik dalam bentuk aksesibilitas fisik, komunikasi, maupun teknologi bantu. Dengan dukungan dan akomodasi yang tepat, banyak penyandang disabilitas mampu menunjukkan ketahanan dan kompetensi yang kuat, meskipun sistem pendidikan, kesehatan, dan ketenagakerjaan yang belum inklusif masih dapat menjadi sumber tantangan tambahan.",
        ],
      },
    ],
    mainNeeds: [
      "Aksesibilitas fisik dan aksesibilitas informasi yang memadai.",
      "Akomodasi yang wajar (reasonable accommodation) sesuai kebutuhan spesifik individu.",
      "Penerimaan sosial dan kesempatan berpartisipasi yang setara dalam pendidikan, pekerjaan, dan kehidupan sosial.",
      "Layanan kesehatan (termasuk kesehatan mental) yang dapat diakses dan responsif terhadap kebutuhan terkait disabilitas.",
      "Otonomi dan penghormatan terhadap pengambilan keputusan pribadi.",
    ],
    avoidances: [
      "Sikap meremehkan atau mengasihani secara berlebihan (pity), maupun asumsi ketidakmampuan (paternalisme).",
      "Bahasa atau perlakuan yang dehumanisasi, misalnya berbicara kepada pendamping alih-alih kepada individu yang bersangkutan.",
      "Mengabaikan permintaan akomodasi dengan alasan 'merepotkan' atau 'tidak biasa'.",
      "Membuat keputusan atas nama individu tanpa melibatkannya secara langsung.",
      "Mengasumsikan seluruh penyandang disabilitas memiliki kebutuhan atau pengalaman yang sama.",
    ],
    generalApproach: [
      "Gunakan pendekatan berbasis kekuatan (strength-based), bukan berbasis defisit semata.",
      "Ikuti preferensi bahasa individu terkait dirinya (person-first atau identity-first language), tanyakan, jangan mengasumsikan.",
      "Libatkan individu secara aktif dalam pengambilan keputusan terkait dirinya sendiri.",
      "Fokus pada penyesuaian lingkungan dan penyediaan akomodasi, bukan semata upaya 'memperbaiki' individu.",
      "Hindari asumsi kebutuhan berdasarkan jenis/kategori disabilitas semata, tanyakan langsung kepada individu yang bersangkutan.",
    ],
    recommendedInterventions: [
      "Asesmen kebutuhan individual serta penyediaan alat bantu/teknologi asistif yang sesuai.",
      "Layanan rehabilitasi yang berpusat pada individu (person-centered rehabilitation).",
      "Pelatihan kesadaran disabilitas bagi lingkungan kerja, pendidikan, atau layanan publik.",
      "Dukungan psikologis untuk membantu individu menghadapi dampak stigma dan diskriminasi.",
      "Advokasi kebijakan inklusif (aksesibilitas fisik, kuota kerja, pendidikan inklusif) pada tingkat institusi/organisasi.",
      "Fasilitasi kelompok dukungan sebaya (peer support) sesama penyandang disabilitas.",
    ],
  },
  {
    id: "peduli-mental-health-conditions",
    slug: "mental-health-conditions",
    zoneId: "rentan",
    title: "Individu dengan Kondisi Kesehatan Mental",
    englishTitle: "Mental Health Conditions",
    sourcePages: [45, 46, 47],
    characteristics: [
      {
        title: "Karakteristik Utama",
        paragraphs: [
          "Kelompok dengan kondisi kesehatan mental sangat beragam, mencakup gangguan mood, kecemasan, psikotik, hingga kondisi terkait trauma, dengan tingkat keparahan, kronisitas, dan dampak fungsional yang berbeda antarindividu. Kondisi dapat bersifat episodik maupun kronis, sehingga individu dapat mengalami periode fungsi yang baik yang diselingi episode dengan gejala lebih berat. Stigma dan diskriminasi sosial maupun struktural sering menjadi beban tambahan yang dapat mendorong penyembunyian gejala serta menunda pencarian bantuan. Kualitas hidup sangat dipengaruhi oleh akses terhadap layanan kesehatan mental, dukungan sosial, dan lingkungan yang suportif, sementara komorbiditas dengan kondisi fisik maupun kesehatan mental lainnya juga cukup umum. Dalam perspektif recovery-oriented, pemulihan bersifat personal dan tidak selalu berarti bebas dari gejala, melainkan kemampuan individu untuk menjalani kehidupan yang bermakna sesuai dengan tujuan dan kapasitasnya.",
        ],
      },
    ],
    mainNeeds: [
      "Akses terhadap layanan kesehatan mental yang berkualitas dan terjangkau.",
      "Dukungan sosial yang tidak menghakimi dari keluarga, teman, dan komunitas.",
      "Stabilitas hidup (tempat tinggal, pekerjaan, rutinitas harian) yang mendukung proses pemulihan.",
      "Informasi yang akurat tentang kondisi yang dialami untuk mendukung pemahaman diri (psikoedukasi).",
      "Ruang yang aman untuk terbuka mengenai pengalamannya tanpa takut distigma atau didiskriminasi.",
    ],
    avoidances: [
      "Stigmatisasi, pelabelan negatif, atau meremehkan kondisi yang dialami.",
      "Memaksa seseorang untuk 'cepat sembuh' atau membandingkan proses pemulihannya dengan orang lain.",
      "Mengabaikan tanda krisis (risiko bunuh diri/menyakiti diri) dengan asumsi sekadar 'cari perhatian'.",
      "Melanggar kerahasiaan informasi kesehatan mental individu tanpa persetujuannya.",
      "Membuat keputusan sepihak (misalnya terkait pekerjaan atau pendidikan) berdasarkan label diagnosis semata, tanpa asesmen fungsi yang aktual.",
    ],
    generalApproach: [
      "Terapkan pendekatan berorientasi pemulihan (recovery-oriented), berfokus pada harapan, pemberdayaan, dan kualitas hidup, bukan semata penghilangan gejala.",
      "Dengarkan pengalaman individu tanpa menghakimi, meremehkan, atau terburu-buru memberi solusi.",
      "Jaga kerahasiaan (konfidensialitas) informasi kesehatan mental individu secara ketat.",
      "Libatkan individu secara aktif dalam perencanaan perawatan dan dukungan yang akan dijalaninya sendiri.",
    ],
    recommendedInterventions: [
      "Akses ke psikoterapi berbasis bukti sesuai kondisi, serta farmakoterapi bila diperlukan melalui kolaborasi psikolog-psikiater.",
      "Manajemen kasus (case management) untuk kondisi yang lebih kompleks/kronis, guna mengoordinasikan layanan kesehatan, sosial, dan pekerjaan.",
      "Dukungan reintegrasi sosial dan vokasional, misalnya melalui program supported employment atau rehabilitasi psikososial.",
      "Psikoedukasi bagi keluarga agar dapat menjadi sistem dukungan yang efektif dan tidak menghakimi.",
    ],
  },
  {
    id: "peduli-chronic-conditions",
    slug: "chronic-conditions",
    zoneId: "rentan",
    title: "Individu dengan Kondisi atau Penyakit Kronis",
    englishTitle: "Chronic Conditions",
    sourcePages: [48, 49, 50],
    characteristics: [
      {
        title: "Karakteristik Utama",
        paragraphs: [
          "Kelompok dengan penyakit kronis menghadapi tuntutan manajemen jangka panjang, seperti pengobatan rutin, pemantauan gejala, dan perubahan gaya hidup, yang dapat menjadi beban psikologis di luar gejala fisik. Proses adaptasi terhadap perubahan kondisi kesehatan dapat melibatkan respons emosional yang beragam, termasuk perasaan kehilangan, ketidakpastian, dan perubahan peran maupun citra diri, meskipun proses tersebut tidak selalu berlangsung secara linear. Mereka juga rentan mengalami depresi dan kecemasan akibat nyeri kronis, keterbatasan fungsional, ketidakpastian prognosis, serta beban finansial dan sosial dari perawatan jangka panjang. Kualitas hidup dan keberhasilan pengelolaan kondisi sangat dipengaruhi oleh dukungan sosial serta keyakinan individu terhadap kemampuannya dalam mengelola penyakit (self-efficacy). Beban pengelolaan penyakit yang berkepanjangan dapat menimbulkan kelelahan dan menurunkan motivasi untuk mempertahankan rutinitas perawatan secara konsisten.",
        ],
      },
    ],
    mainNeeds: [
      "Informasi medis yang jelas dan mudah dipahami mengenai kondisi dan cara pengelolaannya.",
      "Dukungan emosional untuk menjalani proses adaptasi terhadap perubahan kondisi kesehatan.",
      "Akses terhadap layanan kesehatan yang berkelanjutan dan terjangkau.",
      "Dukungan sosial yang konsisten, baik dari keluarga maupun komunitas sesama penyintas.",
      "Fleksibilitas dalam menjalankan peran hidup (pekerjaan, sosial) untuk mengakomodasi kebutuhan pengelolaan penyakit.",
    ],
    avoidances: [
      "Meremehkan dampak psikologis penyakit kronis dengan hanya berfokus pada aspek medis/fisik semata.",
      "Memaksakan sikap 'selalu positif' yang mengabaikan proses berduka yang wajar dialami.",
      "Menyalahkan individu atas kondisinya (victim-blaming), terutama pada penyakit yang berkaitan dengan gaya hidup.",
      "Mengabaikan tanda depresi/kecemasan dengan menganggapnya 'wajar karena sedang sakit'.",
      "Membiarkan individu mengalami isolasi sosial akibat keterbatasan fisik yang tidak diantisipasi oleh lingkungan sekitar.",
    ],
    generalApproach: [
      "Terapkan pendekatan biopsikososial, pertimbangkan aspek medis, psikologis, dan sosial secara terintegrasi dalam pendampingan.",
      "Dukung individu membangun rasa kendali (sense of control) melalui edukasi dan keterlibatan aktif dalam pengambilan keputusan perawatan.",
      "Bantu individu menemukan kembali makna dan tujuan hidup meski dengan keterbatasan yang ada.",
      "Libatkan keluarga sebagai bagian dari sistem dukungan, namun tetap hormati otonomi dan privasi individu.",
    ],
    recommendedInterventions: [
      "Dukungan psikologis yang terintegrasi dalam perawatan medis.",
      "Program manajemen diri penyakit kronis (chronic disease self-management program) untuk membangun efikasi diri pasien.",
      "Kelompok dukungan sesama penyintas/pasien dengan kondisi serupa.",
      "Skrining rutin untuk depresi dan kecemasan pada individu dengan penyakit kronis.",
      "Dukungan bagi keluarga/pengasuh (caregiver support) untuk mencegah kelelahan pengasuhan (caregiver burnout).",
    ],
  },
];
