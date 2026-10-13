-- Status pembayaran bisnis (model "sekali beli", bukan langganan berulang).
-- Bisnis baru selalu mulai 'unpaid' — akses ke dashboard dikunci (lihat
-- src/app/business/[businessId]/(dashboard)/layout.tsx) sampai admin
-- platform (bukan owner bisnis) menandai 'paid' lewat halaman /admin.
alter table public.businesses
  add column payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid')),
  add column paid_at timestamptz;

-- Owner bisnis punya kebijakan RLS "for all" (full CRUD) di businesses miliknya
-- sendiri — tanpa trigger ini, owner bisa saja meng-update payment_status
-- jadi 'paid' sendiri lewat request yang dibuat manual (bukan lewat UI resmi),
-- yang membatalkan tujuan gerbang pembayaran ini. Trigger ini menolak
-- perubahan payment_status/paid_at kecuali request datang dari service_role
-- (dipakai khusus oleh halaman /admin lewat src/lib/supabase/service.ts).
create or replace function private.protect_payment_status() returns trigger
language plpgsql as $$
begin
  if auth.role() <> 'service_role'
     and (new.payment_status is distinct from old.payment_status
          or new.paid_at is distinct from old.paid_at) then
    new.payment_status := old.payment_status;
    new.paid_at := old.paid_at;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_payment_status_trigger on public.businesses;
create trigger protect_payment_status_trigger
  before update on public.businesses
  for each row execute function private.protect_payment_status();
