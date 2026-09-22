-- Module: payslips — slip gaji per karyawan per periode. Hampir semua kolom
-- adalah SNAPSHOT (disalin dari employees/businesses/attendance saat slip
-- dibuat), disengaja supaya slip yang sudah dibuat tidak pernah berubah diam-
-- diam kalau data master (tarif gaji, pengaturan potongan, dst.) diubah
-- belakangan. Lihat src/lib/payroll/calc.ts untuk rumus lengkapnya.

create table public.payslips (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  employee_id uuid not null references public.employees (id),

  period_start date not null,
  period_end date not null,

  -- Snapshot data karyawan.
  salary_type text not null,
  daily_rate numeric(12, 2) not null default 0,
  monthly_rate numeric(12, 2) not null default 0,

  -- Rekap kehadiran periode ini.
  hadir_count int not null default 0,
  izin_noted_count int not null default 0,
  izin_unnoted_count int not null default 0,
  sakit_count int not null default 0,
  alpa_count int not null default 0,
  off_count int not null default 0,
  late_count int not null default 0,
  hari_kerja_efektif int not null default 0, -- total hari periode − off_count, dipakai buat prorata gaji bulanan

  -- Komponen gaji (nominal final, sudah dihitung sebelum slip dibuat).
  base_pay numeric(12, 2) not null default 0,
  meal_allowance numeric(12, 2) not null default 0,
  attendance_allowance numeric(12, 2) not null default 0,
  lembur_hours numeric(6, 2) not null default 0,
  lembur_rate numeric(12, 2) not null default 0,
  lembur_amount numeric(12, 2) not null default 0,
  thr_amount numeric(12, 2) not null default 0,

  -- Potongan.
  izin_deduction numeric(12, 2) not null default 0,
  late_deduction numeric(12, 2) not null default 0,
  kasbon_deduction numeric(12, 2) not null default 0,

  paid_at timestamptz, -- slip terkunci (tidak bisa diedit) setelah ini diisi
  created_at timestamptz not null default now()
);

create index payslips_business_id_idx on public.payslips (business_id, created_at);

alter table public.payslips enable row level security;

create policy "Owner manages payslips of own businesses"
on public.payslips for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

-- Freeform allowances (tunjangan) and deductions (potongan); unlike the
-- component fields above these can keep being added after the payslip exists
-- (as long as it's unpaid).
create table public.payslip_adjustments (
  id uuid primary key default gen_random_uuid(),
  payslip_id uuid not null references public.payslips (id) on delete cascade,
  type text not null check (type in ('tunjangan', 'potongan')),
  label text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create index payslip_adjustments_payslip_id_idx on public.payslip_adjustments (payslip_id);

alter table public.payslip_adjustments enable row level security;

create policy "Owner manages payslip adjustments of own businesses"
on public.payslip_adjustments for all
using (
  exists (
    select 1 from public.payslips p
    where p.id = payslip_adjustments.payslip_id
      and private.owns_business(p.business_id)
  )
)
with check (
  exists (
    select 1 from public.payslips p
    where p.id = payslip_adjustments.payslip_id
      and private.owns_business(p.business_id)
  )
);
