-- Approval Presensi: admin bisa menolak presensi (tab "Ditolak").
-- Presensi yang ditolak otomatis dicatat status 'alpa' oleh aplikasi, jadi
-- hitungan payroll tidak berubah — kolom ini hanya untuk riwayat & filter.
alter table public.attendance
  add column if not exists rejected_at timestamptz,
  add column if not exists rejected_note text;
