-- Proteksi spam sederhana buat endpoint publik tanpa login (/absen/[slug],
-- /cuti/[slug]) — bukan infra rate-limit eksternal (Redis/Upstash dll),
-- cukup tabel log + cek cooldown di dalam RPC/route yang sudah ada. Tidak
-- ada policy INSERT/SELECT untuk anon/authenticated: hanya security definer
-- function (RPC cuti) dan service-role client (API route absen) yang boleh
-- menulis/membaca, sama-sama sudah bypass RLS by design.
create table public.public_submission_log (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  kind text not null check (kind in ('absen', 'cuti')),
  employee_id uuid not null references public.employees (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index public_submission_log_lookup_idx
  on public.public_submission_log (business_id, kind, employee_id, created_at);

alter table public.public_submission_log enable row level security;

-- Owner boleh baca (buat keperluan debug/audit lewat SQL editor kalau perlu)
-- — tapi sengaja TIDAK ada policy write untuk siapa pun; satu-satunya jalur
-- tulis adalah RPC security definer / service-role client di bawah, yang
-- keduanya bypass RLS.
create policy "Owner reads submission log of own businesses"
on public.public_submission_log for select
using (private.owns_business(business_id));

-- Tambah cooldown 60 detik per karyawan sebelum submit_leave_request_public
-- benar-benar insert — mencegah spam-klik/bot ngirim banyak pengajuan cuti
-- sekaligus. create or replace di atas fungsi yang sudah ada di
-- 20260910100000_leave.sql.
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

  if exists (
    select 1 from public.public_submission_log l
    where l.business_id = v_business_id
      and l.kind = 'cuti'
      and l.employee_id = p_employee_id
      and l.created_at > now() - interval '60 seconds'
  ) then
    raise exception 'Tunggu sebentar sebelum mengajukan lagi.';
  end if;

  insert into public.public_submission_log (business_id, kind, employee_id)
  values (v_business_id, 'cuti', p_employee_id);

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
