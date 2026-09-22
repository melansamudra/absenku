-- Module: tunjangan tetap (recurring allowances) — template tunjangan per
-- karyawan yang otomatis disalin jadi payslip_adjustments (type='tunjangan')
-- setiap kali slip baru dibuat (lihat createPayslip di
-- payroll/rekap/actions.ts). Mengubah/menonaktifkan template TIDAK
-- mengubah slip yang sudah ada (pure snapshot-on-copy, bukan referensi).

create table public.employee_recurring_allowances (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  label text not null,
  amount numeric(12, 2) not null check (amount > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index employee_recurring_allowances_business_id_idx on public.employee_recurring_allowances (business_id);
create index employee_recurring_allowances_employee_id_idx on public.employee_recurring_allowances (employee_id);

alter table public.employee_recurring_allowances enable row level security;

create policy "Owner manages recurring allowances of own businesses"
on public.employee_recurring_allowances for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));
