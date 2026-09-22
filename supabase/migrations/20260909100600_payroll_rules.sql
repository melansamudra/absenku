-- Module: aturan payroll tambahan — tanggal merah (di luar akhir pekan
-- mingguan) dan skema potongan telat bertingkat. Keduanya opsional; kalau
-- kosong, kalkulasi payroll jatuh ke default flat di businesses
-- (late_deduction_per_occurrence).

create table public.payroll_holidays (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  holiday_date date not null,
  label text,
  created_at timestamptz not null default now(),
  unique (business_id, holiday_date)
);

create index payroll_holidays_business_id_idx on public.payroll_holidays (business_id);

alter table public.payroll_holidays enable row level security;

create policy "Owner manages payroll holidays of own businesses"
on public.payroll_holidays for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

-- Skema "telat > N menit = potong Rp Y". Kalau bisnis tidak punya baris di
-- sini sama sekali, payroll pakai businesses.late_deduction_per_occurrence
-- (flat per kejadian, tanpa lihat jumlah menit).
create table public.late_deduction_tiers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  threshold_minutes int not null check (threshold_minutes >= 0),
  amount numeric(12, 2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (business_id, threshold_minutes)
);

create index late_deduction_tiers_business_id_idx on public.late_deduction_tiers (business_id);

alter table public.late_deduction_tiers enable row level security;

create policy "Owner manages late deduction tiers of own businesses"
on public.late_deduction_tiers for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));
