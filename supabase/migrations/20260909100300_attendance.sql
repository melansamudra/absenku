-- Module: attendance — absensi harian per karyawan. Diisi lewat dua jalur:
-- (1) admin/owner input manual di dashboard (hadir/izin/sakit/alpa/off), atau
-- (2) karyawan absen sendiri lewat link publik /absen/[slug] (selfie + GPS,
-- tanpa login — lihat get_attendance_checkin_info di bawah dan
-- src/app/api/attendance-checkin/route.ts).

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  date date not null,
  status text not null check (status in ('hadir', 'izin', 'sakit', 'alpa', 'off')),
  -- Untuk status 'izin': ada note = "izin berketerangan" (dispensasi, dibayar
  -- penuh); tanpa note = "izin tanpa keterangan" (kena potongan saat payroll).
  note text,

  -- Keterlambatan (hanya relevan kalau status='hadir'), auto-dihitung saat
  -- check-in selfie dari businesses.work_start_time; bisa dikoreksi manual.
  late boolean not null default false,
  late_minutes int not null default 0,

  check_in_at timestamptz,
  check_in_photo_url text,
  check_in_lat numeric(9, 6),
  check_in_lng numeric(9, 6),
  check_out_at timestamptz,
  check_out_photo_url text,
  check_out_lat numeric(9, 6),
  check_out_lng numeric(9, 6),

  -- Draft jam lembur, auto-dihitung dari check_out_at vs businesses.work_end_time
  -- saat check-out selfie; masih bisa diedit admin sebelum slip gaji dibuat.
  overtime_hours numeric(6, 2) not null default 0,

  verified_by_admin boolean not null default false,
  verified_at timestamptz,

  created_at timestamptz not null default now(),
  unique (employee_id, date)
);

create index attendance_business_id_date_idx on public.attendance (business_id, date);

alter table public.attendance enable row level security;

create policy "Owner manages attendance of own businesses"
on public.attendance for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

-- Storage bucket buat foto selfie absen. Publik-baca (supaya foto bisa
-- ditampilkan di dashboard admin lewat public URL tanpa perlu signed URL) —
-- upload TIDAK lewat kredensial anon langsung (karyawan tidak login), tapi
-- lewat API route pakai service-role client yang sudah validasi slug+employee
-- dulu, jadi tidak perlu policy insert untuk role anon di sini.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('attendance-selfies', 'attendance-selfies', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Public read attendance selfies"
on storage.objects for select
using (bucket_id = 'attendance-selfies');

create policy "Owner deletes attendance selfies of own business"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'attendance-selfies'
  and private.owns_business((string_to_array(name, '/'))[1]::uuid)
);

-- RPC buat halaman absen selfie publik baca nama bisnis, jam kerja, & daftar
-- karyawan aktif tanpa login — security definer, business di-resolve dari
-- slug DI DALAM fungsi (bukan dipercaya dari client), di-grant ke anon.
create or replace function public.get_attendance_checkin_info(p_slug text)
returns table (
  business_id uuid,
  business_name text,
  work_start_time time,
  work_end_time time,
  employee_id uuid,
  employee_name text,
  employee_note text
)
language sql
security definer
set search_path = ''
as $$
  select b.id, b.name, b.work_start_time, b.work_end_time, e.id, e.name, e.note
  from public.businesses b
  join public.employees e on e.business_id = b.id
    and e.active = true
    and e.deleted_at is null
  where b.attendance_qr_slug = p_slug
  order by e.created_at asc;
$$;

grant execute on function public.get_attendance_checkin_info(text) to anon, authenticated;
