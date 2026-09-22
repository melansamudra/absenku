-- Log aktivitas ringkas — siapa (email, best-effort dari auth.getUser())
-- melakukan apa. Ditulis lewat helper src/lib/activity-log.ts di aksi-aksi
-- yang paling sensitif (karyawan dihapus, slip ditandai lunas/dibatalkan,
-- cuti disetujui/ditolak, pengaturan bisnis diubah) — bukan setiap mutasi,
-- supaya log tetap berguna dibaca, bukan noise.

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  actor text not null,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index activity_log_business_id_idx on public.activity_log (business_id, created_at);

alter table public.activity_log enable row level security;

create policy "Owner reads activity log of own businesses"
on public.activity_log for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));
