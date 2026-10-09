-- Data karyawan lengkap: NIK, tanggal masuk kerja, dan rekening bank (untuk
-- transfer gaji). Semua opsional supaya data lama tetap valid.
alter table public.employees
  add column nik text check (nik is null or nik ~ '^[0-9]{16}$'),
  add column join_date date,
  add column bank_name text,
  add column bank_account_number text check (bank_account_number is null or bank_account_number ~ '^[0-9]{5,20}$'),
  add column bank_account_name text;

-- Satu NIK hanya boleh dipakai satu karyawan aktif (belum dihapus) per bisnis.
create unique index employees_business_nik_uniq
  on public.employees (business_id, nik)
  where nik is not null and deleted_at is null;
