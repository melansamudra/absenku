-- Modul baru: (1) lokasi kantor tambahan untuk geofence absen, (2) reimbursement
-- biaya, (3) surat peringatan/keterangan karyawan, (4) kegiatan harian &
-- penugasan karyawan.
--
-- Karyawan tidak login ke Supabase Auth (Portal Karyawan pakai sesi PIN dan
-- service-role client), jadi semua policy di sini hanya untuk owner/staff
-- bisnis; scoping per karyawan dilakukan manual di sisi server portal.

-- (1) Lokasi kantor tambahan. Titik kantor utama tetap di
-- businesses.office_lat/lng/attendance_radius_m — absen dianggap valid kalau
-- berada dalam radius SALAH SATU titik (utama atau tambahan).
create table public.office_locations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  lat numeric(9, 6) not null check (lat between -90 and 90),
  lng numeric(9, 6) not null check (lng between -180 and 180),
  radius_m int not null check (radius_m between 10 and 10000),
  created_at timestamptz not null default now()
);

create index office_locations_business_id_idx on public.office_locations (business_id);

alter table public.office_locations enable row level security;

create policy "Owner manages office locations of own businesses"
on public.office_locations for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

-- (2) Reimbursement. Setelah disetujui, nominalnya disalin ke slip gaji
-- berikutnya sebagai payslip_adjustments (tunjangan) dan payslip_id diisi
-- supaya tidak dibayar dua kali. Adjustment ditambahkan SETELAH hitung
-- PPh21/BPJS, jadi reimbursement tidak ikut kena pajak/iuran.
create table public.reimbursements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  date date not null,
  category text not null default 'lainnya',
  amount numeric(12, 2) not null check (amount > 0),
  description text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_note text,
  payslip_id uuid references public.payslips (id) on delete set null,
  created_at timestamptz not null default now()
);

create index reimbursements_business_status_idx
  on public.reimbursements (business_id, status, created_at desc);
create index reimbursements_employee_idx on public.reimbursements (employee_id, date);

alter table public.reimbursements enable row level security;

create policy "Owner manages reimbursements of own businesses"
on public.reimbursements for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

-- (3) Surat karyawan: SP1/SP2/SP3 dan Surat Keterangan (SK).
create table public.employee_letters (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  kind text not null check (kind in ('sp1', 'sp2', 'sp3', 'sk')),
  letter_number text,
  issued_date date not null,
  subject text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index employee_letters_business_idx on public.employee_letters (business_id, issued_date desc);
create index employee_letters_employee_idx on public.employee_letters (employee_id);

alter table public.employee_letters enable row level security;

create policy "Owner manages employee letters of own businesses"
on public.employee_letters for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

-- (4a) Kegiatan harian yang dilaporkan karyawan lewat portal.
create table public.employee_activities (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  date date not null,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create index employee_activities_business_idx on public.employee_activities (business_id, date desc);
create index employee_activities_employee_idx on public.employee_activities (employee_id, date desc);

alter table public.employee_activities enable row level security;

create policy "Owner manages employee activities of own businesses"
on public.employee_activities for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

-- (4b) Penugasan: admin membuat tugas, karyawan memperbarui status di portal.
create table public.employee_tasks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index employee_tasks_business_idx on public.employee_tasks (business_id, status, created_at desc);
create index employee_tasks_employee_idx on public.employee_tasks (employee_id, status);

alter table public.employee_tasks enable row level security;

create policy "Owner manages employee tasks of own businesses"
on public.employee_tasks for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

-- Cooldown anti-spam portal untuk klaim & kegiatan.
alter table public.public_submission_log
  drop constraint public_submission_log_kind_check;
alter table public.public_submission_log
  add constraint public_submission_log_kind_check
  check (kind in ('absen', 'cuti', 'absen_pin_gagal', 'lembur', 'klaim', 'kegiatan'));

-- Geofence juga aktif kalau hanya ada lokasi tambahan (titik utama kosong).
-- Kolom hasil tidak berubah, jadi create or replace cukup.
create or replace function public.get_attendance_checkin_info(p_slug text)
returns table (
  business_id uuid,
  business_name text,
  work_start_time time,
  work_end_time time,
  geofence_enabled boolean,
  pin_required boolean,
  employee_id uuid,
  employee_name text,
  employee_note text,
  employee_has_pin boolean
)
language sql
security definer
set search_path = ''
as $$
  select
    b.id, b.name, b.work_start_time, b.work_end_time,
    (
      (b.office_lat is not null and b.office_lng is not null and b.attendance_radius_m is not null)
      or exists (select 1 from public.office_locations ol where ol.business_id = b.id)
    ),
    b.attendance_pin_required,
    e.id, e.name, e.note,
    e.attendance_pin_hash is not null
  from public.businesses b
  join public.employees e on e.business_id = b.id
    and e.active = true
    and e.deleted_at is null
  where b.attendance_qr_slug = p_slug
  order by e.created_at asc;
$$;
