-- Aturan lembur per bisnis (lihat src/lib/payroll/overtime.ts):
--   - minimum menit lembur sebelum dihitung, pembulatan ke bawah per
--     kelipatan menit, dan batas jam lembur per hari (PP 35/2021: 4 jam);
--   - mode tarif: 'flat' (tarif per jam, perilaku lama) atau 'pp35'
--     (1/173 × upah sebulan, jam pertama 1,5×, berikutnya 2×);
--   - hari kerja per minggu (5/6) untuk konversi gaji harian → bulanan di pp35.
alter table public.businesses
  add column overtime_min_minutes int not null default 30
    check (overtime_min_minutes between 0 and 240),
  add column overtime_rounding_minutes int not null default 30
    check (overtime_rounding_minutes in (1, 15, 30, 60)),
  add column overtime_max_hours numeric(4, 2) not null default 4
    check (overtime_max_hours > 0 and overtime_max_hours <= 12),
  add column overtime_rate_mode text not null default 'flat'
    check (overtime_rate_mode in ('flat', 'pp35')),
  add column work_days_per_week int not null default 6
    check (work_days_per_week in (5, 6));
