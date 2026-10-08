# ABSENKU

Absensi selfie, data karyawan (SDM), dan payroll — produk SaaS berdiri
sendiri. Next.js (App Router, TypeScript, Tailwind) + Supabase (Postgres,
Auth, Storage), dengan database & backend independen (bukan berbagi database
dengan produk lain) supaya bisa dijual ke bisnis mana pun.

## Struktur project

```
src/
  app/
    login/, signup/, forgot-password/, reset-password/, auth/callback/  auth pemilik/admin bisnis
    onboarding/                buat business pertama kali
    dashboard/                 halaman transit, redirect ke /business/[businessId]
    business/[businessId]/(dashboard)/
      employees/                CRUD karyawan, tunjangan-tetap/ (tunjangan berulang per karyawan)
      attendance/                grid absensi manual harian
      shifts/                    shift template + jadwal per karyawan per hari
      leave-types/, leave-requests/  jenis cuti, pengajuan + approval, sisa kuota
      payroll/                   daftar slip, rekap pra-slip, detail slip, kasbon/, pinjaman/
      settings/                  info bisnis, jam kerja, aturan payroll, link absen selfie & link cuti,
                                   late-tiers/ (potongan telat bertingkat), holidays/ (tanggal merah tambahan)
      activity-log/               riwayat aksi sensitif (hapus karyawan, slip lunas, cuti disetujui/ditolak, dst.)
    absen/[slug]/               halaman publik absen selfie (tanpa login)
    cuti/[slug]/                 halaman publik pengajuan cuti (tanpa login)
    api/attendance-checkin/     API route (service-role) untuk proses selfie check-in
  components/
    ledger-manager.tsx           komponen generik ledger karyawan (dipakai kasbon & pinjaman pribadi)
  lib/
    supabase/                   client.ts (browser), server.ts (RSC/actions), service.ts (service-role), middleware.ts
    payroll/                    calc.ts (rumus slip), aggregate.ts (rekap absensi), kasbon.ts, personal-loan.ts, payslip-total.ts
    email/                      resend.ts (client Resend), leave-notifications.ts (email approve/reject cuti, best-effort)
    activity-log.ts              helper logActivity() — best-effort, dipanggil setelah aksi utama berhasil
    types/database.ts           tipe hasil `supabase gen types typescript` (ditulis manual, ganti setelah project di-link)
supabase/
  migrations/                   schema database, urut sesuai modul
```

## Setup

1. Install dependencies (sudah dijalankan saat scaffold, ulangi kalau clone baru):
   ```bash
   npm install
   ```
