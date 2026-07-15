# Pedoman Agen Proyek Kampung Herbal Berua

Pedoman ini berlaku untuk seluruh perubahan pada repository Kampung Herbal Berua.

## Prinsip Umum

- Seluruh teks antarmuka menggunakan Bahasa Indonesia.
- Gunakan TypeScript strict.
- Hindari penggunaan `any`.
- Gunakan Server Components secara default.
- Gunakan Client Components hanya untuk interaksi yang membutuhkan state, event browser, atau API browser.
- Buat komponen kecil, reusable, dan memiliki tanggung jawab jelas.
- Pisahkan data dari komponen.
- Gunakan data lokal TypeScript untuk tahap pertama.

## Aksesibilitas dan UI

- Gunakan semantic HTML.
- Pastikan navigasi dapat digunakan dengan keyboard.
- Gunakan elemen heading secara berurutan.
- Semua form harus memiliki label yang jelas.
- Semua gambar harus memiliki alt text.
- Tampilkan focus state yang jelas untuk navigasi keyboard.

## Privasi Data

- Jangan menambahkan API key, token, kredensial, atau data sensitif.
- Jangan memasukkan file `.env.local` ke Git.
- Jangan memasukkan data kesehatan perorangan.
- Jangan menampilkan data warga berdasarkan nama atau alamat rumah.
- Jangan menampilkan nomor telepon warga.
- Jangan menampilkan nomor telepon mahasiswa KKN secara publik.
- Data kesehatan hanya boleh ditampilkan dalam bentuk agregat.
- Jangan menyimpan isi kotak saran menggunakan `localStorage`.

## Informasi Kesehatan

- Jangan membuat klaim bahwa tanaman atau ramuan pasti menyembuhkan penyakit.
- Gunakan istilah "pemanfaatan tradisional".
- Gunakan frasa "secara tradisional digunakan untuk membantu" bila diperlukan.
- Informasi kesehatan pada website adalah informasi umum.
- Informasi website bukan pengganti konsultasi dengan tenaga kesehatan.
- Jangan menyarankan pengguna mengganti obat dokter dengan ramuan.
- Jangan menulis bahwa ramuan aman untuk semua orang.
- Sertakan peringatan agar ibu hamil, anak-anak, lansia, penderita penyakit tertentu, dan pengguna obat rutin berkonsultasi dengan tenaga kesehatan.

## Git dan Kualitas

- Jalankan `npm run lint` dan `npm run build` setelah perubahan utama.
- Setiap tahap perubahan harus dibuatkan commit lokal.
- Gunakan Conventional Commits.
- Jangan melakukan push tanpa instruksi eksplisit.
- Jangan melakukan force push.
- Jangan mengubah remote repository.
- Jangan menggunakan `git reset --hard`, `git clean -fd`, atau `git checkout -- .`.
- Sebelum commit, periksa `git diff`, file yang berubah, dan pastikan tidak ada rahasia.
