# Analisa perkiraan closing iklan gambar HrCash

> **Ini skenario, bukan ramalan.** Angka konversi di bawah adalah kisaran umum untuk iklan Meta di Indonesia dan penjualan software ke UMKM, **bukan data HrCash**. Ganti dengan angka nyata setelah tes 3 hari (CTR, biaya per chat, dan jumlah yang bayar).

## Asumsi dasar
- Harga Rp289.000 sekali bayar. Pembayaran manual (daftar, transfer, admin tandai lunas).
- Tujuan klik: WhatsApp (percakapan dengan calon pembeli). Kalau lewat landing page, biaya per chat biasanya lebih tinggi.
- Budget uji: Rp100.000 per hari selama 30 hari = **Rp3.000.000**.
- Margin kotor per penjualan ≈ **Rp240.000** (harga dikurangi bagian biaya server dan waktu support; angka tebakan, sesuaikan dengan biayamu).
- Titik impas biaya per closing (CAC) ≈ Rp240.000.

## Tiga skenario untuk budget Rp3 juta

| | Pesimis | Realistis | Optimis |
|---|---|---|---|
| Biaya per chat WhatsApp | Rp25.000 | Rp12.000 | Rp6.000 |
| Jumlah chat | 120 | 250 | 500 |
| Chat yang jadi pembeli | 4% | 8% | 15% |
| **Closing** | **~5** | **~20** | **~75** |
| Omzet | Rp1,4 jt | Rp5,8 jt | Rp21,7 jt |
| Biaya per closing (CAC) | Rp600.000 | Rp150.000 | Rp40.000 |
| Laba setelah iklan | **-Rp1,8 jt** | **+Rp1,8 jt** | **+Rp15 jt** |

Rentangnya lebar karena memang belum ada data. Yang paling menentukan: **berapa % chat yang akhirnya bayar** dan **biaya per chat**.

## Seberapa besar pengaruh "foto seperti itu"
- Gambar statis biasanya **lebih murah dibuat** tetapi untuk audiens dingin sering **kalah dari video pendek** dalam CTR. Karena itu tes gambar dulu, lalu video untuk hook pemenang.
- Selisih antar-kreatif bisa 2–3 kali lipat biaya per klik. Itu sebabnya 24+11 hook dibuat: yang bagus ketahuan lewat tes, bukan lewat tebakan.
- Pesan yang kamu pilih (Portal Karyawan, tanpa install, laporan otomatis) kuat karena **konkret dan mudah dibayangkan**. Ini pesan fungsi, bukan pesan emosi, jadi cocok untuk pemilik usaha yang praktis.

## Yang paling menaikkan closing (urut dampak)
1. **Kecepatan balas WhatsApp.** Balas dalam 5 menit jauh lebih sering jadi daripada balas besok.
2. **Demo yang bisa langsung dilihat** (halaman demo, atau akun uji coba). Calon pembeli Rp289 ribu tetap ingin lihat dulu.
3. **Bukti sosial asli.** Minta 2–3 pelanggan pertama memberi testimoni atau izin menyebut nama usahanya. Jangan memakai testimoni karangan.
4. **Follow-up 3 kali** (hari 0, 1, dan 3). Banyak closing terjadi di follow-up.
5. **Penawaran jelas:** apa yang didapat, cara bayar, dan bantuan setup.
6. **Landing page** dengan harga dan fitur, kalau iklan diarahkan ke web.

## Jalan pintas dengan peluang closing tertinggi
Kamu sudah punya pelanggan **Kasirku** (bisnis yang sudah memakai kasir dan akuntansi). Menawarkan HrCash ke mereka lewat WhatsApp itu **calon pembeli hangat**, dan peluang jadinya biasanya jauh di atas iklan ke orang asing. Cara ini juga gratis. Coba dulu sebelum atau bersamaan dengan iklan.

## Aturan keputusan setelah 3 hari
| Kondisi per iklan | Tindakan |
|---|---|
| Belanja ≥ Rp50.000 dan 0 chat | Matikan |
| Biaya per chat > Rp25.000 | Matikan |
| CTR link < 0,6% | Matikan atau ganti hook |
| Biaya per chat < Rp12.000 dan ada yang bayar | Naikkan budget 20–30% setiap 2 hari |

## Yang bisa membuat hasil lebih buruk dari skenario pesimis
- Tujuan klik ke halaman depan HrCash yang kosong (belum ada harga/fitur).
- Chat dibalas lambat.
- Fitur yang diiklankan belum ter-deploy atau belum diuji (hapus foto selfie, BPJS/PPh 21).
- Server Free Supabase kena batas (egress, pause) saat traffic naik. Lihat analisa batas Free sebelumnya.
- Klaim berlebihan di iklan, yang bisa membuat iklan ditolak Meta.
