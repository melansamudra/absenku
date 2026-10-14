-- Alasan terlambat: karyawan wajib mengisi saat Check In terlambat dari jadwal shift
-- (form "Alasan Terlambat" di halaman Check In). Kolom opsional; tampil di tabel Presensi admin.
alter table public.attendance
  add column if not exists late_reason text;
