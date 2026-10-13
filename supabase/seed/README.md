# Data demo ABSENKU

`demo-1.sql` … `demo-4.sql` (dijalankan berurutan) membuat 1 bisnis demo ("Toko Demo Maju Jaya") berisi 10 karyawan, **1 bulan penuh data bulan lalu**, dan **data bulan ini yang masih berjalan** (dari tanggal 1 sampai kemarin), untuk uji coba seluruh alur tanpa mengetik data manual. Ini bukan migrasi — dijalankan manual di Supabase SQL Editor project ABSENKU.

## Cara pakai
1. Daftar akun demo di `/signup` (pakai email terpisah dari akun utama).
2. Buka `demo-1.sql`, ganti `GANTI_DENGAN_EMAIL_AKUN_DEMO` dengan email itu. Hanya bagian 1 yang perlu diubah.
3. Jalankan `demo-1.sql`, lalu `demo-2.sql`, `demo-3.sql`, `demo-4.sql` berurutan, masing-masing di SQL Editor (dipecah karena editor memotong tempelan panjang). Aman diulang dari bagian 1 (bisnis demo lama dihapus, dibuat ulang) — jalankan ulang semuanya tiap beberapa minggu supaya "bulan berjalan"-nya tetap mutakhir.
4. Login dengan akun demo → bisnis "Toko Demo Maju Jaya".

## Karyawan & PIN
| Karyawan | Jabatan | Gaji | PTKP | PIN |
|---|---|---|---|---|
| Budi Santoso | Kasir | Bulanan 4.500.000 + tunjangan jabatan 300.000 | K/1 | 1111 |
| Siti Rahayu | Admin & Gudang | Bulanan 5.200.000 | K/0 | 2222 |
| Andi Pratama | Pelayan | Harian 150.000 (tanpa BPJS) | TK/0 | 3333 |
| Dewi Lestari | Kasir shift siang | Harian 160.000 (tanpa BPJS) | TK/1 | 4444 |
| Rudi Hartono | Supervisor | Bulanan 7.500.000 + tunjangan jabatan 750.000 | K/2 | 5555 |
| Agus Setiawan | Pelayan | Harian 150.000 (tanpa BPJS) | TK/0 | 6666 |
| Maya Anggraini | Kasir | Bulanan 4.600.000 | K/0 | 7777 |
| Hendra Wijaya | Gudang & Stok | Harian 155.000 (tanpa BPJS) | TK/1 | 8888 |
| Nina Kartika | Kasir shift siang | Harian 160.000 (tanpa BPJS) | TK/0 | 9999 |
| Fajar Ramadhan | Office Boy | Harian 140.000 (tanpa BPJS) | TK/0 | 1212 |

Pengaturan bisnis: potongan izin tanpa keterangan = sehari penuh, lembur PP 35/2021, BPJS & PPh21 aktif, persetujuan lembur wajib, PIN wajib saat absen selfie, libur perusahaan di hari ke-17, potongan telat bertingkat (≥15 mnt Rp10.000, ≥30 mnt Rp25.000, ≥60 mnt Rp50.000). Geofence sengaja dimatikan supaya absen selfie bisa dicoba dari mana saja.

## Rekap absensi yang seharusnya muncul
Angka ini untuk seed yang dijalankan di **Oktober 2026** (data bulan lalu = September 2026). Bulan lain menghasilkan variasi telat/lembur yang berbeda; skenario khusus (alpa, sakit, izin, libur) tetap sama untuk 5 karyawan pertama. 5 karyawan baru (Agus, Maya, Hendra, Nina, Fajar) tidak punya skenario khusus — datanya selalu "hadir" dengan variasi telat/lembur acak.

| Karyawan | Hadir | Telat | Izin (ket.) | Izin (tanpa ket.) | Sakit | Alpa | Libur | Lembur (jam) |
|---|---|---|---|---|---|---|---|---|
| Andi Pratama | 23 | 5 | 0 | 1 | 0 | 1 | 1 | 1,5 |
| Budi Santoso | 24 | 2 | 1 | 0 | 0 | 0 | 1 | 7,0 |
| Dewi Lestari | 23 | 0 | 0 | 0 | 2 | 0 | 1 | 0 |
| Rudi Hartono | 25 | 2 | 0 | 0 | 0 | 0 | 1 | 7,5 |
| Siti Rahayu | 23 | 6 | 2 | 0 | 0 | 0 | 1 | 0 |
| Agus, Maya, Hendra, Nina, Fajar | 26 (semua hadir) | bervariasi (acak) | 0 | 0 | 0 | 0 | 0 | bervariasi (acak) |

Andi dan Dewi punya 3 absen terakhir **bulan lalu** yang belum diverifikasi (untuk uji alur verifikasi). **Bulan ini (berjalan)**: semua 10 karyawan punya absensi dari tanggal 1 sampai kemarin (hadir, variasi telat/lembur acak); 2 hari terakhir sengaja belum diverifikasi admin untuk semua karyawan, supaya ada antrean verifikasi yang realistis. Selain itu ada: 3 pengajuan cuti (disetujui/menunggu/ditolak), 5 pengajuan lembur, 3 reimbursement (disetujui/menunggu/ditolak), 2 kasbon, 1 pinjaman pribadi (Rudi 2.000.000), 5 tugas, 4 kegiatan, 2 surat (SP1 Andi, SK Siti), 3 pengumuman.

## Daftar cek uji coba
**Admin**
- [ ] Absensi: grid bulan lalu & bulan ini terisi; telat/lembur tampil; verifikasi absen yang belum diverifikasi.
- [ ] Payroll → Rekap periode bulan lalu: hadir/telat/izin/sakit/alpa sama dengan tabel di atas (5 karyawan pertama).
- [ ] Buat slip untuk kesepuluh karyawan. Periksa: potongan alpa & izin tanpa keterangan Andi, potongan telat bertingkat, lembur PP 35 Rudi, BPJS (Budi, Siti, Rudi, Maya saja), PPh21, potongan kasbon & pinjaman, tunjangan jabatan.
- [ ] Hitung manual satu slip (mis. Budi) dan bandingkan dengan slip di aplikasi.
- [ ] Cuti: setujui permintaan Rudi; tolak lalu setujui ulang; cek sisa kuota.
- [ ] Lembur: setujui pengajuan yang menunggu; cek jamnya masuk ke absensi.
- [ ] Reimbursement: setujui punya Siti; cek masuk slip.
- [ ] Surat: buat SP2 untuk Andi, cetak.
- [ ] Papan Informasi: tambah, sematkan, hapus.

**Portal karyawan** (`/karyawan/<slug>` — slug ada di Pengaturan)
- [ ] Login Rudi (5555). Beranda, jadwal, kehadiran, gaji, kasbon/pinjaman tampil benar.
- [ ] Ajukan lembur & reimbursement, lihat statusnya berubah setelah admin memutuskan.
- [ ] Tugas: ubah status; Kegiatan: lapor baru; Surat: Andi melihat SP1; Profil: NIK & rekening tersamar, unggah foto.
- [ ] PIN salah 5 kali → terkunci sementara.
- [ ] Absen selfie dari HP (`/absen/<slug>`) dengan PIN.
