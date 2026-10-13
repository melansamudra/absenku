-- Tambah role "hr" di antara admin dan staff. Sebelumnya role tersimpan
-- tapi tidak ditegakkan di kode sama sekali (staff = admin secara efektif) —
-- lihat src/lib/business/role.ts dan layout.tsx baru di payroll/, report/,
-- settings/, employees/ yang sekarang benar-benar membatasi akses:
--   admin — akses penuh (sama seperti sekarang)
--   hr    — semua KECUALI Payroll, Laporan, Pengaturan (data finansial & konfigurasi bisnis)
--   staff — semua KECUALI Payroll, Laporan, Pengaturan, DAN Karyawan (data gaji pokok/NIK/rekening ada di situ juga)
alter table public.business_staff drop constraint business_staff_role_check;
alter table public.business_staff
  add constraint business_staff_role_check check (role in ('admin', 'hr', 'staff'));
