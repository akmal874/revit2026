-- ============================================================
--  Setup Database — Laporan Dana Revitalisasi SMK 2026
--  Jalankan di Supabase → SQL Editor
-- ============================================================

-- 1. TABEL PENGATURAN (pagu anggaran, identitas sekolah)
create table if not exists public.pengaturan (
  id            int primary key default 1,
  nama_sekolah  text    default 'SMKN 3 Kepulauan Selayar',
  tahun         int     default 2026,
  pagu_anggaran bigint  default 0,
  updated_at    timestamptz default now(),
  constraint singleton check (id = 1)
);
insert into public.pengaturan (id) values (1) on conflict do nothing;

-- 2. TABEL TRANSAKSI
create table if not exists public.transaksi (
  id                uuid primary key default gen_random_uuid(),
  tanggal           date        not null,
  uraian            text        not null,
  jenis             text        not null check (jenis in ('masuk','keluar')),
  nominal           bigint      not null check (nominal >= 0),
  pajak             text        default 'tanpa',   -- tanpa | ppn11 | pph21 | dll
  pajak_nominal     bigint      default 0,
  nama_toko         text,
  penanggung_jawab  text        not null,
  bukti_url         text,
  keterangan        text,
  created_at        timestamptz default now()
);
create index if not exists idx_transaksi_tanggal on public.transaksi (tanggal);

-- 3. ROW LEVEL SECURITY
alter table public.transaksi  enable row level security;
alter table public.pengaturan enable row level security;

-- Publik boleh MEMBACA (halaman publik read-only)
create policy "publik_baca_transaksi"  on public.transaksi  for select using (true);
create policy "publik_baca_pengaturan" on public.pengaturan for select using (true);

-- Hanya user login (pengelola) yang boleh menulis
create policy "pengelola_tulis_transaksi" on public.transaksi
  for all to authenticated using (true) with check (true);
create policy "pengelola_ubah_pengaturan" on public.pengaturan
  for update to authenticated using (true) with check (true);

-- 4. STORAGE BUCKET untuk bukti (buat manual di Storage, nama: 'bukti', public)
--    Policy Storage:
--    - SELECT: public (semua bisa lihat bukti)
--    - INSERT/UPDATE/DELETE: authenticated
