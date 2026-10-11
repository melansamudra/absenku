-- Bagian 2/3 — Kolom profil karyawan (jalankan KEDUA, setelah bagian 1).
-- Idempoten: kolom yang sudah ada (mis. join_date) dilewati, bukan error.
-- Semua kolom NULLABLE / punya default, jadi data lama tidak rusak.

alter table public.employees
  -- Langkah 1: Personal
  add column if not exists employee_code text,
  add column if not exists birth_place text,
  add column if not exists birth_date date,
  add column if not exists gender text check (gender in ('L', 'P')),
  add column if not exists marital_status text,
  add column if not exists blood_type text,
  add column if not exists religion text,
  add column if not exists citizenship text not null default 'WNI',
  add column if not exists citizenship_country text,
  add column if not exists id_type text not null default 'KTP',
  add column if not exists id_number text,
  add column if not exists family_card_number text,
  add column if not exists phone text,
  add column if not exists phone_alt text,
  add column if not exists id_address text,
  add column if not exists id_country text default 'Indonesia',
  add column if not exists id_province text,
  add column if not exists id_city text,
  add column if not exists domicile_same boolean not null default true,
  add column if not exists dom_address text,
  add column if not exists dom_country text default 'Indonesia',
  add column if not exists dom_province text,
  add column if not exists dom_city text,
  add column if not exists emergency_name text,
  add column if not exists emergency_phone text,
  add column if not exists edu_level text,
  add column if not exists edu_institution text,
  add column if not exists edu_major text,
  -- Langkah 2: Kepegawaian
  add column if not exists employment_status text,
  add column if not exists join_date date,
  add column if not exists placement_type text,
  add column if not exists organization_id uuid references public.organizations (id) on delete set null,
  add column if not exists position_id uuid references public.positions (id) on delete set null,
  add column if not exists rank_id uuid references public.ranks (id) on delete set null,
  add column if not exists grade text,
  -- Langkah 3: Payroll
  add column if not exists npwp text,
  add column if not exists bpjs_tk_number text,
  add column if not exists bpjs_tk_effective date,
  add column if not exists bpjs_kes_number text,
  add column if not exists bpjs_kes_effective date,
  add column if not exists bpjs_family_count integer,
  -- false = wizard belum selesai ("karyawan belum lengkap"). Data lama = true.
  add column if not exists setup_complete boolean not null default true;

create unique index if not exists employees_business_code_uniq
  on public.employees (business_id, employee_code)
  where employee_code is not null;

create index if not exists employees_organization_id_idx on public.employees (organization_id);
create index if not exists employees_position_id_idx on public.employees (position_id);
create index if not exists employees_rank_id_idx on public.employees (rank_id);
