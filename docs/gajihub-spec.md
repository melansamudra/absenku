# Spesifikasi Referensi: GajiHub (app.gajihub.com)

Hasil riset menu & tampilan GajiHub v0.3.98 (akun trial "Pro Free Trial", 11 Okt 2026).
Tujuan: ABSENKU meniru struktur, alur, dan tampilan ini. Fitur berlabel paket Elite/Champion
di GajiHub tetap ditandai sebagai "terkunci" di sini, tapi bisa kita buka semua.

## 1. Desain & Layout

- Basis UI: **Ant Design** (kelas `ant-*`). Bahasa UI: Indonesia (toggle bahasa ID di header).
- Warna utama (primary): **#E53F6A** (pink-merah). Menu aktif: teks #E53F6A + latar rgba(229,63,106,.1).
- Latar halaman: #F5F5F5. Kartu/konten putih, sidebar & kartu putih.
- Font: system stack (-apple-system, Segoe UI, Roboto…), ukuran dasar **13px**.
- Tombol primer: tinggi 32px, radius 6px, latar #E53F6A, teks putih. Tombol sekunder: outline putih dengan border abu.
- **Sidebar kiri** 256px, putih, logo "GajiHub" di atas, ikon + label, submenu bisa dibuka (chevron), tombol ciutkan (`<`) di bawah.
- **Topbar** setinggi ~56px, latar #E53F6A: kiri kosong; kanan = nama perusahaan (dropdown), bahasa (ID), timeline perubahan data, notifikasi (bel), toggle mode gelap (matahari/bulan), avatar user (dropdown).
- **Breadcrumb** di bawah topbar: `Home › Karyawan › …`.
- Banner kuning (alert) di atas konten: masa trial paket, "Ada N karyawan yang datanya belum lengkap — Lihat Detail →". Bisa ditutup.
- Konten = kartu putih besar: judul halaman (besar, 28px, ringan), tombol aksi di kanan judul (primer merah, sisanya outline), baris filter/tab/pencarian, lalu tabel.
- Tabel: header abu muda, kolom bisa di-sort (ikon panah), checkbox pilih baris, kolom pertama "No.", kolom Nama sticky dengan avatar inisial bulat berwarna + nama link merah, scroll horizontal. Empty state: ilustrasi kotak surat + "Tidak ada data".
- Footer: kotak abu dengan badge Google Play & App Store + "© 2026 GajiHub Software vX".
- Tab bergaya "pill outline": tab aktif border & teks merah. Date strip (kartu hijau muda per tanggal/bulan, aktif = merah) untuk navigasi harian/bulanan.
- Modal putih radius ±8px, judul tebal, ikon X kanan atas, field wajib diberi `*` merah di kiri label. Dialog konfirmasi dengan ikon peringatan kuning + Batal / OK (merah).
- Badge paket: "Fitur ini tersedia di paket Elite/Champion — Upgrade Sekarang".
- Notifikasi toast kecil di atas tengah: "Ada form yang masih belum lengkap".
- Validasi inline: teks merah di bawah field "Silakan pilih …".

## 2. Sidebar (urutan persis)

1. Beranda
2. Karyawan
3. Kehadiran ▾ — Approval Presensi, Jadwal Kerja, Presensi, Izin & Cuti, Kunjungan Klien
4. Pelacakan Lokasi
5. Rekrutmen ▾ — Profil, Manajemen Rekrutmen, Lowongan Pekerjaan, Kandidat
6. Payroll
7. Keuangan ▾ — Kasbon, Reimburse, Petty Cash
8. Approval
9. Timeline
10. Klien
11. Inventaris Aset
12. Laporan
13. Akuntansi
14. Tugas
15. KPI ▾ — Formulir, Jadwal, Evaluasi
16. Time Tracker ▾ — Screenshot, Aktivitas, Download
17. Pengaturan
18. FAQ

## 3. Beranda (Dashboard)

