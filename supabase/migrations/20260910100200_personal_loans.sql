-- Module: pinjaman pribadi (personal loans) — ledger terpisah dari kasbon
-- (employee_advances), beda tujuan/akun tapi pola identik: sisa pinjaman
-- dihitung on-read (SUM(amount) - SUM(payslips.personal_loan_deduction dari
-- slip yang sudah paid_at)), bukan kolom "settled" tersimpan. Tidak ada
-- integrasi akuntansi/jurnal, sama seperti kasbon versi ABSENKU.

create table public.employee_personal_loans (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  date date not null,
  amount numeric(12, 2) not null check (amount > 0),
  note text,
  created_at timestamptz not null default now()
);

create index employee_personal_loans_business_id_idx on public.employee_personal_loans (business_id);
create index employee_personal_loans_employee_id_idx on public.employee_personal_loans (employee_id);

alter table public.employee_personal_loans enable row level security;

create policy "Owner manages personal loans of own businesses"
on public.employee_personal_loans for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

alter table public.payslips
  add column personal_loan_deduction numeric(12, 2) not null default 0;
