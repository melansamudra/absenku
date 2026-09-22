-- Module: PPh 21 (pajak penghasilan karyawan) — OPSIONAL, mati secara default
-- per bisnis (businesses.pph21_enabled). Pakai metode TER (Tarif Efektif
-- Rata-rata) sesuai PP 58/2023 & PMK 168/2023 yang berlaku sejak Jan 2024:
-- tarif efektif langsung dikalikan ke penghasilan bruto bulanan, tanpa
-- pengurangan PTKP manual tiap bulan (PTKP karyawan cuma menentukan kategori
-- tabel TER mana — A, B, atau C — yang dipakai). Tabel tarif lengkapnya ada
-- di src/lib/payroll/pph21.ts.
--
-- PERINGATAN: tabel tarif ditranskrip dari sumber sekunder (bukan hasil
-- parse langsung dokumen resmi DJP), dan skema di sini adalah PENYEDERHANAAN
-- (tidak menghitung ulang tahunan di Desember, tidak menerapkan aturan
-- khusus THR/bonus). Verifikasi ke akuntan/konsultan pajak sebelum dipakai
-- untuk pelaporan pajak sungguhan — lihat catatan di README.

alter table public.businesses
  add column pph21_enabled boolean not null default false;

alter table public.employees
  add column ptkp_status text not null default 'TK/0'
    check (ptkp_status in ('TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3'));

alter table public.payslips
  add column pph21_amount numeric(12, 2) not null default 0,
  add column ptkp_status text,
  add column ter_category text check (ter_category in ('A', 'B', 'C'));
