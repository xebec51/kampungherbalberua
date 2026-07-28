# Plant Poster Import

Workbook sumber:

```text
data/plant-poster/source/poster-216-tanaman.xlsx
```

Sheet wajib:

- `Entri_Poster`
- `Nama_Unik`
- `Zona`
- `Ringkasan`

Validasi wajib:

- 20 zona
- 206 entri
- 89 nama mentah unik
- nomor 157-166 tidak dibuat
- tidak ada nomor poster duplikat

`source_code`:

```text
KHB-POSTER-216-2026
```

Import tidak membuat 206 tanaman. Nama yang belum pasti tetap unresolved. Tanaman draft baru hanya boleh dibuat bila identitas canonical jelas dan tidak ada duplikasi.