Banner sapaan "Halo {nama}" + CTA demo (bisa ditutup), tombol Print, tombol "Ubah Dashboard" (widget bisa diatur).
Widget (kartu grafik, donut/bar): Usia, Pendidikan, Status Perkawinan, Lama Kerja, Agama, Jenis Kelamin,
Jumlah Karyawan per Organisasi / per Bulan / berdasarkan Status, Gaji per Organisasi bulan ini,
Gaji per Komponen, Total Gaji Karyawan (total & rata-rata + % vs bulan lalu), Reimbursement per Kategori,
Kehadiran Karyawan Hari Ini (tab Terlambat / Izin & Cuti / Belum Presensi), Status Kehadiran Hari Ini,
Statistik Kehadiran (karyawan terbanyak terlambat), Statistik Izin/Cuti, Masa Akhir Kerja Karyawan
(+ yang masa percobaan), Karyawan Terbaik Bulan Ini, Progres Tugas per Karyawan & per Klien
(In Queue/Ongoing/Done), Lokasi Presensi Bulan Ini (di kantor / luar kantor / WFH),
Daftar Pulang Cepat, **Kalender** (Libur Nasional, Cuti Bersama, Even, Izin & Cuti, Ulang Tahun;
panel detail per tanggal).

## 4. Karyawan

**Daftar** (`/employee`): tombol Tambah Karyawan, Import ▾, Ekspor ▾, Aksi Lainnya ▾ (Update Massal Tanda Tangan, Print);
Filter; pencarian; 5 tab kolom: Informasi Pribadi, Kontak, Kepegawaian, Payroll, Login ESS;
indikator kuota "1 / 200"; filter default `is_active=active`.
Import ▾: Import Tambah Karyawan, Update Karyawan, Update Karir, Update ID Karyawan, Rekening Bank, Tanda Tangan.

**Tambah Karyawan — wizard 3 langkah** (stepper 1 Personal › 2 Kepegawaian › 3 Payroll, foto profil bulat dengan ikon kamera di kiri).
Setiap "Selanjutnya" **menyimpan** record (status "belum lengkap") — jadi bisa berhenti kapan saja = jalur pendek.
Karyawan belum lengkap muncul di banner dan klik namanya melanjutkan wizard.

- Langkah 1 Personal — Informasi Pribadi: toggle "Menggunakan ID karyawan yang sudah pernah didaftarkan"; ID Karyawan (auto, mis. `EMP00001`);
  *Nama Lengkap; *Tempat Lahir; *Tanggal Lahir (dd/mm/yyyy); Jenis Kelamin (radio L/P); *Status Perkawinan (Menikah, Belum Menikah, Janda, Duda);
  Golongan Darah; *Agama (Islam, Kristen, Katolik, Hindu, Budha, Konghucu, Lainnya); *Status Warga Negara (WNI/WNA) + negara.
  Informasi Kontak: *Tipe Kartu Identitas (KTP…); *ID Kartu Identitas; No. Kartu Keluarga; *Email; *Nomor Ponsel; Nomor Telepon;
  *Alamat Kartu Identitas (+ *Negara, *Provinsi, *Kota); centang "Alamat Domisili sama dengan Alamat Kartu Identitas";
  *Alamat Domisili (+ negara/provinsi/kota domisili); *Nama Kontak Darurat; *Telepon Darurat.
  Pendidikan Terakhir: Jenjang Akademik, Nama Lembaga, Program Studi. Panel kanan "Lampiran" (drag-drop, maks 10 MB).
- Langkah 2 Kepegawaian: *Status Karyawan (Tetap Permanen, Tetap Percobaan, PKWT; Pekerja Lepas/Tenaga Ahli/Magang/Mitra = Elite);
  *Tanggal Bergabung; *Penempatan Kerja (Baru Direkrut, Demosi, Diangkat Karyawan Tetap, Mutasi, Promosi, Rotasi);
  *Organisasi; *Jabatan; *Pangkat; Golongan; *Jadwal (mis. "Jadwal Kantor"); Lokasi Kantor; Tanggal Masa Akhir Kerja (untuk kontrak, bulan setelah efektif); Lampiran.
  Dropdown Organisasi/Jabatan/Pangkat punya "+ Tambah …" inline.
- Langkah 3 Payroll: *NPWP (+status), NPWP Pemotong (default NPWP perusahaan); BPJS Ketenagakerjaan (No KPJ, tgl efektif);
  BPJS Kesehatan (nomor, tgl efektif, jumlah anggota keluarga); tabel Nomor Rekening (Bank, Cabang, Nama Pemilik, Nomor) + "Tambah Baris".

