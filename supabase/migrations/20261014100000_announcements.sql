-- Papan Informasi: pengumuman dari admin yang tampil di Portal Karyawan.
-- Karyawan tidak login ke Supabase Auth — portal membaca lewat service-role
-- client di server setelah sesi PIN lolos, jadi policy hanya untuk owner/staff.
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  title text not null,
  body text,
  category text not null default 'info' check (category in ('info', 'penting', 'libur', 'acara')),
  pinned boolean not null default false,
  expires_at date,
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists announcements_business_idx
  on public.announcements (business_id, pinned desc, created_at desc);

alter table public.announcements enable row level security;

create policy "Owner manages announcements of own businesses"
on public.announcements for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));
