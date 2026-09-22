-- Module: multi-shift & jadwal karyawan. businesses.work_start_time/
-- work_end_time (v1) tetap dipakai sebagai FALLBACK kalau suatu hari
-- karyawan tidak punya assignment shift — jadi tidak ada breaking change
-- untuk bisnis yang belum pakai fitur ini.

create table public.shift_templates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);

create index shift_templates_business_id_idx on public.shift_templates (business_id);

alter table public.shift_templates enable row level security;

create policy "Owner manages shift templates of own businesses"
on public.shift_templates for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

create table public.employee_shift_assignments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  date date not null,
  shift_template_id uuid not null references public.shift_templates (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (employee_id, date)
);

create index employee_shift_assignments_business_id_idx on public.employee_shift_assignments (business_id);
create index employee_shift_assignments_date_idx on public.employee_shift_assignments (date);

alter table public.employee_shift_assignments enable row level security;

create policy "Owner manages shift assignments of own businesses"
on public.employee_shift_assignments for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

alter table public.attendance
  add column shift_template_id uuid references public.shift_templates (id) on delete set null;
