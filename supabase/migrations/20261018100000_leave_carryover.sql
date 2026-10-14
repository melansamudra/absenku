-- Module: cuti lanjutan (carry-over) + cuti bersama.
--
-- leave_carryovers menyimpan hari cuti sisa tahun sebelumnya yang
-- dibawa (carry-over) ke tahun tertentu, per karyawan per jenis cuti —
-- ditambahkan ke kuota tahun itu di halaman Sisa Cuti. Diisi lewat
-- tombol "Hitung Carry-over" (dihitung dari sisa tahun sebelumnya,
-- dibatasi leave_types.max_carryover_days) atau manual oleh owner/HR.
--
-- collective_leave_days menyimpan tanggal cuti bersama (mis. libur
-- lebaran) yang otomatis memotong kuota SEMUA karyawan aktif untuk
-- jenis cuti tertentu, tanpa perlu pengajuan individual. leave_type_id
-- null = sekadar catatan hari libur, tidak memotong kuota apa pun.

alter table public.leave_types
  add column max_carryover_days numeric(6, 1) not null default 0;

create table public.leave_carryovers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  leave_type_id uuid not null references public.leave_types (id) on delete cascade,
  year int not null,
  days numeric(6, 1) not null default 0 check (days >= 0),
  created_at timestamptz not null default now(),
  unique (employee_id, leave_type_id, year)
);

create index leave_carryovers_business_id_idx on public.leave_carryovers (business_id);

alter table public.leave_carryovers enable row level security;

create policy "Owner manages leave carryovers of own businesses"
on public.leave_carryovers for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

create table public.collective_leave_days (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  date date not null,
  label text not null,
  leave_type_id uuid references public.leave_types (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (business_id, date)
);

create index collective_leave_days_business_id_idx on public.collective_leave_days (business_id);

alter table public.collective_leave_days enable row level security;

create policy "Owner manages collective leave days of own businesses"
on public.collective_leave_days for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));
