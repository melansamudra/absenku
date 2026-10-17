import { Cfg } from "./Kreasi";

const P = (label: string, value: string, chip?: string) => ({ label, value, chip });
const ABSEN = [P("Absen hari ini", "Check In 07:58", "Tepat waktu"), P("Lokasi", "Di area toko"), P("Selfie", "Tersimpan")];

// Batch 2: 30 video baru (N31-N60). harga = Rp349.000 + kontak WA (10 video), bersih = tanpa ajakan (20 video).
export const CONFIGS2: Cfg[] = [
  { id: "N31-hp-rusak-data-hilang", theme: "dark", end: "bersih", line: "Data aman, tidak hilang.", scenes: [
    { k: "chat", head: "HP karyawan rusak. *Data absennya hilang?*", msgs: [{ who: "Budi", text: "Pak, HP saya rusak. Absen saya hilang ya?", time: "07:30" }, { text: "Tenang, datanya tersimpan di sistem.", time: "07:31", out: true }] },
    { k: "ticks", head: "Data *tersimpan online.*", items: [["Ganti HP", "tetap bisa masuk"], ["Riwayat absen", "tidak ikut hilang"], ["Rekap", "tetap lengkap"]] },
    { k: "phone", head: "Buka lagi dari *HP mana saja.*", tiles: ABSEN },
  ] },
  { id: "N32-resign-riwayat-absen", theme: "light", end: "bersih", line: "Riwayat tersimpan rapi.", scenes: [
    { k: "cross", head: "Karyawan resign, *riwayat absennya ke mana?*", bad: ["Di buku yang hilang", "Di Excel lama", "Di ingatan owner"], good: "Tersimpan rapi per karyawan" },
    { k: "ticks", head: "Riwayat *tidak ikut pergi.*", items: [["Kehadiran", "tercatat per bulan"], ["Telat dan lembur", "tercatat"], ["Slip gaji", "tersimpan"]] },
    { k: "phone", head: "Semua *di satu tempat.*" },
  ] },
  { id: "N33-selisih-50-ribu", theme: "dark", end: "harga", line: "Hitungan jelas, selisih menipis.", scenes: [
    { k: "big", head: "Selisih Rp50.000 per orang. *Setahun jadi berapa?*", text: "Rp6 jt", label: "selisih setahun", sub: "Contoh: Rp50.000 × 10 orang × 12 bulan." },
    { k: "slip", head: "Hitungan *otomatis,* bukan kira-kira." },
    { k: "ticks", head: "Kurangi *salah hitung.*", items: [["Absen", "tercatat"], ["Telat dan lembur", "terhitung"], ["Slip", "menampilkan rincian"]] },
  ] },
  { id: "N34-hujan-deras-telat", theme: "dark", end: "bersih", line: "Aturan jelas, keputusan adil.", scenes: [
    { k: "chat", head: "'Hujan deras, Pak, saya telat.' *Dimaafkan atau dipotong?*", msgs: [{ who: "Agus", text: "Pak, hujan deras, saya telat.", time: "08:20" }, { who: "Agus", text: "Bisa tidak dipotong?", time: "08:21" }] },
    { k: "cards", head: "Putuskan *berdasarkan data.*", items: [["Jam tiba", "Tercatat otomatis"], ["Aturan", "Jelas dan sama untuk semua"], ["Keputusan", "Bisa dijelaskan ke karyawan"]] },
    { k: "slip", head: "Terlihat di *slip gaji.*" },
  ] },
  { id: "N35-jadwal-papan-tulis", theme: "amber", end: "bersih", line: "Jadwal kerja jelas untuk semua.", scenes: [
    { k: "cross", head: "Jadwal kerja masih *di papan tulis?*", bad: ["Papan tulis terhapus", "Foto jadwal di grup WA", "Salah baca shift"], good: "Jadwal kerja ada di portal" },
    { k: "phone", head: "Karyawan *cek sendiri.*" },
    { k: "steps", head: "Tanpa tanya *berulang kali.*", items: [{ icon: "user", label: "Owner atur jadwal" }, { icon: "cam", label: "Karyawan lihat di HP" }, { icon: "check", label: "Tidak ada salah shift" }] },
  ] },
  { id: "N36-surat-peringatan-keterangan", theme: "light", end: "bersih", line: "Urusan SDM lebih tertata.", scenes: [
    { k: "cards", head: "Surat peringatan dan surat keterangan, *dibuat dari nol?*", items: [["Portal", "Ada menu Surat Peringatan"], ["Portal", "Ada menu Surat Keterangan"], ["Hasilnya", "Dokumen SDM lebih tertata"]] },
    { k: "phone", head: "Semua *dalam satu portal.*" },
    { k: "ticks", head: "Lebih *rapi dan terdokumentasi.*", items: [["Peringatan", "tercatat"], ["Keterangan kerja", "tersedia"], ["Riwayat", "mudah dicari"]] },
  ] },
  { id: "N37-pengumuman-tenggelam", theme: "dark", end: "harga", line: "Pengumuman tidak tenggelam lagi.", scenes: [
    { k: "chat", head: "Pengumuman tenggelam *di grup WA?*", msgs: [{ who: "Agus", text: "Pengumuman libur yang mana, Pak?", time: "09:10" }, { who: "Rina", text: "Chat-nya sudah tenggelam.", time: "09:12" }] },
    { k: "cards", head: "Pindahkan ke *papan info.*", items: [["Papan Info", "Pengumuman di satu tempat"], ["Karyawan", "Baca kapan saja"], ["Owner", "Tidak perlu mengulang"]] },
    { k: "phone", head: "Semua karyawan *melihat yang sama.*" },
  ] },
  { id: "N38-siapa-kerjakan-apa", theme: "dark", end: "bersih", line: "Tugas jelas, pekerjaan jalan.", scenes: [
    { k: "cards", head: "Siapa mengerjakan apa *hari ini?*", items: [["Penugasan", "Tugas jelas per karyawan"], ["Kegiatan", "Dicatat oleh karyawan"], ["Owner", "Tinggal memantau"]] },
    { k: "steps", head: "Alurnya *sederhana.*", items: [{ icon: "user", label: "Tugas diberikan" }, { icon: "cam", label: "Karyawan mengerjakan" }, { icon: "check", label: "Hasil tercatat" }] },
    { k: "phone", head: "Semua *terlihat di HP.*" },
  ] },
  { id: "N39-struk-reimburse", theme: "amber", end: "harga", line: "Reimburse rapi, tanpa struk hilang.", scenes: [
    { k: "chat", head: "Struk reimburse numpuk *di dompet karyawan?*", msgs: [{ who: "Dewi", text: "Pak, struk bensin saya yang kemarin...", time: "15:40" }, { text: "Strukmu yang mana ya?", time: "15:41", out: true }] },
    { k: "cards", head: "Ajukan *dari portal.*", items: [["Reimburse", "Diajukan lewat HP"], ["Riwayat", "Tercatat per karyawan"], ["Owner", "Mudah memeriksa"]] },
    { k: "phone", head: "Rapi *tanpa kertas.*" },
  ] },
  { id: "N40-data-lima-tempat", theme: "dark", end: "bersih", line: "Data karyawan, satu tempat.", scenes: [
    { k: "chips", head: "Data karyawan tersebar *di 5 tempat?*", items: ["Excel", "Buku", "Grup WA", "Kertas", "Galeri HP"], note: "Dicari satu per satu saat dibutuhkan" },
    { k: "ticks", head: "Kumpulkan *di satu sistem.*", items: [["Profil karyawan", "tersimpan"], ["Absen dan cuti", "tercatat"], ["Slip gaji", "tersedia"]] },
    { k: "phone", head: "Profil, absen, slip. *Satu portal.*" },
  ] },
  { id: "N41-owner-liburan", theme: "dark", end: "harga", line: "Usaha tertib walau kamu libur.", scenes: [
    { k: "ticks", head: "Owner liburan. *Usaha tetap tertib?*", items: [["Absen", "jalan sendiri"], ["Rekap", "tercatat otomatis"], ["Slip gaji", "siap tanpa kamu"]] },
    { k: "phone", head: "Cek dari *mana saja.*", tiles: ABSEN },
    { k: "steps", head: "Tenang *selama libur.*", items: [{ icon: "user", label: "Karyawan absen sendiri" }, { icon: "cam", label: "Selfie dan lokasi tercatat" }, { icon: "check", label: "Rekap siap saat kembali" }] },
  ] },
  { id: "N42-karyawan-kelima", theme: "light", end: "bersih", line: "Siap tumbuh bersama usahamu.", scenes: [
    { k: "versus", head: "Karyawan ke-5: *masih cukup pakai buku?*", tagOld: "BUKU", old: ["Cukup untuk 2 orang", "makin banyak makin ribet"], tagNow: "SISTEM", now: ["Siap bertambah", "rekap tetap otomatis"] },
    { k: "ticks", head: "Mulai rapi *sebelum ramai.*", items: [["Absen", "tercatat otomatis"], ["Cuti dan lembur", "terdata"], ["Slip gaji", "siap"]] },
    { k: "slip", head: "Laporan gaji *tetap otomatis.*" },
  ] },
  { id: "N43-lupa-pin", theme: "dark", end: "bersih", line: "PIN sederhana, mudah diatur ulang.", scenes: [
    { k: "chat", head: "Lupa PIN? *Tenang, ada jalannya.*", msgs: [{ who: "Rina", text: "Pak, saya lupa PIN absen.", time: "07:45" }, { text: "Admin bisa mengatur ulang.", time: "07:46", out: true }] },
    { k: "rec", head: "PIN cukup *4 angka.*", part: "pin", cap: "Mudah diingat" },
    { k: "ticks", head: "Aman dan *tidak ribet.*", items: [["PIN pribadi", "tiap karyawan"], ["Lupa PIN", "admin bisa atur ulang"], ["Masuk sekali", "tidak minta PIN lagi"]] },
  ] },
  { id: "N44-absen-grup-wa", theme: "dark", end: "bersih", line: "Absen tidak lagi tenggelam di chat.", scenes: [
    { k: "chat", head: "Absen lewat grup WA? *Foto, share lokasi, tenggelam.*", msgs: [{ who: "Budi", text: "[foto selfie] Hadir pak", time: "07:58" }, { who: "Sari", text: "[share lokasi] Hadir", time: "08:01" }, { who: "Agus", text: "Hadir pak", time: "08:04" }] },
    { k: "rec", head: "Lokasi *terbaca otomatis.*", part: "map", cap: "Tanpa share lokasi manual" },
    { k: "ticks", head: "Rekap *tanpa scroll chat.*", items: [["Absen", "satu tempat"], ["Selfie dan lokasi", "otomatis"], ["Rekap", "langsung jadi"]] },
  ] },
  { id: "N45-antre-sidik-jari", theme: "amber", end: "bersih", line: "Cukup HP masing-masing.", scenes: [
    { k: "cross", head: "Antre sidik jari jam 8 pagi? *Cukup HP masing-masing.*", bad: ["Antre di depan mesin", "Mesin error", "Jari basah, gagal"], good: "Absen dari HP sendiri" },
    { k: "steps", head: "Absen tanpa *alat tambahan.*", items: [{ icon: "user", label: "Buka link" }, { icon: "cam", label: "Ambil selfie" }, { icon: "check", label: "Tercatat" }] },
    { k: "phone", head: "Rekap *ikut otomatis.*" },
  ] },
  { id: "N46-excel-kehapus", theme: "dark", end: "harga", line: "Data aman, bukan di satu file.", scenes: [
    { k: "big", head: "File Excel absen *kehapus tidak sengaja.*", text: "Ctrl+Z", label: "kadang sudah terlambat", sub: "Satu klik salah, sebulan data hilang." },
    { k: "ticks", head: "Simpan *di sistem.*", items: [["Data tersimpan online", "otomatis"], ["Tidak bergantung satu file", "lebih aman"], ["Riwayat", "tetap ada"]] },
    { k: "slip", head: "Laporan *selalu tersedia.*" },
  ] },
  { id: "N47-karyawan-lapangan", theme: "dark", end: "bersih", line: "Lapangan atau toko, tercatat jelas.", scenes: [
    { k: "rec", head: "Karyawan lapangan: *lokasi tercatat.*", part: "map", cap: "Posisi saat absen" },
    { k: "cards", head: "Bukan sekadar *'sudah di lokasi'.*", items: [["Lokasi", "Terbaca di peta"], ["Selfie", "Foto saat absen"], ["Jam", "Tercatat otomatis"]] },
    { k: "ticks", head: "Pantau *tanpa menelepon.*", items: [["Absen", "tercatat"], ["Lokasi", "terlihat"], ["Rekap", "otomatis"]] },
  ] },
  { id: "N48-baru-tiga-karyawan", theme: "light", end: "bersih", line: "Mulai rapi sejak kecil.", scenes: [
    { k: "cards", head: "Baru punya 3 karyawan? *Justru waktu yang tepat.*", items: [["Sekarang", "Mudah membiasakan aturan"], ["Nanti", "Makin banyak, makin ribet"], ["Pilihan", "Rapikan dari awal"]] },
    { k: "steps", head: "Mulai *sederhana.*", items: [{ icon: "user", label: "Tambah karyawan" }, { icon: "cam", label: "Bagikan link" }, { icon: "check", label: "Mulai absen" }] },
    { k: "phone", head: "Tumbuh *bersama sistem.*" },
  ] },
  { id: "N49-lima-hal-sebelum-beli", theme: "dark", end: "harga", line: "Pilih yang jelas dan terjangkau.", scenes: [
    { k: "cards", head: "Sebelum beli aplikasi absen, *cek 5 hal ini.*", items: [["1", "Perlu install atau tidak?"], ["2", "Ada bukti selfie dan lokasi?"], ["3", "Laporan gaji otomatis?"]] },
    { k: "cards", head: "Dua lagi *yang sering terlupa.*", items: [["4", "Harga jelas, tanpa kejutan?"], ["5", "Karyawan mudah memakainya?"]] },
    { k: "ticks", head: "HrCash *memenuhi:*", items: [["Tanpa install", "cukup buka link"], ["Selfie dan lokasi", "tercatat"], ["Laporan gaji", "otomatis"]] },
  ] },
  { id: "N50-digital-vs-sidik-jari", theme: "amber", end: "bersih", line: "Pilih yang paling masuk akal.", scenes: [
    { k: "versus", head: "Absen digital vs sidik jari: *mana untuk UMKM?*", tagOld: "SIDIK JARI", old: ["Beli mesin", "antre dan perawatan"], tagNow: "HP SENDIRI", now: ["Tanpa alat tambahan", "cukup buka link"] },
    { k: "ticks", head: "Yang *kamu dapat.*", items: [["Selfie dan lokasi", "bukti jelas"], ["Rekap", "otomatis"], ["Slip gaji", "siap"]] },
    { k: "phone", head: "Semuanya *dari HP.*" },
  ] },
  { id: "N51-hari-pertama-setup", theme: "dark", end: "harga", line: "Mulai hari ini, rapi bulan ini.", scenes: [
    { k: "steps", head: "Hari pertama pakai: *3 langkah saja.*", items: [{ icon: "user", label: "Tambah karyawan" }, { icon: "check", label: "Bagikan link portal" }, { icon: "cam", label: "Karyawan mulai absen" }] },
    { k: "link", head: "Satu link untuk *semua.*", pill: "Bagikan sekali, pakai terus" },
    { k: "phone", head: "Rekap *langsung tampil.*" },
  ] },
  { id: "N52-setahun-riwayat", theme: "dark", end: "bersih", line: "Riwayat rapi, kapan pun dibutuhkan.", scenes: [
    { k: "big", head: "Setahun lagi, *data kehadiran siap dilihat.*", text: "12 bln", label: "riwayat tersimpan rapi", sub: "Contoh: rekap tiap bulan tersedia." },
    { k: "slip", head: "Terhubung *ke gaji.*" },
    { k: "ticks", head: "Dicari *kapan saja.*", items: [["Kehadiran", "per bulan"], ["Telat dan lembur", "tercatat"], ["Slip", "tersimpan"]] },
  ] },
  { id: "N53-gaji-tepat-betah", theme: "light", end: "bersih", line: "Karyawan nyaman, usaha tenang.", scenes: [
    { k: "cards", head: "Gaji tepat waktu, *karyawan lebih betah.*", items: [["Tepat waktu", "Dipercaya karyawan"], ["Rincian jelas", "Kurangi salah paham"], ["Slip siap", "Tidak perlu diminta"]] },
    { k: "slip", head: "Rincian *jelas dan siap.*" },
    { k: "phone", head: "Karyawan *cek sendiri.*" },
  ] },
  { id: "N54-tidak-punya-hrd", theme: "amber", end: "harga", line: "Tanpa HRD, tetap rapi.", scenes: [
    { k: "ticks", head: "Nggak punya HRD? *Tidak masalah.*", items: [["Absen", "diurus sistem"], ["Rekap dan lembur", "terhitung otomatis"], ["Slip gaji", "siap tanpa repot"]] },
    { k: "chips", head: "Cocok untuk *semua peran.*", items: ["Owner", "Kasir", "Admin", "Karyawan"] },
    { k: "phone", head: "Cukup *dari HP.*" },
  ] },
  { id: "N55-tiga-kesalahan-gaji", theme: "dark", end: "bersih", line: "Hindari tiga kesalahan itu.", scenes: [
    { k: "cards", head: "3 kesalahan owner UMKM *soal gaji.*", items: [["Kesalahan 1", "Hitung kira-kira"], ["Kesalahan 2", "Tidak ada slip"], ["Kesalahan 3", "Tidak ada catatan absen"]] },
    { k: "ticks", head: "Solusinya *sederhana.*", items: [["Catat absen", "otomatis"], ["Hitung gaji", "dari data"], ["Beri slip", "lewat portal"]] },
    { k: "slip", head: "Gaji *jelas* untuk kedua pihak." },
  ] },
  { id: "N56-quiz-menit-urus-absen", theme: "dark", end: "bersih", line: "Waktu owner untuk hal yang penting.", scenes: [
    { k: "cards", head: "Quiz: berapa menit *kamu urus absen tiap hari?*", items: [["A", "Kurang dari 5 menit"], ["B", "5 sampai 30 menit"], ["C", "Lebih dari 30 menit"]] },
    { k: "big", head: "Kalau karyawan *absen sendiri.*", text: "Auto", label: "absen langsung tercatat", sub: "Tidak perlu direkap ulang." },
    { k: "phone", head: "Tinggal *cek hasilnya.*", tiles: ABSEN },
  ] },
  { id: "N57-jangan-lakukan-ini", theme: "amber", end: "bersih", line: "Catat semua, rapi dan jelas.", scenes: [
    { k: "cross", head: "Punya karyawan? *Jangan lakukan ini.*", bad: ["Catat absen di ingatan", "Bayar gaji tanpa slip", "Hitung lembur kira-kira"], good: "Catat semua, rapi dan jelas" },
    { k: "ticks", head: "Caranya *mudah.*", items: [["Absen", "selfie dan lokasi"], ["Lembur", "terhitung"], ["Slip", "tersedia di portal"]] },
    { k: "phone", head: "Semua *dari HP.*" },
  ] },
  { id: "N58-bulan-depan-tanpa-buku", theme: "light", end: "harga", line: "Mulai bulan depan, tanpa buku absen.", scenes: [
    { k: "steps", head: "Bulan depan, *mulai absen tanpa buku.*", items: [{ icon: "user", label: "Siapkan karyawan" }, { icon: "check", label: "Bagikan link portal" }, { icon: "cam", label: "Absen selfie dimulai" }] },
    { k: "big", head: "Satu hal *yang perlu kamu bagikan.*", text: "1 link", label: "untuk semua karyawan", sub: "Tanpa install aplikasi." },
    { k: "phone", head: "Siap dipakai *di HP.*" },
  ] },
  { id: "N59-satu-menit-dua-puluh", theme: "dark", end: "bersih", line: "Waktu absen, hemat tiap hari.", scenes: [
    { k: "big", head: "1 menit × 20 karyawan. *Berapa lama absen manual?*", text: "20 mnt", label: "tiap hari untuk absen manual", sub: "Contoh hitungan: 1 menit × 20 karyawan." },
    { k: "cross", head: "Bayangkan *sebulan penuh.*", bad: ["Catat satu per satu", "Rekap ulang di akhir bulan", "Cek ulang kalau ada salah"], good: "Absen sendiri, langsung tercatat" },
    { k: "phone", head: "Waktumu *kembali.*" },
  ] },
  { id: "N60-tidur-tenang-gajian", theme: "dark", end: "harga", line: "Gajian tenang, tidur nyenyak.", scenes: [
    { k: "ticks", head: "Tanggal gajian *tidak lagi menegangkan.*", items: [["Absen", "terkumpul"], ["Lembur", "terhitung"], ["Slip", "siap"]] },
    { k: "slip", head: "Laporan gaji *jadi sendiri.*" },
    { k: "phone", head: "Karyawan *cek sendiri.*" },
  ] },
];
