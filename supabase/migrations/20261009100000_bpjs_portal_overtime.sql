-- Tiga modul sekaligus: BPJS di slip gaji, Portal Karyawan (/karyawan/[slug]),
-- dan pengajuan lembur dengan approval.

-- ---------------------------------------------------------------------------
-- (1) BPJS — opsional, mati default per bisnis (businesses.bpjs_enabled).
-- Tarif iuran tetap (Kesehatan 4%+1%, JHT 3,7%+2%, JP 2%+1%, JKM 0,3%) ada di
-- src/lib/payroll/bpjs.ts; yang berbeda per bisnis/berubah tiap tahun disimpan
-- di sini: tarif JKK (tergantung tingkat risiko lingkungan kerja), batas atas
-- upah JP (disesuaikan BPJS tiap Maret), dan batas atas upah BPJS Kesehatan.
alter table public.businesses
  add column bpjs_enabled boolean not null default false,
  add column bpjs_jkk_rate numeric(5, 2) not null default 0.24
    check (bpjs_jkk_rate >= 0 and bpjs_jkk_rate <= 10),
  add column bpjs_jp_wage_cap numeric(12, 2) not null default 10547400
    check (bpjs_jp_wage_cap > 0),
  add column bpjs_kesehatan_wage_cap numeric(12, 2) not null default 12000000
    check (bpjs_kesehatan_wage_cap > 0),
  add column overtime_approval_required boolean not null default false;

-- Kepesertaan per karyawan (default ikut, karena wajib menurut aturan) +
-- upah dasar perhitungan opsional. Kosong = gaji pokok slip + tunjangan tetap.
alter table public.employees
  add column bpjs_kesehatan boolean not null default true,
  add column bpjs_ketenagakerjaan boolean not null default true,
  add column bpjs_wage_base numeric(12, 2) check (bpjs_wage_base >= 0);

-- Snapshot di slip (prinsip snapshot-on-create seperti komponen lain):
-- bagian karyawan memotong gaji, bagian perusahaan cuma informasi biaya.
alter table public.payslips
  add column bpjs_employee_amount numeric(12, 2) not null default 0,
  add column bpjs_employer_amount numeric(12, 2) not null default 0,
  add column bpjs_detail jsonb;

-- ---------------------------------------------------------------------------
-- (3) Pengajuan lembur. Kalau businesses.overtime_approval_required = true,
-- absen pulang selfie TIDAK lagi mengisi attendance.overtime_hours otomatis;
-- jam lembur baru masuk ke attendance (dan dari situ ke payroll, jalur yang
-- sudah ada) saat pengajuan disetujui admin.
create table public.overtime_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  date date not null,
  hours numeric(4, 2) not null check (hours > 0 and hours <= 12),
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_note text,
  created_at timestamptz not null default now()
);

create index overtime_requests_business_status_idx
  on public.overtime_requests (business_id, status, created_at desc);
create index overtime_requests_employee_idx
  on public.overtime_requests (employee_id, date);

alter table public.overtime_requests enable row level security;

-- Karyawan tidak login (Portal Karyawan pakai sesi PIN di server, lewat
-- service-role client) — jadi policy cuma untuk owner/staff.
create policy "Owner manages overtime requests of own businesses"
on public.overtime_requests for all
using (private.owns_business(business_id))
with check (private.owns_business(business_id));

alter table public.public_submission_log
  drop constraint public_submission_log_kind_check;
alter table public.public_submission_log
  add constraint public_submission_log_kind_check
  check (kind in ('absen', 'cuti', 'absen_pin_gagal', 'lembur'));
