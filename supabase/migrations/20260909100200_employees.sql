-- Module: employees (karyawan) — satu-satunya entitas karyawan di ABSENKU
-- (tidak ada tabel "cashiers"/PIN kasir terpisah seperti di produk POS;
-- ABSENKU murni HRD/payroll).

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,

  salary_type text not null default 'harian' check (salary_type in ('harian', 'bulanan')),
  daily_rate numeric(12, 2) not null default 0,
  monthly_rate numeric(12, 2) not null default 0,

  active boolean not null default true,
  note text, -- juga dipakai sebagai label divisi/jabatan di UI absen selfie
  contract_end date,

  -- null = pakai businesses.lembur_rate_per_hour (tarif default bisnis).
  lembur_rate_per_hour numeric(12, 2),
  -- Tunjangan harian opsional, dikali jumlah hari hadir saat hitung slip gaji.
  daily_meal_allowance numeric(12, 2) not null default 0,
  daily_attendance_allowance numeric(12, 2) not null default 0,

  -- Soft delete: baris tidak pernah dihapus fisik supaya payslip/attendance
  -- lama tetap punya referensi employee_id yang valid.
  deleted_at timestamptz,

  created_at timestamptz not null default now()
);

create index employees_business_id_idx on public.employees (business_id);

alter table public.employees enable row level security;

create policy "Owner manages employees of own businesses"
on public.employees for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));
