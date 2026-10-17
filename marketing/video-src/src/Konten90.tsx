import { Cfg } from "./Kreasi";

const P = (label: string, value: string, chip?: string) => ({ label, value, chip });
const ABSEN = [P("Absen hari ini", "Check In 07:58", "Tepat waktu"), P("Lokasi", "Di area toko"), P("Selfie", "Tersimpan")];
const INFO = "Informasi umum. Cek aturan terbaru dan kondisi usahamu.";

// Batch 3: 30 video edukasi + promosi untuk Reels/TikTok (20-25 dtk), tanpa harga dan kontak.
export const CONFIGS3: Cfg[] = [
  // ================= EDUKASI =================
  { id: "E01-cara-hitung-lembur", theme: "dark", end: "bersih", line: "Lembur jelas, hitungan tenang.", scenes: [
    { k: "big", head: "Cara hitung lembur: *mulai dari upah sejam*", text: "÷173", label: "upah sejam = upah sebulan ÷ 173", sub: "Dasar hitung lembur (PP 35/2021)." },
    { k: "formula", head: "Tarif lembur *di hari kerja*", big: "1,5x", rows: [["Jam pertama", "1,5 × upah sejam"], ["Jam berikutnya", "2 × upah sejam"]], note: "Berlaku untuk lembur di hari kerja." },
    { k: "formula", head: "Contoh *hitungannya*", big: "Rp165.000", rows: [["Gaji Rp5.190.000", "Upah sejam Rp30.000"], ["Lembur 3 jam", "45.000 + 60.000 + 60.000"]], note: "Contoh sederhana. " + INFO },
    { k: "ticks", head: "Biar lembur *tidak salah hitung*", items: [["Catat jam masuk dan pulang", "akurat"], ["Pakai satu rumus", "konsisten"], ["Tulis rinciannya di slip", "transparan"]] },
  ] },
  { id: "E02-batas-lembur", theme: "dark", end: "bersih", line: "Lembur tercatat, usaha tertib.", scenes: [
    { k: "big", head: "Lembur itu *ada batasnya.*", text: "4 jam", label: "maksimal lembur per hari", sub: "Informasi umum (PP 35/2021)." },
    { k: "big", head: "Dan juga *per minggu.*", text: "18 jam", label: "maksimal lembur per minggu", sub: INFO },
    { k: "cards", head: "Kenapa *wajib dicatat?*", items: [["Karyawan", "Lembur dibayar sesuai aturan"], ["Usaha", "Ada catatan jam yang jelas"], ["Bersama", "Menghindari salah paham"]] },
    { k: "ticks", head: "Catat tanpa ribet", items: [["Jam masuk dan pulang", "tercatat otomatis"], ["Lembur", "diajukan lewat portal"], ["Rekap", "siap saat gajian"]] },
  ] },
  { id: "E03-cuti-tahunan-12-hari", theme: "amber", end: "bersih", line: "Saldo cuti jelas untuk semua.", scenes: [
    { k: "big", head: "Cuti tahunan: *berapa hari, kapan didapat?*", value: 12, suffix: " hari", label: "cuti tahunan", sub: "Setelah 12 bulan kerja terus-menerus. " + "Informasi umum." },
    { k: "cards", head: "Tips *mengelola cuti*", items: [["Catat", "Saldo cuti tiap karyawan"], ["Atur", "Jadwal agar operasional jalan"], ["Komunikasikan", "Aturan cuti sejak awal"]] },
    { k: "phone", head: "Saldo cuti *terlihat sendiri.*" },
    { k: "ticks", head: "Cuti jadi *lebih tertib.*", items: [["Pengajuan", "dari HP karyawan"], ["Sisa cuti", "terlihat jelas"], ["Riwayat", "tersimpan rapi"]] },
  ] },
  { id: "E04-thr-hak-karyawan", theme: "dark", end: "bersih", line: "THR tertib, karyawan tenang.", scenes: [
    { k: "cards", head: "THR: *siapa yang berhak, berapa besarnya?*", items: [["Masa kerja 12 bulan atau lebih", "1 bulan upah"], ["Masa kerja 1-12 bulan", "Dihitung proporsional"], ["Waktu bayar", "Paling lambat 7 hari sebelum hari raya"]] },
    { k: "formula", head: "Contoh *THR proporsional*", big: "Rp2 jt", rows: [["Gaji Rp4.000.000", "Masa kerja 6 bulan"], ["Hitungan", "6/12 × Rp4.000.000"]], note: "Contoh sederhana. " + INFO },
    { k: "ticks", head: "Siapkan *dari awal tahun*", items: [["Sisihkan tiap bulan", "agar tidak kaget"], ["Catat masa kerja", "tiap karyawan"], ["Hitung lebih awal", "sebelum hari raya"]] },
    { k: "slip", head: "Rincian *jelas di slip.*" },
  ] },
  { id: "E05-isi-slip-gaji", theme: "light", end: "bersih", line: "Slip gaji jelas, kepercayaan terjaga.", scenes: [
    { k: "cards", head: "Slip gaji yang baik *isinya apa saja?*", items: [["Pendapatan", "Gaji pokok, tunjangan, lembur"], ["Potongan", "Keterlambatan, kasbon, lainnya"], ["Total diterima", "Angka akhir yang jelas"]] },
    { k: "slip", head: "Contoh *tampilannya.*" },
    { k: "ticks", head: "Manfaat *slip yang jelas*", items: [["Karyawan paham", "dari mana angkanya"], ["Salah paham berkurang", "lebih sedikit debat"], ["Arsip rapi", "bisa dibuka kapan saja"]] },
    { k: "phone", head: "Karyawan *cek sendiri.*" },
  ] },
  { id: "E06-lima-cara-kurangi-telat", theme: "dark", end: "bersih", line: "Tepat waktu itu bisa dibiasakan.", scenes: [
    { k: "cards", head: "5 cara mengurangi karyawan *sering telat*", items: [["1", "Tetapkan jam masuk yang jelas"], ["2", "Catat kehadiran otomatis"], ["3", "Apresiasi yang tepat waktu"]] },
    { k: "cards", head: "Dua lagi *yang membantu*", items: [["4", "Ajak bicara jika sering berulang"], ["5", "Beri keringanan untuk alasan wajar"]] },
    { k: "ticks", head: "Dukung dengan *data.*", items: [["Jam masuk", "tercatat dengan selfie"], ["Telat", "terhitung otomatis"], ["Rekap", "terlihat per bulan"]] },
    { k: "phone", head: "Semua *terlihat jelas.*", tiles: ABSEN },
  ] },
  { id: "E07-checklist-hari-pertama", theme: "light", end: "bersih", line: "Hari pertama yang rapi.", scenes: [
    { k: "steps", head: "Hari pertama karyawan baru: *checklist owner*", items: [{ icon: "user", label: "Kenalkan dengan tim" }, { icon: "check", label: "Jelaskan jam kerja" }, { icon: "cam", label: "Ajarkan cara absen" }] },
    { k: "cards", head: "Jangan *lupa siapkan.*", items: [["Siapkan", "Akses absen dan portal"], ["Jelaskan", "Aturan cuti dan lembur"], ["Tentukan", "Jadwal evaluasi 1 bulan"]] },
    { k: "link", head: "Cukup *satu link.*", pill: "Bagikan dan langsung absen" },
    { k: "ticks", head: "Karyawan *cepat paham.*", items: [["Absen", "tanpa install"], ["Cuti dan slip", "dari portal"], ["Aturan", "jelas sejak awal"]] },
  ] },
  { id: "E08-kesalahan-rekrut-umkm", theme: "amber", end: "bersih", line: "Rapi sejak karyawan pertama.", scenes: [
    { k: "cards", head: "3 kesalahan UMKM *saat merekrut karyawan*", items: [["Kesalahan 1", "Tidak ada uraian tugas"], ["Kesalahan 2", "Gaji tidak dibahas di awal"], ["Kesalahan 3", "Aturan tidak tertulis"]] },
    { k: "ticks", head: "Solusi *sederhana*", items: [["Tulis tugas utama", "satu halaman cukup"], ["Bahas gaji di awal", "jelas dan terbuka"], ["Catat aturan", "dan bagikan"]] },
    { k: "steps", head: "Langkah *awalnya*", items: [{ icon: "user", label: "Siapkan data karyawan" }, { icon: "check", label: "Tetapkan aturan" }, { icon: "cam", label: "Mulai catat kehadiran" }] },
    { k: "phone", head: "Semua *tertata.*" },
  ] },
  { id: "E09-tegur-karyawan-telat", theme: "dark", end: "bersih", line: "Tegur dengan data, selesaikan dengan solusi.", scenes: [
    { k: "chat", head: "Menegur karyawan telat *tanpa bikin tersinggung*", msgs: [{ text: "Kemarin kamu telat 3 kali, ada kendala?", time: "10:00", out: true }, { who: "Budi", text: "Maaf Pak, antar anak sekolah dulu.", time: "10:02" }, { text: "Terima kasih jujur. Yuk cari solusinya.", time: "10:03", out: true }] },
    { k: "cards", head: "3 kunci *teguran yang baik*", items: [["Pakai data", "Bukan perasaan"], ["Dengar dulu", "Tanyakan penyebabnya"], ["Sepakati solusi", "Dan tindak lanjut"]] },
    { k: "ticks", head: "Data *membuat percakapan adil.*", items: [["Jam masuk", "tercatat jelas"], ["Jumlah telat", "terlihat per bulan"], ["Riwayat", "tersimpan"]] },
    { k: "phone", head: "Rekap *ada di HP.*", tiles: ABSEN },
  ] },
  { id: "E10-slip-gaji-kepercayaan", theme: "light", end: "bersih", line: "Transparan itu membangun percaya.", scenes: [
    { k: "cards", head: "Slip gaji itu soal *kepercayaan,* bukan sekadar kertas", items: [["Karyawan", "Tahu hak yang diterima"], ["Owner", "Punya catatan yang rapi"], ["Hubungan", "Lebih saling percaya"]] },
    { k: "slip", head: "Rincian yang *terbuka.*" },
    { k: "cross", head: "Hindari *kebiasaan ini.*", bad: ["Gaji tanpa rincian", "Potongan tidak dijelaskan", "Lembur tidak tercatat"], good: "Rincian jelas tiap bulan" },
    { k: "phone", head: "Slip *selalu bisa dibuka.*" },
  ] },
  { id: "E11-mitos-tidak-percaya", theme: "dark", end: "bersih", line: "Bukti membuat semua tenang.", scenes: [
    { k: "cards", head: "Mitos: absen digital berarti *tidak percaya karyawan*", items: [["Mitos", "Absen digital itu tanda curiga"], ["Mitos", "Karyawan jadi merasa diawasi"], ["Fakta", "Catatan jelas melindungi dua pihak"]] },
    { k: "versus", head: "Mana yang *lebih sehat?*", tagOld: "TANPA BUKTI", old: ["Saling curiga", "'katanya sudah masuk'"], tagNow: "ADA CATATAN", now: ["Saling jelas", "data bisa dilihat bersama"] },
    { k: "ticks", head: "Catatan yang *adil.*", items: [["Jam masuk", "terlihat karyawan juga"], ["Telat dan lembur", "terhitung transparan"], ["Rekap", "bisa dicek bersama"]] },
    { k: "phone", head: "Dilihat *dua pihak.*" },
  ] },
  { id: "E12-tiga-hal-calon-karyawan", theme: "amber", end: "bersih", line: "Usaha yang tertata menarik orang baik.", scenes: [
    { k: "cards", head: "3 hal yang dilihat calon karyawan *dari usahamu*", items: [["1", "Gaji dan slip yang jelas"], ["2", "Jam kerja yang jelas"], ["3", "Cuti dan hak yang jelas"]] },
    { k: "ticks", head: "Tunjukkan *lewat sistem.*", items: [["Slip gaji", "tersedia di portal"], ["Jam kerja", "tercatat"], ["Cuti", "bisa diajukan dari HP"]] },
    { k: "phone", head: "Karyawan *merasa dihargai.*" },
    { k: "steps", head: "Mulai *dari yang kecil.*", items: [{ icon: "user", label: "Rapikan data" }, { icon: "check", label: "Tulis aturan" }, { icon: "cam", label: "Gunakan sistem" }] },
  ] },
  { id: "E13-aturan-kehadiran-tertulis", theme: "dark", end: "bersih", line: "Aturan tertulis, hasil adil.", scenes: [
    { k: "steps", head: "Aturan kehadiran: *tulis, jangan hanya lisan*", items: [{ icon: "user", label: "Tentukan jam masuk" }, { icon: "check", label: "Tentukan toleransi telat" }, { icon: "cam", label: "Tentukan konsekuensinya" }] },
    { k: "cards", head: "Isi aturan *yang sebaiknya ada*", items: [["Jam kerja", "Masuk dan pulang"], ["Keterlambatan", "Batas dan konsekuensi"], ["Izin dan cuti", "Cara mengajukan"]] },
    { k: "ticks", head: "Aturan *dijalankan konsisten.*", items: [["Berlaku sama", "untuk semua"], ["Dicatat otomatis", "tanpa bias"], ["Bisa ditinjau", "kapan saja"]] },
    { k: "phone", head: "Semua *tercatat di HP.*", tiles: ABSEN },
  ] },
  { id: "E14-gaji-pokok-vs-tunjangan", theme: "light", end: "bersih", line: "Komponen gaji yang jelas.", scenes: [
    { k: "cards", head: "Gaji pokok, tunjangan tetap, tunjangan tidak tetap: *apa bedanya?*", items: [["Gaji pokok", "Dasar gaji, jumlahnya tetap"], ["Tunjangan tetap", "Sama tiap bulan"], ["Tunjangan tidak tetap", "Berubah sesuai kondisi"]] },
    { k: "cards", head: "Kenapa *perlu dibedakan?*", items: [["Dasar hitung", "Lembur umumnya memakai upah pokok + tunjangan tetap"], ["Rincian", "Slip jadi lebih jelas"], ["Aturan", "Cek ketentuan terbaru"]] },
    { k: "slip", head: "Terlihat *di slip gaji.*" },
    { k: "ticks", head: "Rapikan *komponennya.*", items: [["Catat tiap komponen", "per karyawan"], ["Pisahkan", "tetap dan tidak tetap"], ["Tampilkan", "di slip"]] },
  ] },
  { id: "E15-lembur-rotasi-adil", theme: "dark", end: "bersih", line: "Lembur adil, tim tetap solid.", scenes: [
    { k: "cards", head: "Lembur selalu orang yang sama? *Coba atur rotasi*", items: [["Masalah", "Itu-itu saja yang lembur"], ["Akibat", "Cepat lelah dan kesal"], ["Solusi", "Rotasi dan catat jamnya"]] },
    { k: "ticks", head: "Cara *mengaturnya.*", items: [["Catat jam lembur", "tiap karyawan"], ["Bagi giliran", "secara adil"], ["Evaluasi", "tiap bulan"]] },
    { k: "phone", head: "Lembur *terlihat per orang.*" },
    { k: "slip", head: "Dan *terhitung di gaji.*" },
  ] },
  // ================= PROMOSI =================
  { id: "E16-hrcash-dua-puluh-detik", theme: "dark", end: "bersih", line: "HrCash. Absensi dan payroll untuk UMKM.", scenes: [
    { k: "rec", head: "HrCash dalam *20 detik.*", part: "pin", cap: "1. Masuk dengan PIN" },
    { k: "rec", head: "Lokasi *terbaca otomatis.*", part: "map", cap: "2. Lokasi di peta" },
    { k: "rec", head: "Selfie, *Check In.*", part: "selfie", cap: "3. Selfie, selesai" },
    { k: "phone", head: "Rekap dan slip, *otomatis.*" },
  ] },
  { id: "E17-isi-portal-karyawan", theme: "amber", end: "bersih", line: "Semua kebutuhan karyawan, satu portal.", scenes: [
    { k: "chips", head: "Isi Portal Karyawan: *12 menu di satu HP*", items: ["Kehadiran", "Papan Info", "Cuti", "Lembur", "Gaji", "Surat Peringatan", "Surat Keterangan", "Kegiatan", "Penugasan", "Reimburse", "Jadwal Kerja", "Profil Saya"] },
    { k: "phone", head: "Cukup *buka satu link.*" },
    { k: "cards", head: "Yang paling *sering dipakai*", items: [["Kehadiran", "Check In dan Check Out"], ["Gaji", "Slip dilihat sendiri"], ["Cuti dan lembur", "Diajukan dari HP"]] },
    { k: "ticks", head: "Tanpa install *apa pun.*", items: [["Android dan iPhone", "lewat browser"], ["Satu link", "untuk semua"], ["PIN pribadi", "tiap karyawan"]] },
  ] },
  { id: "E18-cara-kerja-selfie-lokasi", theme: "dark", end: "bersih", line: "Absen yang ada buktinya.", scenes: [
    { k: "rec", head: "Absen selfie + lokasi: *begini cara kerjanya*", part: "map", cap: "Lokasi terbaca" },
    { k: "rec", head: "Lalu *ambil selfie.*", part: "selfie", cap: "Selfie dari browser HP" },
    { k: "ticks", head: "Yang *tercatat otomatis*", items: [["Jam masuk", "sesuai waktu sistem"], ["Lokasi", "terlihat di peta"], ["Foto", "saat absen"]] },
    { k: "phone", head: "Rekap *langsung tampil.*", tiles: ABSEN },
  ] },
  { id: "E19-mulai-tanpa-install", theme: "light", end: "bersih", line: "Buka link. Absen. Selesai.", scenes: [
    { k: "link", head: "Karyawan mulai absen *tanpa install*", pill: "Cukup buka link di HP" },
    { k: "steps", head: "Langkahnya *3 saja.*", items: [{ icon: "user", label: "Pilih nama" }, { icon: "cam", label: "Ambil selfie" }, { icon: "check", label: "Selesai" }] },
    { k: "chips", head: "Jalan di *semua HP.*", items: ["Android", "iPhone", "Browser biasa"], note: "Tanpa Play Store dan App Store" },
    { k: "phone", head: "Rekap *ikut otomatis.*" },
  ] },
  { id: "E20-slip-digital-karyawan", theme: "dark", end: "bersih", line: "Slip gaji, dilihat kapan saja.", scenes: [
    { k: "slip", head: "Slip gaji *digital* untuk karyawan" },
    { k: "phone", head: "Dibuka *dari portal.*" },
    { k: "ticks", head: "Lebih praktis *untuk semua.*", items: [["Tanpa kirim file", "satu per satu"], ["Tanpa salah kirim", "tiap orang miliknya"], ["Arsip rapi", "per bulan"]] },
    { k: "cards", head: "Tiap karyawan *melihat miliknya.*", items: [["Pendapatan", "Terlihat jelas"], ["Potongan", "Terlihat jelas"], ["Total", "Terlihat jelas"]] },
  ] },
  { id: "E21-untuk-siapa-hrcash", theme: "amber", end: "bersih", line: "Untuk usaha kecil yang ingin tertata.", scenes: [
    { k: "chips", head: "HrCash cocok untuk *usaha seperti apa?*", items: ["Warung", "Toko", "Bengkel", "Salon", "Kafe", "Laundry", "Klinik"] },
    { k: "ticks", head: "Ciri usaha *yang terbantu*", items: [["Karyawan sedikit", "tapi ingin rapi"], ["Pemilik sibuk", "butuh laporan otomatis"], ["Tanpa tim IT", "tinggal pakai"]] },
    { k: "phone", head: "Cukup *dari HP.*" },
    { k: "steps", head: "Mulai *kapan saja.*", items: [{ icon: "user", label: "Tambah karyawan" }, { icon: "check", label: "Bagikan link" }, { icon: "cam", label: "Absen dimulai" }] },
  ] },
  { id: "E22-sehari-bersama-hrcash", theme: "dark", end: "bersih", line: "Hari kerja yang tercatat rapi.", scenes: [
    { k: "cards", head: "Sehari bersama HrCash: *dari pagi sampai gajian*", items: [["07:58", "Karyawan absen selfie dari HP"], ["12:00", "Jadwal dan tugas terlihat"], ["17:02", "Check Out tercatat"]] },
    { k: "phone", head: "Semua *di satu portal.*", tiles: ABSEN },
    { k: "cards", head: "Lalu *tiap akhir bulan*", items: [["Rekap", "Kehadiran terkumpul"], ["Lembur", "Terhitung otomatis"], ["Slip", "Siap dilihat"]] },
    { k: "slip", head: "Gajian *jadi lebih tenang.*" },
  ] },
  { id: "E23-faq-owner", theme: "dark", end: "bersih", line: "Pertanyaan umum, jawaban singkat.", scenes: [
    { k: "cards", head: "Pertanyaan owner *yang paling sering*", items: [["Perlu install?", "Tidak, cukup buka link"], ["Bisa di iPhone?", "Bisa, lewat browser"], ["Lupa PIN?", "Admin bisa atur ulang"]] },
    { k: "ticks", head: "Dan juga *soal ini*", items: [["Data karyawan", "tersimpan online"], ["Ganti HP", "tetap bisa masuk"], ["Absen", "selfie dan lokasi"]] },
    { k: "phone", head: "Semua *mudah dipakai.*" },
    { k: "link", head: "Mulai dari *satu link.*", pill: "Bagikan sekali, pakai terus" },
  ] },
  { id: "E24-lembur-dari-hp", theme: "light", end: "bersih", line: "Lembur tercatat sejak diajukan.", scenes: [
    { k: "steps", head: "Mengajukan lembur *cukup dari HP*", items: [{ icon: "user", label: "Karyawan ajukan lembur" }, { icon: "check", label: "Owner menyetujui" }, { icon: "cam", label: "Jam tercatat" }] },
    { k: "cards", head: "Lebih rapi *daripada chat.*", items: [["Pengajuan", "Tercatat jelas"], ["Persetujuan", "Terlihat riwayatnya"], ["Hitungan", "Mengikuti data"]] },
    { k: "phone", head: "Menu *Lembur di portal.*" },
    { k: "slip", head: "Masuk ke *laporan gaji.*" },
  ] },
  { id: "E25-cek-sisa-cuti-sendiri", theme: "dark", end: "bersih", line: "Sisa cuti, tanpa perlu bertanya.", scenes: [
    { k: "phone", head: "Cek sisa cuti *tanpa bertanya ke HRD*" },
    { k: "cards", head: "Yang *terlihat di portal*", items: [["Sisa cuti", "Dalam hari"], ["Pengajuan", "Status terbaru"], ["Riwayat", "Cuti sebelumnya"]] },
    { k: "ticks", head: "Manfaatnya *untuk dua pihak.*", items: [["Karyawan", "tidak perlu menunggu jawaban"], ["Owner", "tidak dibanjiri pertanyaan"], ["Data", "selalu sama"]] },
    { k: "chat", head: "Tidak perlu *tanya lewat chat.*", msgs: [{ who: "Dewi", text: "Pak, sisa cuti saya berapa?", time: "11:20" }, { text: "Cek di portal ya, sudah ada.", time: "11:21", out: true }] },
  ] },
  { id: "E26-peta-bukti-lokasi", theme: "dark", end: "bersih", line: "Lokasi absen, terlihat jelas.", scenes: [
    { k: "rec", head: "Peta *menunjukkan lokasi absen.*", part: "map", cap: "Titik biru = posisi" },
    { k: "cards", head: "Kenapa *lokasi penting?*", items: [["Karyawan toko", "Absen dari area usaha"], ["Karyawan lapangan", "Posisi tercatat"], ["Owner", "Tidak perlu menelepon"]] },
    { k: "rec", head: "Plus *selfie.*", part: "selfie", cap: "Bukti wajah saat absen" },
    { k: "ticks", head: "Dua bukti, *satu kali absen.*", items: [["Lokasi", "terbaca otomatis"], ["Selfie", "diambil saat absen"], ["Jam", "tercatat sistem"]] },
  ] },
  { id: "E27-setup-lima-karyawan", theme: "light", end: "bersih", line: "Siap dalam hitungan menit.", scenes: [
    { k: "steps", head: "Setup untuk 5 karyawan: *3 langkah saja*", items: [{ icon: "user", label: "Tambah data karyawan" }, { icon: "check", label: "Bagikan link portal" }, { icon: "cam", label: "Karyawan mulai absen" }] },
    { k: "link", head: "Satu link *untuk semua.*", pill: "Tiap orang pakai PIN sendiri" },
    { k: "phone", head: "Rekap *langsung tampil.*" },
    { k: "ticks", head: "Setelah itu *jalan sendiri.*", items: [["Absen", "tercatat otomatis"], ["Lembur dan cuti", "terdata"], ["Slip gaji", "siap"]] },
  ] },
  // ================= FORMAT POPULER =================
  { id: "E28-red-flag-gaji", theme: "dark", end: "bersih", line: "Green flag itu bisa dibangun.", scenes: [
    { k: "cards", head: "Red flag soal gaji *di tempat kerja*", items: [["Red flag", "Gaji tanpa rincian"], ["Red flag", "Lembur tidak dihitung"], ["Red flag", "Potongan tidak dijelaskan"]] },
    { k: "cards", head: "Green flag-nya *seperti ini*", items: [["Green flag", "Slip jelas tiap bulan"], ["Green flag", "Lembur tercatat"], ["Green flag", "Potongan transparan"]] },
    { k: "ticks", head: "Cara *membangunnya.*", items: [["Catat kehadiran", "otomatis"], ["Hitung gaji", "dari data"], ["Beri slip", "lewat portal"]] },
    { k: "slip", head: "Mulai dari *slip yang jelas.*" },
  ] },
  { id: "E29-quiz-hr-173", theme: "dark", end: "bersih", line: "Belajar HR, sedikit demi sedikit.", scenes: [
    { k: "cards", head: "Quiz HR: *angka 173 itu apa?*", items: [["A", "Jumlah hari kerja setahun"], ["B", "Pembagi untuk upah sejam"], ["C", "Batas maksimal lembur"]] },
    { k: "big", head: "Jawabannya: *B*", text: "B", label: "pembagi untuk upah sejam", sub: "Upah sejam = upah sebulan ÷ 173. " + "Informasi umum." },
    { k: "formula", head: "Dipakai untuk *hitung lembur*", big: "÷173", rows: [["Gaji Rp5.190.000", "Upah sejam Rp30.000"], ["Lalu dikali tarif lembur", "1,5x jam pertama, 2x berikutnya"]], note: INFO },
    { k: "ticks", head: "Biar hitungan *tidak keliru*", items: [["Catat jam lembur", "akurat"], ["Pakai rumus yang sama", "konsisten"], ["Tampilkan di slip", "terbuka"]] },
  ] },
  { id: "E30-checklist-awal-tahun-owner", theme: "amber", end: "bersih", line: "Awal yang rapi, tahun lebih tenang.", scenes: [
    { k: "steps", head: "Checklist awal tahun *untuk owner UMKM*", items: [{ icon: "user", label: "Rapikan data karyawan" }, { icon: "check", label: "Tulis aturan kehadiran" }, { icon: "cam", label: "Siapkan sistem absen" }] },
    { k: "cards", head: "Dan *dua hal ini.*", items: [["Siapkan", "Anggaran THR sejak awal"], ["Atur", "Rencana cuti tim"]] },
    { k: "ticks", head: "Biar tahun *lebih tertata.*", items: [["Absen", "tercatat otomatis"], ["Lembur", "terhitung"], ["Slip", "siap tiap bulan"]] },
    { k: "phone", head: "Mulai *dari HP.*" },
  ] },
];
