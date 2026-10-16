import { Cfg } from "./Kreasi";

const P = (label: string, value: string, chip?: string) => ({ label, value, chip });
const ABSEN = [P("Absen hari ini", "Check In 07:58", "Tepat waktu"), P("Lokasi", "Di area toko"), P("Selfie", "Tersimpan")];

// 30 video baru. end "harga" = Rp349.000 + kontak WA (10 video), "bersih" = tanpa ajakan (20 video).
export const CONFIGS: Cfg[] = [
  { id: "N01-pov-jam-7-pagi", theme: "dark", end: "bersih", line: "Kabar karyawan, rapi di satu tempat.", scenes: [
    { k: "chat", head: "POV: Pukul 7 pagi, HP owner sudah *bunyi.*", msgs: [{ who: "Rina", text: "Pak, saya izin sakit hari ini.", time: "06:58" }, { who: "Agus", text: "Pak, saya telat 30 menit ya.", time: "07:03" }, { who: "Dewi", text: "Pak, boleh tukar shift?", time: "07:05" }] },
    { k: "cards", head: "Izin dan jam masuk, *tercatat rapi.*", items: [["Izin", "Diajukan lewat portal"], ["Telat", "Terhitung otomatis"], ["Jam masuk", "Lengkap dengan selfie"]] },
    { k: "phone", head: "Semua di *HP karyawan.*" },
  ] },
  { id: "N02-tiga-tanda-butuh-absen-digital", theme: "amber", end: "harga", line: "Absen digital, harga masuk akal.", scenes: [
    { k: "ticks", head: "3 tanda usahamu butuh *absen digital.*", items: [["Rekap absen masih manual", "bikin pusing tiap bulan"], ["Hitungan gaji sering beda", "karyawan jadi ragu"], ["Susah tahu siapa yang masuk", "harus telepon satu-satu"]] },
    { k: "steps", head: "Kalau ketiganya kamu alami, *saatnya beralih.*", items: [{ icon: "user", label: "Karyawan buka link" }, { icon: "cam", label: "Absen selfie + lokasi" }, { icon: "check", label: "Laporan gaji otomatis" }] },
    { k: "phone", head: "Semua *jalan di HP.*" },
  ] },
  { id: "N03-mitos-absen-digital-mahal", theme: "dark", end: "harga", line: "Absen digital yang terjangkau.", scenes: [
    { k: "cards", head: "Mitos: absen digital itu *mahal.*", items: [["Mitos", "Harus langganan tiap bulan"], ["Mitos", "Bayar per karyawan"], ["Fakta", "HrCash: sekali bayar"]] },
    { k: "versus", head: "Bandingkan *biayanya.*", tagOld: "LANGGANAN", old: ["Tiap bulan", "biaya terus berjalan"], tagNow: "SEKALI BAYAR", now: ["Satu kali", "tanpa biaya bulanan"] },
    { k: "phone", head: "Fiturnya tetap *lengkap.*" },
  ] },
  { id: "N04-telat-tiga-kali", theme: "dark", end: "bersih", line: "Telat tercatat. Gaji adil.", scenes: [
    { k: "big", head: "Karyawan telat 3 kali. *Kamu catat di mana?*", value: 3, suffix: "x", label: "telat bulan ini", sub: "Di buku? Di ingatan? Di chat?" },
    { k: "ticks", head: "Semua *tercatat sendiri.*", items: [["Jam masuk", "tercatat dengan selfie"], ["Keterlambatan", "dihitung otomatis"], ["Rekap bulanan", "siap dilihat"]] },
    { k: "slip", head: "Masuk ke *laporan gaji.*" },
  ] },
  { id: "N05-jam-setahun-urus-gaji", theme: "light", end: "bersih", line: "Kembalikan waktumu untuk usaha.", scenes: [
    { k: "big", head: "Berapa jam setahun *kamu habiskan urus gaji?*", value: 60, suffix: " jam", label: "setahun", sub: "Contoh hitungan: 5 jam sebulan." },
    { k: "cross", head: "Waktu itu bisa *dipakai lebih baik.*", bad: ["Rekap absen manual", "Hitung lembur satu-satu", "Kirim slip satu-satu"], good: "Otomatis dari data absen" },
    { k: "slip", head: "Laporan gaji *tinggal dicek.*" },
  ] },
  { id: "N06-stop-slip-lewat-wa", theme: "dark", end: "bersih", line: "Slip gaji tanpa kirim satu-satu.", scenes: [
    { k: "chat", head: "Slip gaji lewat WA satu-satu? *Stop.*", msgs: [{ text: "Slip Rina sudah saya kirim ya.", time: "10:02", out: true }, { who: "Agus", text: "Pak, punya saya belum.", time: "10:05" }, { who: "Dewi", text: "Pak, ini slip punya Rina.", time: "10:09" }] },
    { k: "phone", head: "Slip dicek karyawan *sendiri.*" },
    { k: "ticks", head: "Lebih rapi dan *lebih aman.*", items: [["Tanpa kirim file", "tidak perlu lewat chat"], ["Tanpa salah kirim", "tiap orang lihat miliknya"], ["Rapi per bulan", "bisa dibuka kapan saja"]] },
  ] },
  { id: "N07-lupa-check-out", theme: "dark", end: "bersih", line: "Jam pulang tercatat jelas.", scenes: [
    { k: "chat", head: "'Saya lupa check out, Pak.' *Sering dengar?*", msgs: [{ who: "Budi", text: "Pak, kemarin saya lupa check out.", time: "08:10" }, { text: "Pulangnya jam berapa?", time: "08:11", out: true }, { who: "Budi", text: "Hmm... sekitar jam 5?", time: "08:12" }] },
    { k: "steps", head: "Masuk dan pulang, *tercatat jelas.*", items: [{ icon: "cam", label: "Check In · selfie" }, { icon: "check", label: "Check Out · jam tercatat" }, { icon: "user", label: "Rekap per karyawan" }] },
    { k: "rec", head: "Lokasi *terbaca otomatis.*", part: "map", cap: "Titik biru = posisi karyawan" },
  ] },
  { id: "N08-karyawan-baru-tiga-langkah", theme: "light", end: "harga", line: "Mulai rapi dari karyawan pertama.", scenes: [
    { k: "steps", head: "Karyawan baru masuk? *Absennya 3 langkah.*", items: [{ icon: "user", label: "Beri link ke karyawan" }, { icon: "cam", label: "Karyawan absen selfie" }, { icon: "check", label: "Terekam otomatis" }] },
    { k: "cards", head: "Tanpa ribet, *tanpa tambahan alat.*", items: [["Tanpa", "install aplikasi"], ["Tanpa", "mesin sidik jari"], ["Tanpa", "pelatihan panjang"]] },
    { k: "phone", head: "Cukup *HP masing-masing.*" },
  ] },
  { id: "N09-sudah-di-toko-petanya", theme: "dark", end: "bersih", line: "Absen jujur, ada buktinya.", scenes: [
    { k: "chat", head: "'Sudah di toko, Pak.' *Petanya bilang apa?*", msgs: [{ who: "Budi", text: "Sudah di toko kok, Pak.", time: "08:05" }, { text: "Oke, saya cek petanya ya.", time: "08:06", out: true }] },
    { k: "rec", head: "Lokasi *terbaca di peta.*", part: "map", cap: "Posisi saat absen" },
    { k: "rec", head: "Plus *selfie* saat absen.", part: "selfie", cap: "Foto diambil di tempat" },
  ] },
  { id: "N10-lembur-dua-jam", theme: "amber", end: "bersih", line: "Adil untuk owner dan karyawan.", scenes: [
    { k: "cross", head: "Lembur 2 jam, *dihitung berapa?*", bad: ["Kira-kira saja", "Catat di kertas", "Hitung pakai kalkulator"], good: "Jam lembur terhitung otomatis" },
    { k: "slip", head: "Masuk ke *laporan gaji.*" },
    { k: "ticks", head: "Adil untuk *dua pihak.*", items: [["Jam lembur", "tercatat"], ["Upah lembur", "terhitung"], ["Slip gaji", "menampilkan rinciannya"]] },
  ] },
  { id: "N11-lima-pertanyaan-gajian", theme: "dark", end: "bersih", line: "Semua jawaban ada di portal.", scenes: [
    { k: "cards", head: "5 pertanyaan karyawan *tiap tanggal gajian.*", items: [["1", "Slip gaji saya mana?"], ["2", "Kok potongannya segini?"], ["3", "Lemburnya dihitung berapa?"]] },
    { k: "cards", head: "Dan dua lagi yang *selalu muncul.*", items: [["4", "Sisa cuti saya berapa?"], ["5", "Kasbon saya sisa berapa?"]] },
    { k: "phone", head: "Semua jawabannya *di portal.*" },
  ] },
  { id: "N12-empat-excel-satu-link", theme: "dark", end: "harga", line: "Satu link menggantikan semuanya.", scenes: [
    { k: "chips", head: "Dulu 4 file Excel. *Sekarang 1 link.*", items: ["Excel absen", "Excel lembur", "Excel kasbon", "Excel slip"], note: "Dulu: empat file yang harus dijaga" },
    { k: "link", head: "Cukup *satu link* untuk absen.", pill: "Buka di HP, langsung absen" },
    { k: "phone", head: "Rekap *ikut otomatis.*" },
  ] },
  { id: "N13-absen-lima-belas-detik", theme: "dark", end: "harga", line: "Absen cepat, rekap otomatis.", scenes: [
    { k: "rec", head: "Absen karyawan cuma *15 detik.*", part: "pin", cap: "Ketik 4 angka PIN" },
    { k: "rec", head: "Lokasi *terbaca* sendiri.", part: "map", cap: "Titik biru = posisi" },
    { k: "rec", head: "Selfie, *selesai.*", part: "selfie", cap: "Check In tercatat" },
  ] },
  { id: "N14-selfie-bukan-tanda-tangan", theme: "dark", end: "bersih", line: "Absen dengan bukti wajah.", scenes: [
    { k: "cross", head: "Absen pakai selfie, *bukan sekadar tanda tangan.*", bad: ["Tanda tangan bisa dititip", "Centang bisa dipalsukan"], good: "Selfie wajah saat absen" },
    { k: "rec", head: "Ambil selfie. *Langsung Check In.*", part: "selfie", cap: "Selfie dari browser HP" },
    { k: "ticks", head: "Bukti yang *jelas.*", items: [["Foto wajah", "saat absen"], ["Lokasi", "tercatat"], ["Jam", "otomatis"]] },
  ] },
  { id: "N15-saldo-cuti", theme: "light", end: "bersih", line: "Saldo cuti jelas untuk semua.", scenes: [
    { k: "chat", head: "Saldo cuti numpuk, *tidak ada yang tahu.*", msgs: [{ who: "Agus", text: "Pak, sisa cuti saya berapa?", time: "11:20" }, { who: "Dewi", text: "Saya masih punya cuti kan, Pak?", time: "11:24" }] },
    { k: "phone", head: "Sisa cuti *terlihat di portal.*" },
    { k: "ticks", head: "Cuti jadi *lebih tertib.*", items: [["Cuti diajukan", "dari HP karyawan"], ["Saldo cuti", "terlihat jelas"], ["Riwayat", "tersimpan rapi"]] },
  ] },
  { id: "N16-begadang-rekap", theme: "dark", end: "bersih", line: "Malammu bukan untuk rekap.", scenes: [
    { k: "big", head: "Owner begadang rekap absen. *Cukup.*", text: "23:30", label: "masih merekap absen", sub: "Padahal besok harus buka toko pagi." },
    { k: "versus", head: "Mana yang kamu *pilih?*", tagOld: "MALAM HARI", old: ["Rekap manual", "sampai larut"], tagNow: "SEKARANG", now: ["Laporan siap", "dari data absen"] },
    { k: "slip", head: "Tinggal *dicek.*" },
  ] },
  { id: "N17-slip-menyusul", theme: "dark", end: "bersih", line: "Gaji masuk, slip langsung siap.", scenes: [
    { k: "chat", head: "Gaji ditransfer, *slip menyusul?*", msgs: [{ who: "Rina", text: "Pak, uangnya sudah masuk, slipnya mana?", time: "16:02" }, { text: "Nanti saya kirim ya.", time: "16:10", out: true }] },
    { k: "slip", head: "Slip *siap* bersama laporan gaji." },
    { k: "phone", head: "Karyawan *cek sendiri.*" },
  ] },
  { id: "N18-admin-menumpuk", theme: "amber", end: "bersih", line: "Fokus ke pelanggan, bukan kertas.", scenes: [
    { k: "cards", head: "Kenapa usaha sulit berkembang? *Admin menumpuk.*", items: [["Absen", "rekap manual"], ["Gaji", "hitung manual"], ["Cuti", "catat manual"]] },
    { k: "ticks", head: "Otomatiskan yang *berulang.*", items: [["Absen", "selfie + lokasi"], ["Rekap", "otomatis"], ["Slip gaji", "otomatis"]] },
    { k: "chips", head: "Waktu kembali untuk *usahamu.*", items: ["Layani pelanggan", "Kembangkan menu", "Tambah cabang"] },
  ] },
  { id: "N19-tiga-aturan-absen-adil", theme: "dark", end: "harga", line: "Aturan adil, sistemnya sederhana.", scenes: [
    { k: "cards", head: "3 aturan absen yang *adil untuk semua.*", items: [["Aturan 1", "Jam masuk jelas"], ["Aturan 2", "Ada bukti kehadiran"], ["Aturan 3", "Rekap bisa dicek karyawan"]] },
    { k: "ticks", head: "Semuanya *terpenuhi* satu sistem.", items: [["Jam masuk", "tercatat otomatis"], ["Bukti", "selfie + lokasi"], ["Rekap", "terbuka di portal"]] },
    { k: "phone", head: "Dari satu *link.*", tiles: ABSEN },
  ] },
  { id: "N20-karyawan-jujur", theme: "amber", end: "harga", line: "Adil dan transparan untuk semua.", scenes: [
    { k: "cards", head: "Karyawan jujur *butuh sistem yang adil.*", items: [["Untuk karyawan", "Slip dan absen bisa dicek sendiri"], ["Untuk owner", "Bukti kehadiran jelas"]] },
    { k: "slip", head: "Rincian gaji *transparan.*" },
    { k: "chips", head: "Semua dicatat *apa adanya.*", items: ["Hadir", "Telat", "Lembur", "Cuti"] },
  ] },
  { id: "N21-potongan-telat", theme: "dark", end: "bersih", line: "Potongan telat yang jelas.", scenes: [
    { k: "versus", head: "Potongan telat: *dicatat atau kira-kira?*", tagOld: "KIRA-KIRA", old: ["'Sepertinya 3 kali'", "tidak ada buktinya"], tagNow: "TERCATAT", now: ["3 kali, 47 menit", "lengkap dengan jam"] },
    { k: "slip", head: "Terlihat jelas *di slip gaji.*" },
    { k: "ticks", head: "Karyawan *paham,* owner tenang.", items: [["Telat", "tercatat"], ["Potongan", "terhitung"], ["Rincian", "terlihat di slip"]] },
  ] },
  { id: "N22-satu-link-semua-karyawan", theme: "dark", end: "harga", line: "Satu link, semua karyawan.", scenes: [
    { k: "link", head: "Satu link untuk *semua karyawan.*", pill: "Bagikan sekali, pakai terus" },
    { k: "steps", head: "Tiap orang *absen sendiri.*", items: [{ icon: "user", label: "Pilih nama" }, { icon: "cam", label: "Ambil selfie" }, { icon: "check", label: "Selesai" }] },
    { k: "phone", head: "Rekap *rapi otomatis.*" },
  ] },
  { id: "N23-perlu-install-tidak", theme: "light", end: "bersih", line: "Tanpa install. Langsung pakai.", scenes: [
    { k: "chat", head: "Owner: 'Perlu install?' *Jawabannya: 'Tidak.'*", msgs: [{ who: "Owner", text: "Karyawan harus install aplikasi?", time: "13:00" }, { text: "Tidak. Cukup buka link.", time: "13:01", out: true }] },
    { k: "chips", head: "Jalan di *semua HP.*", items: ["Android", "iPhone", "Browser biasa"], note: "Tanpa Play Store dan App Store" },
    { k: "link", head: "Cukup *buka link.*", pill: "Langsung absen" },
  ] },
  { id: "N24-warung-toko-bengkel-salon", theme: "amber", end: "bersih", line: "Untuk usaha kecil yang ingin rapi.", scenes: [
    { k: "chips", head: "Warung, toko, bengkel, salon: *semua bisa.*", items: ["Warung", "Toko", "Bengkel", "Salon", "Kafe", "Laundry", "Klinik"] },
    { k: "ticks", head: "Cocok untuk *usaha kecil.*", items: [["Karyawan sedikit", "tetap rapi"], ["Pemilik sibuk", "laporan otomatis"], ["Tanpa tim IT", "tinggal pakai"]] },
    { k: "phone", head: "Cukup *dari HP.*" },
  ] },
  { id: "N25-gajian-jam-10-pagi", theme: "dark", end: "harga", line: "Gajian beres lebih cepat.", scenes: [
    { k: "versus", head: "Gajian selesai jam 10 pagi, *bukan jam 10 malam.*", tagOld: "DULU", old: ["Jam 10 malam", "masih menghitung"], tagNow: "SEKARANG", now: ["Jam 10 pagi", "laporan sudah siap"] },
    { k: "slip", head: "Laporan gaji *otomatis.*" },
    { k: "ticks", head: "Tinggal *cek dan bayar.*", items: [["Absen", "terkumpul"], ["Lembur", "terhitung"], ["Slip gaji", "siap"]] },
  ] },
  { id: "N26-jam-kerja-asli", theme: "dark", end: "bersih", line: "Jam kerja yang tercatat jelas.", scenes: [
    { k: "big", head: "Kamu bayar gaji. *Tahu jam kerja aslinya?*", text: "8 jam", label: "yang kamu bayar", sub: "Berapa yang benar-benar tercatat?" },
    { k: "ticks", head: "Jam kerja *terlihat jelas.*", items: [["Jam masuk", "tercatat"], ["Jam pulang", "tercatat"], ["Rekap jam kerja", "per karyawan"]] },
    { k: "slip", head: "Terhubung ke *gaji.*" },
  ] },
  { id: "N27-siapa-rajin-siapa-telat", theme: "dark", end: "bersih", line: "Datanya ada. Keputusan jadi mudah.", scenes: [
    { k: "cards", head: "Siapa rajin, siapa sering telat? *Datanya ada.*", items: [["Rajin", "Hadir tepat waktu"], ["Perlu diingatkan", "Telat tercatat jelas"]] },
    { k: "phone", head: "Rekap kehadiran *di HP.*", tiles: ABSEN },
    { k: "slip", head: "Dan *masuk ke gaji.*" },
  ] },
  { id: "N28-resolusi-administrasi-rapi", theme: "light", end: "harga", line: "Mulai rapi dari hari pertama.", scenes: [
    { k: "ticks", head: "Resolusi tahun depan: *administrasi usaha rapi.*", items: [["Absen karyawan", "tercatat otomatis"], ["Laporan gaji", "otomatis"], ["Rekap cuti", "jelas"]] },
    { k: "big", head: "Mulai dari *hari pertama.*", text: "1 Jan", label: "mulai rapi tahun depan", sub: "Siapkan dari sekarang." },
    { k: "phone", head: "Siap dipakai *di HP.*" },
  ] },
  { id: "N29-senin-berapa-hadir", theme: "dark", end: "bersih", line: "Kehadiran terlihat dalam sekejap.", scenes: [
    { k: "big", head: "Senin pagi: *berapa yang hadir?*", text: "8/10", label: "karyawan hadir hari ini", sub: "Contoh tampilan rekap." },
    { k: "phone", head: "Cek rekap *di HP.*", tiles: [P("Hadir hari ini", "8 dari 10"), P("Terlambat", "2 orang"), P("Izin", "0 orang")] },
    { k: "steps", head: "Tanpa telepon *satu-satu.*", items: [{ icon: "user", label: "Karyawan absen sendiri" }, { icon: "cam", label: "Selfie + lokasi" }, { icon: "check", label: "Rekap langsung tampil" }] },
  ] },
  { id: "N30-checklist-akhir-bulan", theme: "dark", end: "bersih", line: "Akhir bulan, tinggal klik.", scenes: [
    { k: "ticks", head: "Checklist akhir bulan owner: *tinggal klik.*", items: [["Absen", "terkumpul"], ["Lembur", "terhitung"], ["Kasbon", "terpotong"], ["Slip gaji", "siap"]] },
    { k: "slip", head: "Laporan gaji *jadi sendiri.*" },
    { k: "phone", head: "Karyawan *cek sendiri.*" },
  ] },
];
