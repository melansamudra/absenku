# Video iklan HrCash (Remotion)

3 video vertikal 1080x1920, 30 fps, 18 detik. Hasil render ada di `../video/`.
Semua nama dan angka di video adalah CONTOH. Video tidak berisi audio (tambahkan musik royalti-bebas saat upload di Meta/Instagram).

- `V1-chat-tanggal-25`: hook "Tiap tanggal 25, HP bos ramai begini" -> Portal Karyawan
- `V2-nol-aplikasi`: hook "Perlu install berapa aplikasi?" -> 0 aplikasi, absen 3 langkah
- `V3-kalender-gajian`: hook "Tanggal 25 tidak lagi bikin pusing" -> alur otomatis -> slip gaji

Jalankan: `npm install`, lalu `npm run studio` (pratinjau) atau `npm run render:v1`.
Area aman Reels/Story: 190 px teratas dan 330 px terbawah dikosongkan dari teks penting.

## V4-rekaman-absen (dari rekaman layar asli)
Video 24 detik dari rekaman layar HP dan screenshot Portal Karyawan (data demo). Kode: `src/Rekaman.tsx`.
Rekaman mentah **tidak** disimpan di repo (bagian akhirnya memuat layar WhatsApp). Untuk render ulang, taruh rekamannya di `public/rec.mp4`
(384x832; jendela potong di `Rekaman.tsx`: buang status bar 46 px atas dan area bawah dari 708 px) lalu `npx remotion render src/index.ts V4-rekaman-absen out/V4.mp4`.
Rekaman yang lebih tajam (dikirim bukan lewat WhatsApp) akan menghasilkan video yang lebih jernih.
