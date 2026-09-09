# Laporan Dana Bantuan Revitalisasi SMK 2026

Aplikasi web untuk mencatat dan menampilkan **Laporan Realisasi Penggunaan Dana
Bantuan Revitalisasi SMK Tahun 2026** — SMKN 3 Kepulauan Selayar.

Web statis + **Supabase** (database, login, storage), di-hosting gratis di **GitHub Pages**.

## Fitur
- Ringkasan: pagu anggaran, pemasukan (saldo kas bendahara), pengeluaran, saldo, penyerapan.
- Tabel transaksi dengan saldo berjalan otomatis, filter bulan, pencarian, dan pagination (10/halaman).
- Tambah/ubah/hapus transaksi (khusus pengelola yang login) dengan dropdown toko, penanggung jawab, dan jenis pajak.
- **Kompres foto bukti otomatis** sebelum diunggah.
- **Cetak** laporan A4 *landscape* (kop + logo, 4 kotak ringkasan, tabel rapi, kolom tanda tangan).
- **Ekspor Excel**.
- Halaman publik read-only + mode pengelola via Supabase Auth.
- **Responsif** untuk HP Android (tabel berubah jadi kartu).

## Cara pasang
Lihat **[PANDUAN-INSTALASI.md](PANDUAN-INSTALASI.md)** — langkah lengkap Supabase & GitHub Pages.

Ringkas:
1. Buat project Supabase, jalankan `sql/setup.sql`.
2. Buat bucket Storage `bukti` (public) + policy.
3. Buat akun pengelola di Authentication.
4. Isi `js/config.js` dengan Project URL & anon key.
5. Unggah ke GitHub, aktifkan Pages.

Coba tanpa Supabase: buka `demo.html` (data contoh).

## Struktur
```
index.html   demo.html   PANDUAN-INSTALASI.md
assets/logo.png
css/style.css
js/  config.js master.js supabase.js auth.js compress.js
     transactions.js export.js print.js ui.js
sql/setup.sql
```

## Perubahan
Semua edit dilakukan di folder ini lalu `git push` (Pages otomatis memperbarui).
Data dropdown: `js/master.js` · Logo: `assets/logo.png` · Tampilan: `css/style.css` ·
Laporan cetak: `js/print.js`.

> `anon key` aman di frontend (dilindungi RLS). Jangan taruh `service_role key`.
