# Panduan Instalasi — Laporan Dana Revitalisasi SMK 2026

Aplikasi ini adalah web statis (HTML/CSS/JavaScript) dengan **Supabase** sebagai
database, autentikasi, dan penyimpanan bukti. Aplikasi di-hosting **gratis** lewat
**GitHub Pages** (tanpa Vercel/server sendiri).

Publik dapat **melihat** laporan; pengelola **login** untuk menambah/mengubah/menghapus
transaksi. Bukti transaksi dikompres otomatis sebelum diunggah.

Ikuti panduan ini berurutan. Perkiraan waktu: 20–30 menit.

---

## Daftar Isi
1. [Persiapan](#1-persiapan)
2. [Membuat Project Supabase](#2-membuat-project-supabase)
3. [Membuat Tabel Database](#3-membuat-tabel-database)
4. [Membuat Storage untuk Bukti](#4-membuat-storage-untuk-bukti)
5. [Membuat Akun Pengelola](#5-membuat-akun-pengelola)
6. [Mengisi Kredensial di Aplikasi](#6-mengisi-kredensial-di-aplikasi)
7. [Menjalankan Secara Lokal (uji coba)](#7-menjalankan-secara-lokal-uji-coba)
8. [Mengunggah ke GitHub & Mengaktifkan GitHub Pages](#8-mengunggah-ke-github--mengaktifkan-github-pages)
9. [Penggunaan Sehari-hari](#9-penggunaan-sehari-hari)
10. [Perawatan & Perubahan](#10-perawatan--perubahan)
11. [Pemecahan Masalah](#11-pemecahan-masalah)

---

## 1. Persiapan

Siapkan:
- **Akun Supabase** — daftar gratis di https://supabase.com (bisa pakai akun GitHub/Google).
- **Akun GitHub** — daftar gratis di https://github.com.
- **Git** terpasang di komputer (unduh di https://git-scm.com) — atau gunakan GitHub Desktop / unggah manual lewat web.
- **Editor teks** (VS Code, Notepad++, dsb.) untuk mengubah 1 baris kredensial.

Struktur folder aplikasi:
```
revitalisasi-smk/
├── index.html            Halaman utama (produksi)
├── demo.html             Versi demo (data contoh, tanpa Supabase)
├── PANDUAN-INSTALASI.md  File ini
├── README.md             Ringkasan singkat
├── assets/
│   └── logo.png          Logo sekolah
├── css/
│   └── style.css
├── js/
│   ├── config.js         ← YANG PERLU ANDA ISI (kredensial Supabase)
│   ├── master.js         Data dropdown (toko, penanggung jawab, jenis pajak)
│   ├── supabase.js       Inisialisasi Supabase
│   ├── auth.js           Login/logout
│   ├── compress.js       Kompres gambar bukti
│   ├── transactions.js   Operasi data (tambah/ubah/hapus)
│   ├── export.js         Ekspor Excel
│   ├── print.js          Cetak laporan (A4 landscape)
│   └── ui.js             Tampilan & interaksi
└── sql/
    └── setup.sql         Skrip pembuatan tabel + keamanan
```

---

## 2. Membuat Project Supabase

1. Masuk ke https://supabase.com lalu **New project**.
2. Isi:
   - **Name**: `revitalisasi-smk` (bebas).
   - **Database Password**: buat password kuat, **simpan baik-baik** (untuk keperluan lanjutan).
   - **Region**: pilih **Southeast Asia (Singapore)** agar cepat diakses dari Indonesia.
3. Klik **Create new project** dan tunggu ±2 menit hingga siap.

---

## 3. Membuat Tabel Database

1. Di dashboard Supabase, buka menu kiri **SQL Editor**.
2. Klik **New query**.
3. Buka file `sql/setup.sql` dari folder aplikasi, **salin seluruh isinya**, tempel ke editor.
4. Klik **Run** (atau Ctrl/Cmd + Enter).
5. Pastikan muncul "Success". Ini membuat:
   - Tabel `pengaturan` (menyimpan pagu anggaran & nama sekolah).
   - Tabel `transaksi` (menyimpan semua transaksi).
   - Aturan keamanan (RLS): publik hanya bisa **membaca**, pengelola yang login bisa **menulis**.

Untuk memverifikasi: buka menu **Table Editor**, Anda akan melihat tabel `pengaturan`
(berisi 1 baris) dan `transaksi` (masih kosong).

---

## 4. Membuat Storage untuk Bukti

Bukti transaksi (foto nota) disimpan di Supabase Storage.

1. Buka menu kiri **Storage** → **New bucket**.
2. Isi nama bucket **persis**: `bukti`
3. **Aktifkan "Public bucket"** (agar foto bukti bisa ditampilkan). Klik **Create bucket**.
4. Atur izin akses. Buka tab **Policies** pada bucket `bukti`, lalu tambahkan:
   - **Kebijakan baca (SELECT)** untuk semua orang:
     - New policy → **For full customization** → Policy name: `Publik baca bukti`
     - Allowed operation: **SELECT**
     - Target roles: `public`
     - USING expression: `true`
     - Save.
   - **Kebijakan unggah/ubah/hapus** untuk pengelola login:
     - New policy → Policy name: `Pengelola kelola bukti`
     - Allowed operation: centang **INSERT**, **UPDATE**, **DELETE**
     - Target roles: `authenticated`
     - WITH CHECK / USING expression: `true`
     - Save.

> Jika UI Supabase menyediakan template "Allow access to authenticated users only",
> Anda boleh memakainya lalu menyesuaikan operasinya.

---

## 5. Membuat Akun Pengelola

Pengelola (bendahara) butuh akun untuk login.

1. Buka menu kiri **Authentication** → **Users** → **Add user** → **Create new user**.
2. Isi **Email** dan **Password** pengelola. Centang **Auto Confirm User** agar langsung aktif.
3. Klik **Create user**.
4. Ulangi bila ada lebih dari satu pengelola.

> Untuk keamanan: matikan pendaftaran mandiri agar tak sembarang orang bisa membuat akun.
> Buka **Authentication → Providers → Email**, nonaktifkan **Enable sign-ups** (opsional tapi disarankan).

---

## 6. Mengisi Kredensial di Aplikasi

1. Di Supabase, buka **Project Settings** (ikon gerigi) → **API**.
2. Salin dua nilai:
   - **Project URL** (contoh: `https://abcdefgh.supabase.co`)
   - **anon public** key (kunci panjang di bagian "Project API keys").
3. Buka file `js/config.js` dengan editor teks. Ganti nilai placeholder:

   ```js
   window.APP_CONFIG = {
     SUPABASE_URL:      "https://abcdefgh.supabase.co",   // ← tempel Project URL
     SUPABASE_ANON_KEY: "eyJhbGciOi...",                  // ← tempel anon public key
     BUCKET:            "bukti",
     COMPRESS_MAX_SIDE: 1280,
     COMPRESS_QUALITY:  0.7
   };
   ```
4. Simpan file.

> **Aman?** Ya. `anon key` memang dirancang untuk dipakai di sisi browser; keamanan data
> dijaga oleh aturan RLS yang sudah dibuat di langkah 3. **Jangan pernah** menaruh
> `service_role key` di file ini.

---

## 7. Menjalankan Secara Lokal (uji coba)

Karena aplikasi memuat beberapa file JS, buka lewat server kecil (bukan klik ganda file),
agar tidak diblokir browser.

**Cara termudah (Python sudah ada di banyak komputer):**
```bash
cd revitalisasi-smk
python -m http.server 8080
```
Lalu buka browser ke `http://localhost:8080/index.html`.

**Alternatif (Node.js):**
```bash
npx serve .
```

Uji:
- Halaman tampil dengan logo dan 4 kotak ringkasan.
- Klik **Masuk Pengelola**, login dengan akun langkah 5.
- Klik **Ubah** pada Pagu, isi pagu anggaran.
- Klik **Tambah Transaksi**, isi satu data + unggah foto bukti → tersimpan.
- Klik **Cetak** untuk pratinjau laporan A4.

> Ingin coba tanpa Supabase dulu? Buka `demo.html` — memakai data contoh di browser saja.

---

## 8. Mengunggah ke GitHub & Mengaktifkan GitHub Pages

### 8a. Membuat repository
1. Di https://github.com, klik **New repository**.
2. Nama: `revitalisasi-smk` (bebas). Pilih **Public**. Jangan centang "Add README".
3. **Create repository**.

### 8b. Mengunggah kode

**Opsi A — lewat Git (baris perintah):**
```bash
cd revitalisasi-smk
git init
git add .
git commit -m "Aplikasi laporan dana revitalisasi SMK"
git branch -M main
git remote add origin https://github.com/USERNAME/revitalisasi-smk.git
git push -u origin main
```
Ganti `USERNAME` dengan nama akun GitHub Anda.

**Opsi B — tanpa Git (unggah manual):**
Di halaman repo, klik **uploading an existing file**, lalu **seret semua isi folder**
`revitalisasi-smk` (bukan foldernya, tapi isinya: `index.html`, folder `js`, `css`, dst.),
lalu **Commit changes**.

### 8c. Mengaktifkan GitHub Pages
1. Di repo, buka **Settings** → menu kiri **Pages**.
2. Bagian **Build and deployment** → **Source**: pilih **Deploy from a branch**.
3. **Branch**: pilih `main`, folder `/ (root)` → **Save**.
4. Tunggu ±1 menit. Halaman akan tampil di:
   ```
   https://USERNAME.github.io/revitalisasi-smk/
   ```
   Bagikan tautan ini ke publik. Pengelola login lewat tombol **Masuk Pengelola**.

> Setelah GitHub Pages aktif, tambahkan alamat itu ke daftar yang diizinkan Supabase agar
> login lancar: **Authentication → URL Configuration → Site URL / Redirect URLs**, isi
> `https://USERNAME.github.io/revitalisasi-smk/`.

---

## 9. Penggunaan Sehari-hari

- **Publik**: buka tautan GitHub Pages → lihat ringkasan & tabel, filter bulan, cari, Cetak, Ekspor Excel.
- **Pengelola**: klik **Masuk Pengelola** → login. Muncul tombol **Tambah Transaksi**,
  serta **Ubah**/**Hapus** di tiap baris, dan **Ubah** pagu anggaran.
- **Tambah transaksi**: isi tanggal, jenis (pemasukan/pengeluaran), nominal, pajak,
  toko (pilih dari daftar atau "+ Toko lain…"), penanggung jawab, keterangan, dan unggah bukti.
- **Cetak**: menghasilkan laporan A4 *landscape* dengan kop, 4 kotak ringkasan, tabel,
  dan kolom tanda tangan. Saat mencetak, aktifkan **"Background graphics"** agar warna ikut tercetak.

---

## 10. Perawatan & Perubahan

**Semua perubahan dilakukan di folder produksi ini, lalu unggah ulang ke GitHub.**

Setelah mengubah file, jalankan:
```bash
git add .
git commit -m "keterangan perubahan"
git push
```
GitHub Pages otomatis memperbarui situs dalam ±1 menit.

Perubahan umum:
- **Daftar toko / penanggung jawab / jenis pajak** → edit `js/master.js`.
- **Logo** → ganti `assets/logo.png` (ukuran ideal persegi, < 200 KB).
- **Nama sekolah / judul** → default nama sekolah ada di tabel `pengaturan` (bisa diubah
  lewat SQL) dan teks kop cetak ada di `js/print.js`.
- **Warna & tampilan** → `css/style.css`.
- **Isi laporan cetak (kop, penanda tangan)** → `js/print.js`.

---

## 11. Pemecahan Masalah

**Tabel kosong dan muncul "Supabase belum dikonfigurasi".**
→ `js/config.js` belum diisi. Ulangi [langkah 6](#6-mengisi-kredensial-di-aplikasi).

**"Gagal memuat data".**
→ Kredensial salah, atau tabel belum dibuat. Cek `js/config.js` dan pastikan
`sql/setup.sql` sudah dijalankan ([langkah 3](#3-membuat-tabel-database)).

**Tidak bisa login.**
→ Pastikan akun dibuat & dikonfirmasi ([langkah 5](#5-membuat-akun-pengelola)). Untuk
GitHub Pages, isi Site URL di Supabase ([langkah 8c](#8c-mengaktifkan-github-pages)).

**Bukti gagal diunggah.**
→ Pastikan bucket bernama `bukti`, bersifat public, dan policy INSERT untuk `authenticated`
sudah dibuat ([langkah 4](#4-membuat-storage-untuk-bukti)).

**Halaman tampil polos/tanpa gaya saat dibuka lokal.**
→ Jangan klik-ganda file. Jalankan lewat server kecil ([langkah 7](#7-menjalankan-secara-lokal-uji-coba)).

**Warna kop/tabel tidak muncul saat dicetak.**
→ Di dialog cetak, aktifkan opsi **"Background graphics" / "Grafis latar belakang"**.

---

Selesai. Situs Anda kini daring, gratis, dan aman untuk mencatat serta menampilkan
Laporan Realisasi Penggunaan Dana Bantuan Revitalisasi SMK Tahun 2026.
