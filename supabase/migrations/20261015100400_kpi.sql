-- Modul KPI: Formulir (indikator berbobot) → Jadwal (periode & peserta) → Evaluasi (skor per karyawan).
-- Idempoten. Skor 0–100 per indikator; nilai akhir = rata-rata tertimbang bobot.

create table if not exists public.kpi_forms (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'active')),
  created_at timestamptz not null default now()
);

create table if not exists public.kpi_indicators (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  form_id uuid not null references public.kpi_forms (id) on delete cascade,
  name text not null,
  description text,
  weight numeric(6, 2) not null default 0 check (weight >= 0 and weight <= 100),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.kpi_schedules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  form_id uuid not null references public.kpi_forms (id) on delete restrict,
  name text not null,
  observe_start date not null,
  observe_end date not null check (observe_end >= observe_start),
  status text not null default 'active' check (status in ('draft', 'active', 'done')),
  created_at timestamptz not null default now()
);

create table if not exists public.kpi_reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  schedule_id uuid not null references public.kpi_schedules (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'done')),
  total_score numeric(6, 2),
  notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (schedule_id, employee_id)
);

create table if not exists public.kpi_review_scores (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  review_id uuid not null references public.kpi_reviews (id) on delete cascade,
  indicator_id uuid not null references public.kpi_indicators (id) on delete cascade,
  score numeric(6, 2) not null check (score >= 0 and score <= 100),
  note text,
  unique (review_id, indicator_id)
);

create index if not exists kpi_indicators_form_idx on public.kpi_indicators (form_id);
create index if not exists kpi_schedules_business_idx on public.kpi_schedules (business_id);
create index if not exists kpi_reviews_schedule_idx on public.kpi_reviews (schedule_id);
create index if not exists kpi_reviews_employee_idx on public.kpi_reviews (employee_id);
create index if not exists kpi_review_scores_review_idx on public.kpi_review_scores (review_id);

do $$
declare t text;
begin
  foreach t in array array['kpi_forms', 'kpi_indicators', 'kpi_schedules', 'kpi_reviews', 'kpi_review_scores'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Owner manages %s of own businesses" on public.%I', t, t);
    execute format(
      'create policy "Owner manages %s of own businesses" on public.%I for all using (private.owns_business(business_id)) with check (private.owns_business(business_id))',
      t, t);
  end loop;
end $$;