2. Buat project **baru** di [supabase.com](https://supabase.com/dashboard) (terpisah dari project Supabase manapun yang lain), lalu salin `.env.example` ke `.env.local` dan isi `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` dari Project Settings → API.
3. Link project lokal ke project Supabase yang baru dibuat:
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   ```
4. Jalankan migration ke database Supabase:
   ```bash
   npx supabase db push
   ```
5. Generate TypeScript types dari schema yang sudah jalan (menggantikan tipe yang ditulis manual di `src/lib/types/database.ts`):
   ```bash
   npx supabase gen types typescript --project-id <project-ref> > src/lib/types/database.ts
   ```
6. Di Supabase Dashboard → Authentication → Email, matikan "Confirm email" kalau ingin owner langsung bisa login setelah daftar tanpa verifikasi email dulu (opsional, untuk mempercepat testing).
7. Jalankan dev server:
   ```bash
   npm run dev
   ```

## Urutan migration

1. `20260909100000_extensions_and_helpers.sql` — extension pgcrypto, skema `private`
2. `20260909100100_businesses.sql` — `businesses`, `business_staff`, helper RLS `private.owns_business()`
3. `20260909100200_employees.sql` — data karyawan
4. `20260909100300_attendance.sql` — absensi (manual + selfie), storage bucket `attendance-selfies`, RPC publik `get_attendance_checkin_info`
5. `20260909100400_payslips.sql` — slip gaji + adjustment (tunjangan/potongan bebas)
6. `20260909100500_employee_advances.sql` — kasbon (ledger sederhana)
7. `20260909100600_payroll_rules.sql` — tanggal merah tambahan, skema potongan telat bertingkat
8. `20260910100000_leave.sql` — modul cuti: `leave_types`, `leave_requests`, RPC publik `get_leave_request_info`/`submit_leave_request_public`
9. `20260910100100_shifts.sql` — `shift_templates`, `employee_shift_assignments`, kolom `attendance.shift_template_id`
10. `20260910100200_personal_loans.sql` — `employee_personal_loans`, kolom `payslips.personal_loan_deduction`
11. `20260910100300_recurring_allowances.sql` — `employee_recurring_allowances`
12. `20260911100000_employee_email.sql` — kolom `employees.email` (opsional, dipakai notifikasi)
13. `20260912100000_spam_protection.sql` — `public_submission_log` + cooldown 60 detik di RPC `submit_leave_request_public`
14. `20260912100100_activity_log.sql` — `activity_log`
15. `20260920100000_pph21.sql` — `businesses.pph21_enabled`, `employees.ptkp_status`, kolom `payslips.pph21_amount`/`ptkp_status`/`ter_category`
16. `20261008100000_attendance_security.sql` — geofence (`businesses.office_lat`/`office_lng`/`attendance_radius_m`), PIN absen (`employees.attendance_pin_hash`, `businesses.attendance_pin_required`), bucket `attendance-selfies` jadi privat

Setiap tabel dengan `business_id` diamankan RLS lewat `private.owns_business(business_id)` — akses hanya untuk businesses milik `auth.uid()` yang sedang login (owner atau staff aktif). Halaman `/absen/[slug]`, `/cuti/[slug]`, dan API `/api/attendance-checkin` sengaja tanpa login (karyawan tidak punya akun) — divalidasi manual di server lewat slug + employee id, lewat RPC security definer atau service-role client.

## Cara kerja modul Cuti

Approval cuti tidak menambah logic payroll baru: saat pengajuan **disetujui**, server action meng-upsert baris `attendance` untuk tiap tanggal dalam rentang jadi `status='izin'` — `note` diisi nama jenis cuti kalau jenis itu **berbayar** (masuk jalur "izin berketerangan" = dibayar penuh, logic yang sudah ada), atau dibiarkan kosong kalau **tidak berbayar** (masuk jalur "izin tanpa keterangan" = dipotong sesuai aturan izin bisnis). `attendance.leave_request_id` cuma jejak asal-usul, tidak dipakai kalkulasi.

## Notifikasi email

Opsional (butuh setup terpisah) — saat cuti disetujui/ditolak (baik lewat approval maupun input manual admin), ABSENKU mencoba kirim email ke karyawan lewat [Resend](https://resend.com):

1. Daftar di resend.com, buat API key, isi `RESEND_API_KEY` di `.env.local`.
2. Untuk produksi, verifikasi domain sendiri di Resend lalu isi `RESEND_FROM_EMAIL` (mis. `ABSENKU <noreply@bisnis-anda.com>`). Kalau dikosongkan, dipakai alamat testing bawaan Resend (`onboarding@resend.dev`) — cukup untuk uji coba, tapi terbatas untuk pemakaian nyata.
3. Kalau `RESEND_API_KEY` kosong, atau karyawan tidak punya email (kolom opsional di form Karyawan), email cukup dilewati — tidak pernah menggagalkan approve/reject.

## Keamanan absen selfie

Diatur di Pengaturan → "Keamanan Absen Selfie" dan di form Karyawan:

- **Batas lokasi (geofence)** — isi latitude, longitude (ada tombol "Pakai lokasi saya sekarang"), dan radius dalam meter. Kalau ketiganya terisi, API absen menolak absen tanpa lokasi atau di luar radius (jarak dihitung di server pakai haversine). Kosongkan ketiganya untuk mematikan. Lokasi dari browser tetap bisa dipalsukan oleh pengguna yang niat (aplikasi fake GPS), jadi ini menutup kasus umum, bukan jaminan mutlak.
- **PIN absen** — PIN 4–6 digit per karyawan, disimpan sebagai hash scrypt (`src/lib/attendance/pin.ts`), tidak pernah dikirim ke browser. Karyawan yang punya PIN wajib mengisinya saat absen; kalau "Wajibkan PIN" dicentang, karyawan tanpa PIN tidak bisa absen selfie sama sekali. Setelah 5 kali salah PIN dalam 15 menit, absen karyawan itu dikunci sementara (dicatat di `public_submission_log` dengan kind `absen_pin_gagal`).
- **Foto selfie privat** — bucket `attendance-selfies` tidak lagi publik. Kolom `attendance.check_in_photo_url`/`check_out_photo_url` menyimpan path objek, dan dashboard membuat signed URL berumur 1 jam saat halaman dibuka (`src/lib/attendance/selfie.ts`).

## Proteksi spam link publik

`/absen/[slug]` (API `/api/attendance-checkin`) dan `/cuti/[slug]` (RPC `submit_leave_request_public`) sama-sama dilindungi cooldown sederhana berbasis tabel `public_submission_log` (bukan infra rate-limit eksternal): absen 5 detik per karyawan, pengajuan cuti 60 detik per karyawan. Cukup untuk mencegah spam-klik/bot dasar — bukan pengganti rate-limiting di level CDN/edge kalau butuh proteksi terhadap volumetric flood sungguhan.

## Cetak slip gaji

Halaman detail slip punya tombol "Cetak Slip" yang memicu `window.print()` browser — tidak ada library PDF baru. Layout cetak (`payslip-print-view.tsx`) disembunyikan di layar dan cuma muncul saat print (Tailwind `print:` variant), sementara sidebar/nav dashboard disembunyikan sebaliknya lewat `print:hidden` di `dashboard-shell.tsx`.

## Import karyawan (CSV)

Tombol "Import CSV" di halaman Karyawan menerima file dengan header `nama` (wajib), `tipe_gaji`, `gaji_harian`, `gaji_bulanan`, `divisi`, `email` (semua opsional kecuali nama) — urutan kolom bebas, dicocokkan lewat nama header. Parsing & validasi terjadi di server (`import-actions.ts`), baris yang gagal validasi dilaporkan per baris tanpa menggagalkan baris lain yang valid.

## Pajak (PPh 21) — opsional, ⚠️ verifikasi sebelum dipakai sungguhan

Mati secara default per bisnis (`businesses.pph21_enabled`, toggle di Pengaturan). Kalau dinyalakan:

- Tiap karyawan perlu diisi **Status PTKP** (TK/0 … K/3) di halaman Karyawan — menentukan kategori tabel TER (A/B/C) yang dipakai.
- Saat slip gaji dibuat, PPh 21 dihitung otomatis pakai metode **TER (Tarif Efektif Rata-rata)** sesuai PP 58/2023 & PMK 168/2023 (berlaku sejak Jan 2024): tarif efektif dikalikan langsung ke penghasilan bruto bulan itu (gaji pokok + uang makan + tunjangan hadir + lembur + tunjangan tetap aktif, dikurangi potongan izin/telat — TIDAK termasuk kasbon/pinjaman pribadi karena itu bukan pengurang penghasilan). Tabel tarif lengkap ada di `src/lib/payroll/pph21.ts`.
- Nominal PPh 21 per slip **bisa dikoreksi manual** di halaman detail slip (sama seperti lembur/THR), untuk kasus yang tidak tertangkap kalkulasi otomatis.

**⚠️ Batasan yang disengaja (baca sebelum dipakai untuk pelaporan pajak sungguhan):**
- Tabel tarif TER ditranskrip dari agregator pihak ketiga (bukan hasil parse langsung dokumen resmi DJP), per pengecekan 2026-09-20 — kemungkinan ada perbedaan transkripsi atau perubahan aturan setelah tanggal itu.
- Tidak ada rekonsiliasi/penghitungan ulang tahunan di masa pajak Desember (yang menurut aturan resmi pakai tarif Pasal 17 progresif, bukan TER) — semua bulan termasuk Desember dihitung pakai TER di sini.
- THR/bonus digabung dengan gaji bulan berjalan dan dikenai TER yang sama, bukan dihitung terpisah dengan metode annualisasi seperti aturan resmi.
- **Ini bukan pengganti konsultasi akuntan/konsultan pajak.** Verifikasi ke ahli pajak sebelum memakai angka dari fitur ini untuk SPT/pembayaran pajak sungguhan — kesalahan hitung PPh 21 adalah tanggung jawab pengguna aplikasi, bukan sesuatu yang bisa dijamin akurat oleh kode ini.

## v5 (belum digarap)

Integrasi akuntansi/jurnal (sengaja tidak dibangun — di luar scope ABSENKU, lihat komentar di `supabase/migrations/20260910100200_personal_loans.sql`), notifikasi WhatsApp sebagai alternatif email, billing/subscription, undang admin/staff lewat UI (tabel `business_staff` sudah ada sejak v1, belum ada halamannya), landing page marketing, halaman legal (Syarat & Ketentuan/Privasi).
