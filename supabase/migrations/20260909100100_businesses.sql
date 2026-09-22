-- Module: businesses — foundation for auth & access. One row per bisnis
-- pelanggan ABSENKU (multi-tenant). Juga menyimpan pengaturan payroll/absensi
-- default untuk bisnis itu (dipakai saat hitung slip gaji & saat proses absen
-- selfie), supaya tidak perlu tabel settings terpisah untuk v1.

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  address text,
  phone text,

  -- Pengaturan absensi: satu jam kerja default per bisnis (v1 tidak
  -- mendukung multi-shift/jadwal per karyawan — lihat catatan v2 di rencana).
  work_start_time time not null default '08:00',
  work_end_time time not null default '17:00',
  -- Token akses link absen selfie publik (bukan dari nomor urut, biar tidak
  -- ditebak) — satu per bisnis, dipasang jadi poster QR di lokasi.
  attendance_qr_slug text unique not null default encode(extensions.gen_random_bytes(9), 'hex'),

  -- Pengaturan payroll: potongan izin tanpa keterangan & telat.
  izin_deduction_mode text not null default 'flat' check (izin_deduction_mode in ('flat', 'full_day')),
  izin_deduction_weekday numeric(12, 2) not null default 0,
  izin_deduction_weekend numeric(12, 2) not null default 0,
  late_deduction_per_occurrence numeric(12, 2) not null default 0,
  -- Tarif lembur default; bisa di-override per karyawan (employees.lembur_rate_per_hour).
  lembur_rate_per_hour numeric(12, 2) not null default 0,

  created_at timestamptz not null default now()
);

create index businesses_owner_id_idx on public.businesses (owner_id);

alter table public.businesses enable row level security;

create policy "Owner has full access to own businesses"
on public.businesses for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- Admin sub-accounts: owner invites a staff member (their own email/password
-- Supabase Auth account). Enforcement of which pages/actions a given staff
-- role may use is app-layer only — at the DB layer, active staff get the
-- SAME access as the owner via owns_business() below. Created before
-- owns_business() because that function's body references this table.
create table public.business_staff (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'staff')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create index business_staff_business_id_idx on public.business_staff (business_id);
create index business_staff_user_id_idx on public.business_staff (user_id);

alter table public.business_staff enable row level security;

-- security definer so this bypasses RLS internally when it queries
-- businesses — used by business_staff's owner-check policy below. Without
-- this, that policy's raw subquery against businesses would run under normal
-- RLS, which (businesses has its own staff-read policy further down,
-- querying business_staff back) creates mutual recursion between the two
-- tables' policies ("infinite recursion detected in policy for relation
-- businesses").
create or replace function private.is_business_owner(check_business_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = check_business_id and b.owner_id = auth.uid()
  );
$$;

-- Owner-only management — checked via is_business_owner(), never via
-- owns_business() (which includes staff themselves; staff must never be able
-- to grant/edit their own or others' access).
create policy "Owner manages staff of own businesses"
on public.business_staff for all
using (private.is_business_owner(business_id))
with check (private.is_business_owner(business_id));

-- A staff member can see their own membership row.
create policy "Staff reads own membership"
on public.business_staff for select
using (user_id = auth.uid());

-- Reusable RLS predicate: does the current user own (or work as active staff
-- for) the business a row belongs to? security definer + stable + fixed
-- search_path so it can be inlined efficiently by the planner and safely
-- referenced from every other table's RLS policy instead of repeating the
-- join.
create or replace function private.owns_business(check_business_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = check_business_id
      and b.owner_id = auth.uid()
  )
  or exists (
    select 1 from public.business_staff s
    where s.business_id = check_business_id
      and s.user_id = auth.uid()
      and s.active
  );
$$;

-- businesses itself is deliberately NOT extended to give staff UPDATE/DELETE
-- (its existing "for all" policy stays owner_id-only) — only a new
-- SELECT-only policy, so staff can never touch owner_id or business settings
-- via a raw API call even though owns_business() now includes them.
create policy "Staff reads own businesses"
on public.businesses for select
using (
  exists (
    select 1 from public.business_staff s
    where s.business_id = businesses.id and s.user_id = auth.uid() and s.active
  )
);
