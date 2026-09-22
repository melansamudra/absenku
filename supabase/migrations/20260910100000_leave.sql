-- Module: cuti (leave). Approval TIDAK butuh perubahan apa pun di rumus
-- payroll (lib/payroll/calc.ts, aggregate.ts) — saat disetujui, server action
-- meng-upsert baris `attendance` untuk tiap tanggal dalam rentang jadi
-- status='izin', dengan `note` diisi nama jenis cuti kalau jenis itu
-- berbayar (jatuh ke jalur "izin berketerangan" = dibayar penuh yang sudah
-- ada), atau dibiarkan kosong kalau tidak berbayar (jatuh ke jalur "izin
-- tanpa keterangan" = dipotong sesuai aturan izin yang sudah ada). Reuse
-- penuh logic yang sudah teruji.

create table public.leave_types (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  default_days_per_year numeric(6, 1) not null default 12,
  paid boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index leave_types_business_id_idx on public.leave_types (business_id);

alter table public.leave_types enable row level security;

create policy "Owner manages leave types of own businesses"
on public.leave_types for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  leave_type_id uuid not null references public.leave_types (id),
  start_date date not null,
  end_date date not null,
  days_count int not null check (days_count > 0),
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_note text,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index leave_requests_business_id_idx on public.leave_requests (business_id, created_at);
create index leave_requests_employee_id_idx on public.leave_requests (employee_id);

alter table public.leave_requests enable row level security;

create policy "Owner manages leave requests of own businesses"
on public.leave_requests for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

-- Jejak asal-usul baris attendance yang dibuat dari approval cuti (murni
-- buat ditelusuri di UI, tidak dipakai kalkulasi payroll sama sekali).
alter table public.attendance
  add column leave_request_id uuid references public.leave_requests (id) on delete set null;

-- Token akses link pengajuan cuti publik — satu per bisnis, pola sama
-- seperti attendance_qr_slug.
alter table public.businesses
  add column leave_request_slug text unique default encode(extensions.gen_random_bytes(9), 'hex');

update public.businesses set leave_request_slug = encode(extensions.gen_random_bytes(9), 'hex')
where leave_request_slug is null;

alter table public.businesses alter column leave_request_slug set not null;

-- RPC buat halaman /cuti/[slug] publik baca nama bisnis + daftar karyawan
-- aktif + jenis cuti aktif tanpa login — pola identik
-- get_attendance_checkin_info.
create or replace function public.get_leave_request_info(p_slug text)
returns table (
  business_id uuid,
  business_name text,
  employee_id uuid,
  employee_name text,
  leave_type_id uuid,
  leave_type_name text
)
language sql
security definer
set search_path = ''
as $$
  select b.id, b.name, e.id, e.name, lt.id, lt.name
  from public.businesses b
  join public.employees e on e.business_id = b.id
    and e.active = true
    and e.deleted_at is null
  cross join public.leave_types lt
  where b.leave_request_slug = p_slug
    and lt.business_id = b.id
    and lt.active = true
  order by e.created_at asc, lt.created_at asc;
$$;

grant execute on function public.get_leave_request_info(text) to anon, authenticated;

-- RPC submit pengajuan cuti publik — business/employee/leave_type
-- di-resolve & divalidasi DI DALAM fungsi (bukan dipercaya dari client),
-- pola sama submit_petty_cash_kasbon_public di KasirKu.
create or replace function public.submit_leave_request_public(
  p_slug text,
  p_employee_id uuid,
  p_leave_type_id uuid,
  p_start_date date,
  p_end_date date,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business_id uuid;
  v_days_count int;
  v_new_id uuid;
begin
  select b.id into v_business_id
  from public.businesses b
  where b.leave_request_slug = p_slug;

  if v_business_id is null then
    raise exception 'Link tidak valid.';
  end if;

  if not exists (
    select 1 from public.employees e
    where e.id = p_employee_id and e.business_id = v_business_id
      and e.active = true and e.deleted_at is null
  ) then
    raise exception 'Karyawan tidak ditemukan/tidak aktif.';
  end if;

  if not exists (
    select 1 from public.leave_types lt
    where lt.id = p_leave_type_id and lt.business_id = v_business_id and lt.active = true
  ) then
    raise exception 'Jenis cuti tidak valid.';
  end if;

  if p_end_date < p_start_date then
    raise exception 'Tanggal selesai harus setelah tanggal mulai.';
  end if;

  v_days_count := (p_end_date - p_start_date) + 1;

  insert into public.leave_requests (
    business_id, employee_id, leave_type_id, start_date, end_date, days_count, reason
  ) values (
    v_business_id, p_employee_id, p_leave_type_id, p_start_date, p_end_date, v_days_count, p_reason
  )
  returning id into v_new_id;

  return v_new_id;
end;
$$;

grant execute on function public.submit_leave_request_public(text, uuid, uuid, date, date, text) to anon, authenticated;
