-- Bagian 1/3 — Master: Organisasi, Jabatan, Pangkat (jalankan PERTAMA).
-- Aman dijalankan ulang (idempoten).

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (business_id, name)
);
create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (business_id, name)
);
create table if not exists public.ranks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (business_id, name)
);

create index if not exists organizations_business_id_idx on public.organizations (business_id);
create index if not exists positions_business_id_idx on public.positions (business_id);
create index if not exists ranks_business_id_idx on public.ranks (business_id);

alter table public.organizations enable row level security;
alter table public.positions enable row level security;
alter table public.ranks enable row level security;

drop policy if exists "Owner manages organizations of own businesses" on public.organizations;
create policy "Owner manages organizations of own businesses"
on public.organizations for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

drop policy if exists "Owner manages positions of own businesses" on public.positions;
create policy "Owner manages positions of own businesses"
on public.positions for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

drop policy if exists "Owner manages ranks of own businesses" on public.ranks;
create policy "Owner manages ranks of own businesses"
on public.ranks for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));
