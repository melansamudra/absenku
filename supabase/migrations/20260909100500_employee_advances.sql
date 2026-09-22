-- Module: kasbon (employee_advances) — ledger sederhana. Berbeda dengan
-- KasirKu (yang mengaitkan kasbon ke alur petty-cash/jurnal akuntansi),
-- ABSENKU tidak punya modul akuntansi, jadi ini murni catatan pemberian
-- kasbon oleh admin: tanggal, nominal, catatan.
--
-- Sisa kasbon (outstanding) DIHITUNG, bukan disimpan sebagai kolom:
--   SUM(employee_advances.amount)
--   − SUM(payslips.kasbon_deduction) dari payslip milik karyawan itu yang
--     sudah paid_at is not null
-- supaya potongan di slip yang masih bisa diedit/dihapus belum dianggap lunas.

create table public.employee_advances (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  date date not null,
  amount numeric(12, 2) not null check (amount > 0),
  note text,
  created_at timestamptz not null default now()
);

create index employee_advances_business_id_idx on public.employee_advances (business_id);
create index employee_advances_employee_id_idx on public.employee_advances (employee_id);

alter table public.employee_advances enable row level security;

create policy "Owner manages employee advances of own businesses"
on public.employee_advances for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));
