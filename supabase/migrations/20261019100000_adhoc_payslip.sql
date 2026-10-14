-- Slip Tidak Tetap: slip gaji ad-hoc/off-cycle (mis. bonus proyek, THR di
-- luar siklus bulanan, pesangon) yang dibuat TANPA lewat
-- buildPayslip()/loadAttendanceSummary — semua kolom nominal & kehadiran
-- tetap default 0, komponennya diisi lewat payslip_adjustments yang sudah
-- ada (tunjangan/potongan bebas), bukan logic baru.

alter table public.payslips
  add column slip_type text not null default 'reguler' check (slip_type in ('reguler', 'tidak_tetap')),
  add column note text;
