-- Jadwal Tetap: pola shift mingguan per karyawan (Senin..Minggu), dipisah dari
-- employee_shift_assignments (penugasan per tanggal) yang sudah ada — pola ini
-- cuma template; "Terapkan" di UI yang benar-benar menulis ke
-- employee_shift_assignments untuk rentang tanggal tertentu, jadi tidak perlu
-- ubah logic kalkulasi payroll/absensi yang sudah ada sama sekali.
create table public.employee_weekly_schedules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7), -- ISO: 1=Senin .. 7=Minggu
  shift_template_id uuid references public.shift_templates (id) on delete set null, -- null = libur hari itu
  created_at timestamptz not null default now(),
  unique (employee_id, weekday)
);

create index employee_weekly_schedules_business_idx on public.employee_weekly_schedules (business_id);
create index employee_weekly_schedules_employee_idx on public.employee_weekly_schedules (employee_id);

alter table public.employee_weekly_schedules enable row level security;

create policy "Owner/staff manages weekly schedules of own businesses"
  on public.employee_weekly_schedules for all
  using (private.owns_business(business_id))
  with check (private.owns_business(business_id));