**Detail karyawan** (`/employee/detail/{id}/...`): judul nama + tombol Kartu Identitas, Ekspor Detail Karyawan, menu ⋮;
kolom kiri: foto, jabatan, menu vertikal Personal / Kehadiran (Harian, Histori Kehadiran, Izin & Cuti) / Keuangan / Karir / Payroll / Riwayat Gaji / Tugas;
konten: sub-tab Personal | Kepegawaian, kartu "Data Pribadi", Identitas, Kontak (tombol "Reset & Kirim Password"), Kontak Darurat, alamat, pendidikan, Tanda Tangan, Lampiran.
Tab Payroll: Riwayat Payroll + tombol **Penyesuaian Gaji** → form "Tambah Payroll": Tanggal Efektif, pilih slip (toggle Gaji Bulanan, THR, + slip baru),
komponen Pendapatan (Gaji Pokok, Uang Lembur `(Gaji Pokok+Tunjangan Tetap)/173 per jam`, Tunjangan Transportasi per kehadiran, Pulsa, Lainnya diinput saat gajian),
Potongan (Koperasi, Lainnya, Denda Keterlambatan manual/dinamis), Total Pendapatan/Potongan/THP, tab Pengaturan Default/Lanjutan, Lampiran.

## 5. Kehadiran

- **Presensi** `/presence/attendance/daily`: tab Harian | Ringkasan; tombol Panduan, Import, Ekspor, Filter, Pelacakan Lokasi, Atur Kebijakan Presensi;
  date strip tanggal bulan berjalan (Hari Ini + picker + panah); kolom: No, Nama, ID Karyawan, Struktur Organisasi, Jabatan, Shift, Status,
  Masuk, Keluar, Mulai/Selesai Istirahat, Lembur, Tracking ("Lihat tracking"), Terlambat, Durasi Keterlambatan, Terlambat Setelah Istirahat, Durasi, Catatan. Status mis. "Bukan Hari Kerja".
- **Approval Presensi**: tab Menunggu Persetujuan / Disetujui / Ditolak / Semua, periode, kolom Nama, Tipe, Waktu, Lokasi, Perangkat & IP, Keterangan, Aksi; tombol Atur Kebijakan Presensi.
- **Jadwal Kerja**: tab Jadwal Tetap | Jadwal Shift; tombol Atur Jadwal Kerja; kolom Nama, Organisasi, Jabatan, Pangkat, Jadwal.
- **Izin & Cuti**: tab Cuti Tahunan, Cuti Khusus, Sakit, Izin, Cuti Tidak Dibayar, Cuti Libur Nasional; Filter, status, Lihat Sisa Cuti, Atur Kebijakan Cuti, Tambah Pengajuan;
  modal "Tambah Pengajuan Cuti Tahunan": *Nama Karyawan, *Tgl Pengajuan, *Tgl Cuti Seharian Penuh (+jumlah hari), *Tgl Cuti Setengah Hari, Keterangan.
  Kolom: Nama, Tgl Pengajuan, Durasi, Periode Cuti, Status Persetujuan.
- **Kunjungan Klien**: Panduan, Import, Filter, Daftar Klien, Atur Kebijakan Kunjungan Klien; kolom Nama, ID, Jabatan, Tanggal, Perusahaan Klien, Masuk, Keluar, Durasi, catatan mulai/selesai, Hari Kerja.
- **Pelacakan Lokasi**: halaman promosi (aktifkan fitur → Atur Pelacakan Lokasi) untuk tim lapangan.

## 6. Payroll & Keuangan

- **Payroll** `/payroll`: Panduan, Tambah Slip Tidak Tetap, Import, Filter, **Generate Payroll** (dialog konfirmasi: semua karyawan periode ini, slip siap/sudah bayar tidak ditimpa), Atur Slip Gaji;
  date strip Januari–Desember, Bulan Ini + dropdown bulan; kolom Slip, Periode, Karyawan, Siap Bayar, Sudah Bayar.
- **Kasbon**: tab Saldo, Menunggu Persetujuan, Disetujui, Ditolak, Pembayaran; Tambah Kasbon, Import, Atur Kebijakan Kasbon.
- **Reimburse**: Tambah Reimbursement, Filter, Atur Kebijakan; kolom Nomor, Nama, Tgl Pengajuan, Judul, Kategori, Rekening, Status, Total Uang, Rincian, Alur Approval.
- **Petty Cash**: Tambah Petty Cash, Atur Kebijakan; kolom Tujuan, Peraturan Terpilih, Tgl Digunakan, Total Pengeluaran, Status.
- **Approval** (lintas modul): tab Menunggu / Disetujui / Ditolak / Semua, Atur Kebijakan Approval.

## 7. Menu lain

- **Rekrutmen**: Profil (halaman perusahaan publik: banner, foto, deskripsi, industri, ukuran, lokasi, situs, galeri; Pratinjau, Bagikan), Manajemen Rekrutmen (tahapan + warna, Template, Siarkan Pesan),
  Lowongan Pekerjaan (tab Dipublikasikan/Ditutup/Draf), Kandidat (Filter, Tambah Kandidat).
