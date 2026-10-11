-- Riwayat gaji (Penyesuaian Gaji) dan riwayat karir per karyawan. Idempoten.
-- Gaji aktif tetap di kolom employees.* (dipakai payroll); tabel ini hanya
-- jejak perubahan beserta tanggal efektifnya.

create table if not exists public.salary_history (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  effective_date date not null,
  salary_type text not null check (salary_type in ('harian', 'bulanan')),
  daily_rate numeric(12, 2) not null default 0,
  monthly_rate numeric(12, 2) not null default 0,
  daily_meal_allowance numeric(12, 2) not null default 0,
  daily_attendance_allowance numeric(12, 2) not null default 0,
  note text,
  created_at timestamptz not null default now()
);

-- Snapshot berupa teks (bukan FK) supaya riwayat tetap utuh walau data master diubah/dihapus.
create table if not exists public.career_history (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  effective_date date not null,
  employment_status text,
  placement_type text,
  organization_name text,
  position_name text,
  rank_name text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists salary_history_employee_idx on public.salary_history (employee_id, effective_date desc);
create index if not exists career_history_employee_idx on public.career_history (employee_id, effective_date desc);

alter table public.salary_history enable row level security;
alter table public.career_history enable row level security;

drop policy if exists "Owner manages salary history of own businesses" on public.salary_history;
create policy "Owner manages salary history of own businesses"
on public.salary_history for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

drop policy if exists "Owner manages career history of own businesses" on public.career_history;
create policy "Owner manages career history of own businesses"
on public.career_history for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));
