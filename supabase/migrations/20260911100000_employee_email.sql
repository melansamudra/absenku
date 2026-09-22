-- Kolom email opsional per karyawan — dipakai buat notifikasi email saat
-- pengajuan cuti disetujui/ditolak (lihat src/lib/email/). Nullable karena
-- tidak semua karyawan (mis. staf lapangan tanpa email kerja) akan diisi.
alter table public.employees add column email text;