- **Timeline**: tab Timeline | Pengumuman, Ekspor, Filter, log aktivitas.
- **Klien**: Tambah Klien, Import, Filter; kolom Nama, Perusahaan, Telepon, Lokasi, Lihat Kunjungan.
- **Inventaris Aset**: Tambah Aset, Filter; kolom Kode Aset, Nama, Digunakan Oleh, Tgl Penggunaan, Status, No. Seri, Aksi.
- **Laporan** (daftar link laporan): Payroll (Ringkasan Gaji, per Organisasi, per Komponen, Pembayaran Gaji); PPh 21/26 (Referensi Data Pajak, Bukti Potong Tahunan Tetap/Lepas,
  Pajak Bulanan Tetap, Rekap Bukti Potong Bulanan/Tahunan); BPJS (Ketenagakerjaan, Kesehatan); Coretax (BPMP, BP21, BP26, A1, A2); Lain-lain; Import & Ekspor.
- **Akuntansi**: promosi integrasi Kledo.
- **Tugas**: ringkasan (Total, Belum Mulai, Berlangsung, Sesuai Jadwal, Terlambat, Terkendala), Performa Karyawan (tab Karyawan/Klien), Aktivitas Terbaru, Tugas Berjalan, papan Kanban 3 kolom (Menunggu Antrian / Sedang Berlangsung / Selesai), Tambah Tugas, Ekspor, Pengaturan Status Tugas.
- **KPI**: Formulir (Tersedia/Draft), Jadwal (Tersedia/Selesai/Draft), Evaluasi.
- **Time Tracker**: Screenshot, Aktivitas (monitoring), Download (app desktop Win/macOS/Linux).
- **FAQ**.

## 8. Pengaturan (`/settings`, tab vertikal di kiri + pencarian)

- **Perusahaan**: Perusahaan (data & logo), Billing; Alur Bisnis, Approval, Penomoran Otomatis; Audit (log perubahan), Kalender (libur & even); Menu Aplikasi.
- **Payroll**: Payroll, Pemetaan Akun COA; Kasbon, Reimburse, Petty Cash.
- **Kehadiran**: Jadwal Kerja, Lembur; Validasi Aplikasi Presensi, Lokasi Kantor, Pelacakan Lokasi; Time Tracker.
- **Cuti**: Cuti Tahunan, Cuti Khusus, Sakit, Cuti Tidak Dibayar, Izin, dll.
  Cuti Tahunan > Pengaturan Umum: periode cuti sesuai tanggal masuk/sama; tanggal reset (1 Januari); bulan kerja sebelum dapat cuti (12); jatah/tahun (12 hari);
  sisa cuti dibawa/batas jumlah/batas hangus/diuangkan; cuti bersama memotong jatah; dihitung hadir; maks hari berturut-turut; H- minimal pengajuan; cuti setengah hari;
  tambah otomatis per bulan; hutang cuti; generate dari libur nasional; maks per bulan/pengajuan; interval antar pengajuan. Tab lain: Kustomisasi Jatah Cuti.
- **Akun & Pengguna**: Pengguna (undang staff), Peran (hak akses), Grup Akses Data, Hak Akses Time Tracker; Profilku, Notifikasi.
- **Layout & Template**: Template Notifikasi, Pengaturan Layout (slip gaji), Kartu Identitas, Pengaturan Translasi, Template Export.
- **Integrasi**: API Key, Fingerprint Connect, Pengaturan SSO, Payment Connect (VA), Webhook.
- **Tugas**: Pengaturan Task.

## 9. Catatan perilaku

- Halaman SPA; deep link butuh waktu muat (spinner); ID karyawan auto (`26MNJ3029` untuk admin, `EMP00001` urut).
- Aplikasi mobile **ESS** (Employee Self Service) untuk karyawan: presensi, cuti, kasbon, dll. Admin kirim/reset password dari detail karyawan.
  **Keputusan ABSENKU: portal karyawan yang sudah ada TETAP dipertahankan** (`/absen/[slug]` absensi selfie, `/cuti/[slug]` pengajuan cuti) sebagai pengganti ESS.
  Hanya sisi admin yang disamakan dengan GajiHub; portal karyawan tidak diubah gayanya/alurnya kecuali diminta.
- Kuota karyawan per paket (200 di trial).
