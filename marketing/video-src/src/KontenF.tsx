import { Cfg } from "./Kreasi";

type Sc = Cfg["scenes"][number];
const C = (head: string, items: [string, string][]): Sc => ({ k: "cards", head, items });
const T = (head: string, items: [string, string][]): Sc => ({ k: "ticks", head, items });
const S = (head: string, ...l: string[]): Sc => ({ k: "steps", head, items: l.map((label, i) => ({ icon: (["user", "check", "cam"] as const)[i % 3], label })) });
const M = (head: string, msgs: { who?: string; text: string; time: string; out?: boolean }[]): Sc => ({ k: "chat", head, msgs });
const X = (head: string, bad: string[], good: string): Sc => ({ k: "cross", head, bad, good });
const B = (head: string, text: string, label: string, sub?: string): Sc => ({ k: "big", head, text, label, sub });
const V = (head: string, tagOld: string, old: [string, string], tagNow: string, now: [string, string]): Sc => ({ k: "versus", head, tagOld, old, tagNow, now });
const H = (head: string, items: string[], note?: string): Sc => ({ k: "chips", head, items, note });
const PH = (head: string): Sc => ({ k: "phone", head });
const SL = (head: string): Sc => ({ k: "slip", head });
const L = (head: string, pill: string): Sc => ({ k: "link", head, pill });
const R = (head: string, part: "pin" | "map" | "selfie", cap: string): Sc => ({ k: "rec", head, part, cap });
const I = "Informasi umum. Cek aturan terbaru.";
const cfg = (id: string, theme: Cfg["theme"], line: string, scenes: Sc[]): Cfg => ({ id, theme, end: "bersih", line, scenes });

export const CONFIGS4: Cfg[] = [
  // ===== HR dan manajemen tim =====
  cfg("F01-jadwal-shift-adil", "dark", "Jadwal adil, tim tenang.", [
    C("Jadwal shift yang adil: *3 aturan dasar*", [["Rotasi", "Giliran pagi dan malam dibagi rata"], ["Tukar shift", "Boleh dengan persetujuan"], ["Info lebih awal", "Jadwal keluar seminggu sebelumnya"]]),
    T("Biar jadwal *tidak diprotes*", [["Jadwal tertulis", "bukan lisan"], ["Terlihat semua orang", "satu sumber yang sama"], ["Perubahan dicatat", "dengan alasan"]]),
    PH("Jadwal kerja *terlihat di HP.*"),
    S("Mulai *dari yang sederhana*", "Buat pola shift", "Bagikan ke tim", "Evaluasi tiap bulan"),
  ]),
  cfg("F02-feedback-rumus-sbi", "light", "Feedback yang jelas, hasil yang baik.", [
    C("Memberi feedback: *pakai rumus SBI*", [["S - Situasi", "Kapan dan di mana kejadiannya"], ["B - Perilaku", "Yang terlihat, bukan dugaan"], ["I - Dampak", "Akibatnya bagi tim atau pelanggan"]]),
    M("Contoh *kalimatnya*", [{ text: "Kemarin saat tutup toko, stok tidak dicatat. Akibatnya data hari ini kacau.", time: "09:00", out: true }, { who: "Rina", text: "Baik, Pak. Saya catat mulai hari ini.", time: "09:02" }]),
    T("Kenapa *cara ini efektif*", [["Fokus pada kejadian", "bukan pada pribadi"], ["Mudah dipahami", "tidak menebak-nebak"], ["Mengarah ke solusi", "bukan menyalahkan"]]),
    S("Langkah *berikutnya*", "Sampaikan faktanya", "Dengarkan tanggapannya", "Sepakati perbaikan"),
  ]),
  cfg("F03-satu-satu-bulanan", "dark", "Dengarkan tim, usaha tumbuh.", [
    C("1-on-1 sebulan sekali: *bahas apa saja?*", [["Kabar dan kendala", "Apa yang sulit bulan ini?"], ["Target", "Apa fokus bulan depan?"], ["Masukan", "Apa yang bisa owner perbaiki?"]]),
    T("Aturan *mainnya*", [["15-20 menit", "singkat saja"], ["Jadwal tetap", "bulan ke bulan"], ["Catat hasilnya", "dan tindak lanjuti"]]),
    S("Cara *memulainya*", "Pilih satu karyawan", "Ajak bicara santai", "Catat satu tindak lanjut"),
    PH("Catatan tim *tertata rapi.*"),
  ]),
  cfg("F04-apresiasi-tanpa-bonus", "amber", "Apresiasi kecil, dampak besar.", [
    H("Apresiasi tanpa bonus besar: *4 cara murah*", ["Ucapan terima kasih", "Libur singkat", "Makan bersama", "Kesempatan belajar"]),
    C("Kenapa *ini penting*", [["Karyawan", "Merasa dilihat"], ["Tim", "Lebih semangat"], ["Usaha", "Lebih betah dan stabil"]]),
    T("Biar apresiasi *tepat sasaran*", [["Sebut hal spesifik", "bukan pujian umum"], ["Segera", "jangan menunggu lama"], ["Konsisten", "bukan sesekali"]]),
    S("Mulai *hari ini*", "Catat satu pencapaian", "Ucapkan langsung", "Ulangi tiap minggu"),
  ]),
  cfg("F05-tanda-mulai-tidak-betah", "dark", "Dengarkan sebelum terlambat.", [
    C("Tanda karyawan *mulai tidak betah*", [["Sering izin mendadak", "tanpa pola jelas"], ["Kurang antusias", "dibanding biasanya"], ["Menghindari rapat", "atau diskusi tim"]]),
    B("Ini *tanda umum,* bukan kepastian", "Ajak", "bicara dulu", "Jangan menyimpulkan sendiri."),
    S("Yang bisa *dilakukan owner*", "Ajak ngobrol empat mata", "Dengarkan tanpa menyela", "Cari solusi bersama"),
    T("Pantau dengan *data netral*", [["Kehadiran", "tercatat jelas"], ["Izin dan cuti", "terdata"], ["Riwayat", "bisa ditinjau"]]),
  ]),
  cfg("F06-exit-interview", "light", "Perpisahan yang baik memberi pelajaran.", [
    C("Exit interview: *4 pertanyaan penting*", [["1", "Apa alasan utama kamu pergi?"], ["2", "Apa yang paling kamu suka di sini?"], ["3", "Apa yang perlu kami perbaiki?"]]),
    C("Satu lagi *yang sering terlupa*", [["4", "Apakah kamu akan merekomendasikan tempat ini?"]]),
    T("Tips *melakukannya*", [["Suasana santai", "bukan interogasi"], ["Catat jawabannya", "tanpa membela diri"], ["Tindak lanjuti", "satu perbaikan nyata"]]),
    PH("Riwayat karyawan *tetap tersimpan.*"),
  ]),
  cfg("F07-onboarding-30-hari", "dark", "Mulai baik, kerja lebih lancar.", [
    S("Onboarding 30 hari: *rencana singkat*", "Minggu 1: kenalan dan aturan", "Minggu 2: belajar tugas utama", "Minggu 3-4: praktik dan evaluasi"),
    C("Yang disiapkan *di minggu pertama*", [["Akses", "Absen dan portal"], ["Orang", "Pendamping selama 2 minggu"], ["Aturan", "Jam kerja dan cuti"]]),
    T("Evaluasi *di hari ke-30*", [["Apa yang sudah bisa", "dicatat"], ["Apa yang masih kurang", "dibahas"], ["Rencana lanjut", "disepakati"]]),
    PH("Semua terlihat *di portal.*"),
  ]),
  cfg("F08-tolak-naik-gaji-sopan", "light", "Jujur itu menghormati.", [
    M("Menolak permintaan naik gaji? *Jawab jujur dan jelas*", [{ who: "Agus", text: "Pak, boleh saya minta naik gaji?", time: "14:00" }, { text: "Saya hargai kerjamu. Saat ini belum bisa. Ini yang perlu dicapai dulu.", time: "14:02", out: true }]),
    C("3 hal yang *perlu disampaikan*", [["Apresiasi", "Sebut hasil kerjanya"], ["Alasan", "Jujur dan jelas"], ["Jalan ke depan", "Target dan waktunya"]]),
    X("Hindari *jawaban ini*", ["Nanti saja ya", "Lihat saja nanti", "Jangan bahas itu dulu"], "Beri kepastian dan target jelas"),
    T("Data *membantu keputusan*", [["Kehadiran", "tercatat"], ["Kinerja", "terukur"], ["Riwayat", "bisa ditinjau"]]),
  ]),
  cfg("F09-delegasi-tiga-tingkat", "dark", "Delegasi bertahap, usaha lebih ringan.", [
    C("Delegasi bertahap: *3 tingkat kepercayaan*", [["Tingkat 1", "Kerjakan, lalu lapor sebelum bertindak"], ["Tingkat 2", "Kerjakan, lalu lapor setelah selesai"], ["Tingkat 3", "Putuskan sendiri, lapor bila perlu"]]),
    T("Mulai dari *yang kecil*", [["Tugas rutin", "dulu"], ["Risiko rendah", "dulu"], ["Evaluasi", "tiap minggu"]]),
    S("Langkah *awal*", "Pilih satu tugas", "Tentukan tingkat kepercayaan", "Evaluasi hasilnya"),
    PH("Tugas dan kegiatan *tercatat.*"),
  ]),
  cfg("F10-rapat-pagi-sepuluh-menit", "amber", "Rapat singkat, kerja jelas.", [
    C("Rapat pagi 10 menit: *3 pertanyaan saja*", [["1", "Apa yang dikerjakan hari ini?"], ["2", "Apa kendalanya?"], ["3", "Apa yang perlu dibantu?"]]),
    T("Aturan *rapat singkat*", [["Berdiri", "supaya cepat"], ["Satu orang satu menit", "tanpa melebar"], ["Catat tugas", "dan penanggung jawab"]]),
    V("Mana yang *lebih efektif?*", "RAPAT PANJANG", ["Satu jam", "tanpa hasil jelas"], "RAPAT SINGKAT", ["10 menit", "tugas jelas"]),
    PH("Tugas *terlihat semua orang.*"),
  ]),
  cfg("F11-sop-satu-halaman", "light", "SOP sederhana, kerja konsisten.", [
    C("SOP satu halaman: *isi apa saja?*", [["Tujuan", "Untuk apa tugas ini"], ["Langkah", "Urutan yang jelas"], ["Standar", "Ciri hasil yang benar"]]),
    S("Cara *membuatnya*", "Tulis langkah apa adanya", "Uji ke satu karyawan", "Perbaiki lalu bagikan"),
    T("Contoh *SOP toko*", [["Buka toko", "checklist 5 poin"], ["Tutup toko", "cek kas dan stok"], ["Absen", "selfie dan lokasi"]]),
    PH("SOP dan absen *di satu portal.*"),
  ]),
  cfg("F12-nilai-kinerja-sederhana", "dark", "Penilaian adil, dasar jelas.", [
    C("Menilai kinerja: *3 indikator sederhana*", [["Kehadiran", "Tepat waktu dan konsisten"], ["Hasil kerja", "Sesuai target"], ["Sikap kerja sama", "Dengan tim dan pelanggan"]]),
    T("Biar penilaian *tidak subjektif*", [["Pakai data", "bukan kesan"], ["Kriteria sama", "untuk semua"], ["Dibahas bersama", "bukan sepihak"]]),
    PH("Data kehadiran *siap dipakai.*"),
    S("Rutinitas *penilaian*", "Catat tiap bulan", "Bahas tiap kuartal", "Tindak lanjuti"),
  ]),
  cfg("F13-nilai-budaya-tim", "amber", "Nilai yang jelas, tim yang solid.", [
    C("Budaya tim: *3 nilai yang cukup*", [["Jujur", "Termasuk soal kesalahan"], ["Tepat waktu", "Menghargai orang lain"], ["Saling bantu", "Bukan saling menyalahkan"]]),
    T("Cara *menanamkannya*", [["Jelaskan alasannya", "bukan hanya aturan"], ["Beri contoh", "dari owner"], ["Apresiasi", "yang menjalankan"]]),
    X("Hindari *kebiasaan ini*", ["Aturan beda tiap orang", "Teguran di depan umum", "Janji tanpa tindak lanjut"], "Aturan sama dan dijalankan konsisten"),
    PH("Aturan dan jadwal *terlihat jelas.*"),
  ]),
  cfg("F14-karyawan-pasif", "dark", "Ajak, bukan paksa.", [
    C("Karyawan pasif? *3 langkah mengajak*", [["Pahami dulu", "Apa yang membuatnya diam"], ["Beri tugas kecil", "yang jelas hasilnya"], ["Apresiasi", "setiap kemajuan"]]),
    M("Contoh *percakapannya*", [{ text: "Aku perhatikan kamu jarang usul. Ada yang mengganjal?", time: "15:00", out: true }, { who: "Dewi", text: "Saya kurang percaya diri, Pak.", time: "15:03" }]),
    T("Dukung dengan *struktur*", [["Tugas jelas", "satu per satu"], ["Target kecil", "bisa dicapai"], ["Evaluasi", "tiap minggu"]]),
    PH("Tugas dan kegiatan *tercatat.*"),
  ]),
  cfg("F15-rekrut-lewat-referral", "light", "Pilih cara yang cocok untukmu.", [
    V("Rekrut lewat referral: *untung dan ruginya*", "KELEBIHAN", ["Cepat dan lebih percaya", "kenal dari orang dekat"], "KEKURANGAN", ["Bisa sungkan menegur", "pilihan jadi terbatas"]),
    T("Biar *tetap objektif*", [["Tetap wawancara", "seperti pelamar lain"], ["Aturan sama", "untuk semua"], ["Catat evaluasi", "tertulis"]]),
    C("Kombinasikan *dengan cara lain*", [["Referral", "Untuk kandidat awal"], ["Lowongan terbuka", "Untuk pilihan lebih luas"], ["Magang", "Untuk menguji kecocokan"]]),
    PH("Karyawan baru *langsung tertata.*"),
  ]),
  cfg("F16-lowongan-kerja-menarik", "dark", "Lowongan jelas, pelamar tepat.", [
    C("Lowongan kerja menarik: *5 bagian wajib*", [["1", "Posisi dan lokasi"], ["2", "Tugas utama"], ["3", "Syarat yang masuk akal"]]),
    C("Dua lagi *yang menarik pelamar*", [["4", "Jam kerja dan sistem libur"], ["5", "Cara melamar yang mudah"]]),
    T("Tambahkan *hal yang jujur*", [["Suasana kerja", "apa adanya"], ["Peluang berkembang", "yang nyata"], ["Cara bekerja", "yang jelas"]]),
    PH("Karyawan baru *mudah memulai.*"),
  ]),
  cfg("F17-wawancara-calon-kasir", "amber", "Kasir yang tepat, toko lebih tenang.", [
    C("Wawancara calon kasir: *4 pertanyaan*", [["1", "Pengalaman melayani pelanggan?"], ["2", "Cara menghadapi pelanggan kesal?"], ["3", "Jika selisih kas, apa langkahmu?"]]),
    C("Satu lagi *yang penting*", [["4", "Siap dengan jadwal shift dan akhir pekan?"]]),
    T("Perhatikan *hal ini*", [["Kejujuran", "saat menjawab"], ["Ketelitian", "dengan angka"], ["Sikap", "kepada pelanggan"]]),
    PH("Jadwal dan absen *terlihat jelas.*"),
  ]),
  cfg("F18-training-video-satu-menit", "dark", "Latih sekali, pakai berkali-kali.", [
    S("Latih karyawan baru *lewat video 1 menit*", "Rekam satu tugas", "Bagikan ke karyawan baru", "Ulangi untuk tugas lain"),
    T("Kenapa *video efektif*", [["Konsisten", "caranya sama untuk semua"], ["Bisa diulang", "kapan saja"], ["Hemat waktu", "owner tidak mengulang"]]),
    C("Contoh *topik video*", [["Buka toko", "Langkah dan checklist"], ["Melayani pelanggan", "Sapaan dan alur"], ["Tutup toko", "Cek kas dan stok"]]),
    PH("Semua materi *dalam satu portal.*"),
  ]),
  cfg("F19-saat-ramai-bagi-tugas", "light", "Ramai pun tetap teratur.", [
    C("Saat ramai: *cara membagi tugas tim*", [["Satu penanggung jawab", "per area"], ["Peran jelas", "kasir, penyaji, kebersihan"], ["Waktu istirahat", "bergantian"]]),
    T("Persiapan *sebelum ramai*", [["Cek jadwal", "siapa yang masuk"], ["Cek stok", "bahan utama"], ["Briefing singkat", "5 menit"]]),
    PH("Jadwal kerja *terlihat di HP.*"),
    S("Setelah ramai, *evaluasi*", "Catat yang berjalan baik", "Catat yang kurang", "Perbaiki untuk berikutnya"),
  ]),
  cfg("F20-aturan-libur-izin", "dark", "Aturan jelas, tidak ada salah paham.", [
    C("Aturan libur dan izin: *jelaskan dari awal*", [["Libur", "Hari dan jadwalnya"], ["Izin", "Cara dan batas waktu mengajukan"], ["Cuti", "Cara mengajukan dan sisa jatah"]]),
    T("Biar *tidak salah paham*", [["Aturan tertulis", "dibagikan ke semua"], ["Satu jalur pengajuan", "bukan lewat banyak chat"], ["Riwayat tercatat", "bisa dilihat"]]),
    PH("Pengajuan dan sisa cuti *terlihat.*"),
    S("Langkah *awalnya*", "Tulis aturan", "Bagikan ke tim", "Gunakan satu jalur"),
  ]),
  // ===== POV, humor, format populer =====
  cfg("F21-pov-macet-pak", "dark", "Cerita sama, catatannya bisa berbeda.", [
    M("POV: Karyawan chat *'macet, Pak'* jam 8 lewat 5", [{ who: "Budi", text: "Maaf Pak, macet parah.", time: "08:05" }, { who: "Budi", text: "10 menit lagi sampai.", time: "08:06" }]),
    V("Catatan *yang adil*", "TANPA CATATAN", ["'Katanya 10 menit'", "tidak ada bukti"], "ADA CATATAN", ["Tiba 08:23", "terlihat di sistem"]),
    T("Biar *tidak debat*", [["Jam tiba", "tercatat otomatis"], ["Aturan telat", "jelas dan sama"], ["Rekap", "bisa dicek bersama"]]),
    PH("Rekap *ada di HP.*"),
  ]),
  cfg("F22-tipe-karyawan-gajian", "amber", "Gajian tenang untuk semua tipe.", [
    C("Tipe karyawan saat *tanggal gajian*", [["Si Cek Rekening", "Buka aplikasi bank tiap 10 menit"], ["Si Tanya Slip", "Chat owner jam 7 pagi"], ["Si Tenang", "Sudah cek slip sejak semalam"]]),
    B("Mau jadi *Si Tenang?*", "Slip", "bisa dicek sendiri", "Tanpa perlu bertanya."),
    PH("Slip *bisa dibuka kapan saja.*"),
    T("Manfaat *untuk owner*", [["Pertanyaan berkurang", "pagi lebih tenang"], ["Rincian jelas", "debat berkurang"], ["Arsip rapi", "per bulan"]]),
  ]),
  cfg("F23-tipe-owner-tanggal-25", "dark", "Owner juga butuh tenang.", [
    C("Tipe owner *saat tanggal 25*", [["Si Kalkulator", "Hitung gaji sampai larut"], ["Si Cek Chat", "Balas 'slip saya mana?'"], ["Si Santai", "Laporan sudah jadi sendiri"]]),
    B("Mau jadi *Si Santai?*", "Auto", "laporan gaji dari data absen", "Tinggal cek dan bayar."),
    SL("Laporan *jadi sendiri.*"),
    T("Yang *berubah*", [["Hitung manual", "berkurang"], ["Pertanyaan karyawan", "berkurang"], ["Waktu luang", "bertambah"]]),
  ]),
  cfg("F24-owner-jam-dua-pagi", "dark", "Satu masalah bisa dikurangi.", [
    C("Yang dipikirkan owner *jam 2 pagi*", [["Gaji bulan depan", "Cukup atau tidak?"], ["Siapa yang tutup toko", "Besok pagi?"], ["Stok barang", "Masih ada?"]]),
    T("Beberapa *bisa dikurangi*", [["Absen dan jadwal", "tercatat otomatis"], ["Rekap gaji", "otomatis"], ["Pengumuman tim", "satu tempat"]]),
    PH("Cek *dari HP* sebelum tidur."),
    S("Tidur lebih tenang *dengan 3 langkah*", "Rapikan data", "Otomatiskan yang berulang", "Cek ringkasan harian"),
  ]),
  cfg("F25-owner-vs-excel-absen", "light", "Excel bagus, tapi absen punya tempat lain.", [
    M("Owner vs *file Excel absen*", [{ text: "Kenapa total hadirnya salah lagi?", time: "22:10", out: true }, { who: "Excel", text: "#REF!", time: "22:10" }]),
    X("Masalah *yang sering muncul*", ["Rumus tergeser", "File terhapus", "Tidak ada bukti kehadiran"], "Data tercatat di sistem"),
    T("Pindah ke *sistem absen*", [["Absen", "selfie dan lokasi"], ["Rekap", "otomatis"], ["Riwayat", "tersimpan"]]),
    PH("Rekap *tanpa rumus manual.*"),
  ]),
  cfg("F26-alasan-telat-populer", "dark", "Dengarkan, lalu putuskan dengan data.", [
    H("Alasan telat paling populer", ["Macet", "Ban bocor", "Antar anak", "Hujan deras", "Bangun kesiangan"], "Mana yang paling sering kamu dengar?"),
    C("Cara *menyikapinya*", [["Dengarkan", "alasan dengan tenang"], ["Cek data", "pola keterlambatan"], ["Putuskan", "sesuai aturan yang jelas"]]),
    T("Data membantu *bersikap adil*", [["Jam tiba", "tercatat"], ["Jumlah telat", "terlihat"], ["Pola", "mudah dilihat"]]),
    PH("Rekap *per karyawan.*"),
  ]),
  cfg("F27-hal-tidak-diajarkan-usaha", "amber", "Belajar sambil berjalan.", [
    C("Hal yang tidak diajarkan *saat mulai usaha*", [["Mengatur orang", "Lebih sulit dari mengatur barang"], ["Administrasi", "Tidak terlihat tapi menumpuk"], ["Gaji", "Selalu datang lebih cepat dari dugaan"]]),
    T("Yang bisa *dibantu sistem*", [["Absen", "otomatis"], ["Rekap", "otomatis"], ["Slip", "otomatis"]]),
    PH("Administrasi *tidak lagi menumpuk.*"),
    S("Mulai *dari yang kecil*", "Catat absen", "Rapikan gaji", "Sederhanakan laporan"),
  ]),
  cfg("F28-ekspektasi-vs-realita-karyawan", "dark", "Realita lebih mudah dengan sistem.", [
    V("Ekspektasi vs realita: *mengurus karyawan*", "EKSPEKTASI", ["Tinggal bagi tugas", "semua lancar"], "REALITA", ["Absen, gaji, cuti", "menumpuk tiap hari"]),
    T("Yang sering *memakan waktu*", [["Rekap absen", "tiap akhir bulan"], ["Hitung lembur", "satu per satu"], ["Jawab pertanyaan", "soal slip dan cuti"]]),
    PH("Semua *di satu HP.*"),
    S("Rapikan *mulai sekarang*", "Pilih satu masalah", "Cari cara otomatisnya", "Coba selama satu bulan"),
  ]),
  cfg("F29-this-or-that-absen", "dark", "Pilih yang paling praktis untukmu.", [
    C("This or that: *absen kertas atau absen HP?*", [["A", "Kertas: murah, tapi bisa diubah"], ["B", "HP: ada selfie dan lokasi"]]),
    V("Kalau *dibandingkan*", "KERTAS", ["Rekap manual", "mudah salah"], "HP", ["Rekap otomatis", "ada bukti"]),
    R("Absen lewat HP *seperti ini*", "selfie", "Selfie dan Check In"),
    T("Komen *pilihanmu*", [["A atau B", "tulis di komentar"], ["Alasanmu", "boleh singkat"], ["Tag temanmu", "yang masih pakai kertas"]]),
  ]),
  cfg("F30-kalimat-owner-saat-gajian", "light", "Gajian jelas, kalimatnya jadi ramah.", [
    M("Kalimat yang sering diucapkan *owner saat gajian*", [{ text: "Sebentar ya, saya hitung dulu.", time: "09:00", out: true }, { text: "Slip menyusul besok.", time: "15:30", out: true }, { text: "Nanti saya kirim lewat WA.", time: "20:10", out: true }]),
    V("Bandingkan *dengan ini*", "DULU", ["'Sebentar ya'", "berjam-jam"], "SEKARANG", ["'Cek di portal ya'", "sudah ada"]),
    SL("Slip *siap lebih awal.*"),
    PH("Karyawan *cek sendiri.*"),
  ]),
  cfg("F31-sehari-owner-kafe", "amber", "Sehari lebih rapi, usaha lebih sehat.", [
    C("Sehari owner kafe: *dari buka sampai tutup*", [["07:00", "Cek jadwal dan stok"], ["12:00", "Jam ramai, tim melayani"], ["21:00", "Tutup, cek kas dan absen"]]),
    T("Yang *bisa dipantau dari HP*", [["Kehadiran tim", "tercatat"], ["Jadwal shift", "terlihat"], ["Pengumuman", "satu tempat"]]),
    PH("Cek *dari mana saja.*"),
    S("Bangun *rutinitas rapi*", "Cek absen pagi", "Cek jadwal siang", "Cek rekap malam"),
  ]),
  cfg("F32-jangan-ucapkan-ke-karyawan", "dark", "Kata-kata menentukan suasana kerja.", [
    X("Kalimat yang sebaiknya *tidak diucapkan ke karyawan*", ["Kerja saja, jangan banyak tanya", "Pokoknya harus bisa", "Gaji naik nanti-nanti"], "Jelaskan alasan dan beri kepastian"),
    C("Ganti *dengan ini*", [["Daripada", "Kerja saja → Ini alasannya"], ["Daripada", "Pokoknya bisa → Ini caranya"], ["Daripada", "Nanti-nanti → Ini jadwalnya"]]),
    T("Hasilnya *lebih baik*", [["Karyawan paham", "tujuannya"], ["Kepercayaan", "meningkat"], ["Salah paham", "berkurang"]]),
    PH("Aturan dan info *terlihat jelas.*"),
  ]),
  cfg("F33-stres-tutup-bulan-urutan", "light", "Tutup bulan, tanpa drama.", [
    S("Stres tutup bulan? *Coba urutan ini*", "Kumpulkan data absen", "Hitung lembur dan potongan", "Cek lalu bagikan slip"),
    T("Biar *lebih ringan*", [["Absen", "otomatis tercatat"], ["Lembur", "otomatis terhitung"], ["Slip", "tinggal dibagikan"]]),
    SL("Laporan *siap dicek.*"),
    PH("Karyawan *lihat sendiri.*"),
  ]),
  cfg("F34-hari-pertama-jadi-owner", "dark", "Belajar dari awal, rapikan dari sekarang.", [
    C("Hari pertama jadi owner: *yang mengejutkan*", [["Karyawan", "Bukan hanya soal gaji"], ["Waktu", "Tersita urusan kecil"], ["Catatan", "Ternyata penting sekali"]]),
    T("Yang *sebaiknya disiapkan*", [["Aturan tertulis", "sejak awal"], ["Catatan kehadiran", "rapi"], ["Slip gaji", "konsisten"]]),
    PH("Siap *dari hari pertama.*"),
    S("Mulai *sederhana*", "Tulis aturan", "Catat kehadiran", "Beri slip tiap bulan"),
  ]),
  cfg("F35-quiz-owner-tipe", "amber", "Apa pun tipenya, bisa lebih rapi.", [
    C("Quiz: kamu owner tipe apa? *A, B, atau C*", [["A", "Si Detail: semua dicatat"], ["B", "Si Santai: percaya penuh"], ["C", "Si Sibuk: tidak sempat mencatat"]]),
    C("Hasilnya", [["A", "Pertahankan, otomatiskan agar hemat waktu"], ["B", "Tetap perlu catatan sebagai pegangan"], ["C", "Butuh sistem yang mencatat sendiri"]]),
    T("Semua tipe *terbantu oleh*", [["Absen otomatis", "selfie dan lokasi"], ["Rekap otomatis", "tanpa hitung manual"], ["Slip otomatis", "dari data"]]),
    PH("Cek *kapan saja.*"),
  ]),
  // ===== Promosi =====
  cfg("F36-niche-warung-makan", "dark", "Warung rapi, pelanggan puas.", [
    M("Punya warung makan? *Begini absen karyawannya*", [{ who: "Rina", text: "Pak, saya sudah di warung.", time: "06:20" }, { text: "Absen dulu ya lewat link.", time: "06:21", out: true }]),
    R("Absen *cukup dari HP*", "selfie", "Selfie dan Check In"),
    T("Cocok untuk *warung dan resto kecil*", [["Shift pagi dan sore", "terlihat jelas"], ["Karyawan harian", "tercatat"], ["Rekap gaji", "otomatis"]]),
    PH("Rekap *ikut otomatis.*"),
  ]),
  cfg("F37-niche-kafe", "amber", "Kafe tertata, tim kompak.", [
    C("Punya kafe? *Yang paling sering bikin pusing*", [["Shift", "Barista, kasir, penyaji"], ["Lembur", "Saat akhir pekan"], ["Gaji", "Harian dan bulanan"]]),
    T("Dibantu *satu portal*", [["Jadwal kerja", "terlihat tim"], ["Absen", "selfie dan lokasi"], ["Lembur dan slip", "tercatat"]]),
    R("Lokasi *terbaca otomatis*", "map", "Posisi saat absen"),
    PH("Cek *dari HP.*"),
  ]),
  cfg("F38-niche-salon", "light", "Salon rapi, kapster tenang.", [
    C("Punya salon? *Atur kapster tanpa ribet*", [["Jadwal", "Pagi dan sore bergantian"], ["Libur", "Sesuai giliran"], ["Gaji", "Pokok dan tambahan"]]),
    T("Dibantu *satu portal*", [["Jadwal kerja", "terlihat"], ["Cuti dan izin", "diajukan dari HP"], ["Slip gaji", "dibuka sendiri"]]),
    PH("Semua *di HP kapster.*"),
    S("Mulai *dari satu link*", "Tambah karyawan", "Bagikan link", "Mulai absen"),
  ]),
  cfg("F39-niche-bengkel", "dark", "Bengkel tertib, montir tenang.", [
    C("Punya bengkel? *Pantau tim tanpa menelepon*", [["Kehadiran", "Siapa yang sudah masuk"], ["Lembur", "Saat servis menumpuk"], ["Kasbon", "Tercatat jelas"]]),
    R("Lokasi *terbaca otomatis*", "map", "Titik biru = posisi"),
    T("Rapi *tanpa kertas*", [["Absen", "selfie dan lokasi"], ["Lembur", "terhitung"], ["Slip", "dibuka sendiri"]]),
    PH("Cek *dari HP.*"),
  ]),
  cfg("F40-niche-laundry", "amber", "Laundry rapi, antrean lancar.", [
    C("Punya laundry? *Atur shift dan lembur dengan rapi*", [["Shift", "Pagi dan sore"], ["Lembur", "Saat cucian menumpuk"], ["Gaji", "Harian dan mingguan"]]),
    T("Dibantu *satu portal*", [["Jadwal", "terlihat"], ["Absen", "tercatat"], ["Rekap", "otomatis"]]),
    R("Absen *selfie* dari HP", "selfie", "Check In tercatat"),
    PH("Rekap *tanpa hitung manual.*"),
  ]),
  cfg("F41-niche-toko-online", "light", "Toko online rapi, tim kompak.", [
    C("Punya toko online? *Tim gudang dan admin tetap tertata*", [["Gudang", "Jam masuk dan pulang"], ["Admin", "Jadwal chat dan pesanan"], ["Kurir", "Posisi saat absen"]]),
    T("Dibantu *satu portal*", [["Jadwal kerja", "terlihat"], ["Absen", "selfie dan lokasi"], ["Lembur", "terhitung"]]),
    PH("Semua *di satu HP.*"),
    S("Mulai *sederhana*", "Tambah tim", "Bagikan link", "Mulai absen"),
  ]),
  cfg("F42-tiga-alasan-absen-link", "dark", "Satu link, banyak kemudahan.", [
    C("3 alasan absen via link *lebih praktis*", [["1", "Tanpa install aplikasi"], ["2", "Jalan di Android dan iPhone"], ["3", "Tanpa alat tambahan"]]),
    H("Cocok untuk *semua HP*", ["Android", "iPhone", "Browser biasa"], "Tanpa Play Store dan App Store"),
    L("Cukup *buka link*", "Langsung absen"),
    T("Hasilnya", [["Absen", "tercatat"], ["Rekap", "otomatis"], ["Slip", "siap"]]),
  ]),
  cfg("F43-kenapa-pin-empat-angka", "dark", "PIN sederhana, absen cepat.", [
    C("Kenapa PIN-nya *cuma 4 angka?*", [["Mudah diingat", "karyawan tidak lupa"], ["Cepat diketik", "langsung masuk"], ["Pribadi", "tiap karyawan punya sendiri"]]),
    R("Ketik *4 angka*, langsung masuk", "pin", "Mudah diingat"),
    T("Aman dan *tidak ribet*", [["PIN pribadi", "tiap karyawan"], ["Lupa PIN", "admin bisa atur ulang"], ["Masuk sekali", "tidak minta PIN lagi"]]),
    PH("Siap *absen.*"),
  ]),
  cfg("F44-pindah-kertas-ke-digital", "light", "Pindah pelan-pelan, hasil nyata.", [
    S("Pindah dari kertas ke digital: *3 langkah*", "Kumpulkan data karyawan", "Bagikan link portal", "Hentikan buku absen"),
    C("Tips *agar mulus*", [["Satu minggu", "jalan berdampingan"], ["Latih tim", "satu kali saja"], ["Evaluasi", "setelah sebulan"]]),
    T("Setelah pindah", [["Rekap", "otomatis"], ["Bukti", "selfie dan lokasi"], ["Arsip", "rapi"]]),
    PH("Siap *dipakai.*"),
  ]),
  cfg("F45-yang-tercatat-saat-absen", "dark", "Satu absen, tiga bukti.", [
    C("Saat karyawan absen, *apa saja yang tercatat?*", [["Jam", "sesuai waktu sistem"], ["Lokasi", "terlihat di peta"], ["Selfie", "foto saat absen"]]),
    R("Lihat *prosesnya*", "map", "Lokasi terbaca"),
    R("Lalu *selfie*", "selfie", "Foto saat absen"),
    T("Hasilnya", [["Rekap", "otomatis"], ["Telat", "terhitung"], ["Riwayat", "tersimpan"]]),
  ]),
  cfg("F46-mitos-absen-digital-ribet", "amber", "Mudah dipakai siapa saja.", [
    C("Mitos: absen digital itu *ribet*", [["Mitos", "Karyawan harus belajar lama"], ["Mitos", "Harus punya HP canggih"], ["Fakta", "Cukup buka link, selfie, selesai"]]),
    S("Faktanya *cuma 3 langkah*", "Buka link", "Ambil selfie", "Selesai"),
    H("Jalan di *HP apa saja*", ["Android", "iPhone", "Browser biasa"]),
    PH("Rekap *ikut otomatis.*"),
  ]),
  cfg("F47-portal-vs-grup-wa", "dark", "Pilih yang rapi dan terdokumentasi.", [
    V("Portal Karyawan vs *grup WA*", "GRUP WA", ["Info tenggelam", "sulit dicari"], "PORTAL", ["Info tersimpan", "mudah dicari"]),
    C("Kenapa *portal lebih rapi*", [["Cuti dan lembur", "Tercatat jelas"], ["Slip gaji", "Tidak lewat chat"], ["Pengumuman", "Di satu tempat"]]),
    PH("Semua *di satu portal.*"),
    T("Grup WA *tetap berguna*", [["Obrolan santai", "ya"], ["Info penting", "pindah ke portal"], ["Dokumen", "di portal"]]),
  ]),
  cfg("F48-fitur-jadwal-kerja", "light", "Jadwal jelas, tim siap.", [
    C("Fitur Jadwal Kerja: *cek shift dari HP*", [["Karyawan", "Lihat shift sendiri"], ["Owner", "Atur jadwal tim"], ["Hasilnya", "Tidak ada salah baca"]]),
    PH("Jadwal *terlihat di HP.*"),
    T("Manfaat *jadwal digital*", [["Tidak tenggelam", "di chat"], ["Perubahan", "langsung terlihat"], ["Rekap", "terhubung absen"]]),
    S("Mulai *kapan saja*", "Isi pola shift", "Bagikan ke tim", "Pantau kehadiran"),
  ]),
  cfg("F49-laporan-gaji-dari-data", "dark", "Gaji dari data, bukan dari kira-kira.", [
    C("Laporan gaji *dari data absen*", [["Kehadiran", "Menjadi dasar"], ["Telat dan lembur", "Terhitung otomatis"], ["Potongan", "Terlihat jelas"]]),
    SL("Hasilnya *seperti ini*"),
    T("Tinggal *dicek*", [["Kebenaran data", "oleh owner"], ["Slip", "dibagikan lewat portal"], ["Arsip", "per bulan"]]),
    PH("Karyawan *cek sendiri.*"),
  ]),
  cfg("F50-untungnya-bagi-karyawan", "amber", "Baik untuk usaha, baik untuk karyawan.", [
    C("Apa untungnya HrCash *bagi karyawan?*", [["Slip", "Bisa dicek sendiri"], ["Cuti dan lembur", "Diajukan dari HP"], ["Catatan", "Jelas dan terbuka"]]),
    PH("Semua *di HP sendiri.*"),
    T("Karyawan *merasa dihargai*", [["Hak tercatat", "jelas"], ["Rincian gaji", "terbuka"], ["Jadwal", "terlihat"]]),
    S("Dimulai *dari satu link*", "Buka link", "Masuk dengan PIN", "Absen dan cek portal"),
  ]),
  // ===== Edukasi umum =====
  cfg("F51-apa-itu-umk", "dark", "Pahami dasarnya, hitung dengan tenang.", [
    C("Apa itu UMK? *Penjelasan singkat*", [["Singkatnya", "Upah minimum kabupaten/kota"], ["Ditetapkan oleh", "Pemerintah daerah"], ["Berlaku", "Berbeda tiap daerah"]]),
    B("Selalu cek *ketetapan terbaru*", "UMK", "berbeda tiap tahun dan daerah", I),
    T("Yang perlu *dilakukan owner*", [["Cek angka UMK", "daerahmu"], ["Bandingkan", "dengan gaji karyawan"], ["Catat dasar gaji", "di slip"]]),
    SL("Dasar gaji *terlihat jelas.*"),
  ]),
  cfg("F52-pkwt-vs-pkwtt", "light", "Bedakan jenis kontrak sejak awal.", [
    V("PKWT vs PKWTT: *apa bedanya?*", "PKWT", ["Perjanjian kerja", "waktu tertentu"], "PKWTT", ["Perjanjian kerja", "waktu tidak tertentu"]),
    C("Singkatnya", [["PKWT", "Kontrak dengan masa berakhir"], ["PKWTT", "Biasa disebut karyawan tetap"], ["Pastikan", "Jenis kontrak tertulis jelas"]]),
    B("Detail aturan *bisa berubah*", "Cek", "aturan terbaru", I),
    PH("Data karyawan *tersimpan rapi.*"),
  ]),
  cfg("F53-bpjs-ketenagakerjaan-garis-besar", "dark", "Pahami dulu, lalu cek aturan resmi.", [
    C("BPJS Ketenagakerjaan: *garis besarnya*", [["Apa itu", "Program jaminan sosial pekerja"], ["Isinya", "JKK, JKM, JHT, dan JP"], ["Pelaksana", "BPJS Ketenagakerjaan"]]),
    B("Detail iuran *dan ketentuan*", "Cek", "situs resmi BPJS", I),
    T("Persiapan *owner*", [["Data karyawan", "lengkap"], ["Masa kerja", "tercatat"], ["Slip gaji", "rapi"]]),
    PH("Data *tersimpan rapi.*"),
  ]),
  cfg("F54-gaji-bruto-vs-neto", "amber", "Angka yang jelas, tidak ada kaget.", [
    V("Gaji bruto vs neto: *apa bedanya?*", "BRUTO", ["Gaji sebelum", "potongan"], "NETO", ["Gaji setelah", "potongan"]),
    SL("Contoh *di slip gaji*"),
    T("Biar *tidak salah paham*", [["Tampilkan keduanya", "di slip"], ["Jelaskan potongan", "satu per satu"], ["Beri contoh", "saat onboarding"]]),
    PH("Slip *bisa dicek karyawan.*"),
  ]),
  cfg("F55-masa-percobaan-jelas", "dark", "Aturan di awal, kerja lebih tenang.", [
    C("Masa percobaan: *hal yang perlu jelas*", [["Tertulis", "Di perjanjian kerja"], ["Penilaian", "Kriteria yang disepakati"], ["Hasil", "Disampaikan tepat waktu"]]),
    B("Ketentuan detail *bisa berbeda*", "Cek", "aturan terbaru", I),
    T("Tips *untuk owner*", [["Catat kehadiran", "sejak hari pertama"], ["Evaluasi", "terjadwal"], ["Umpan balik", "teratur"]]),
    PH("Riwayat *tercatat rapi.*"),
  ]),
  cfg("F56-izin-sakit-cuti-dibedakan", "light", "Catatan jelas, hak terjaga.", [
    C("Izin, sakit, cuti: *bedakan pencatatannya*", [["Izin", "Keperluan tertentu"], ["Sakit", "Biasanya dengan keterangan"], ["Cuti", "Memakai jatah cuti"]]),
    T("Catat *dengan rapi*", [["Alasan", "dan tanggalnya"], ["Bukti", "jika diperlukan"], ["Riwayat", "per karyawan"]]),
    PH("Pengajuan *dari HP.*"),
    B("Aturan detail *tiap usaha berbeda*", "Tulis", "aturanmu sendiri", I),
  ]),
  cfg("F57-lembur-vs-shift-tambahan", "dark", "Bedakan supaya hitungan tepat.", [
    C("Lembur vs shift tambahan: *jangan tertukar*", [["Lembur", "Kerja di luar jam kerja normal"], ["Shift tambahan", "Jadwal kerja tambahan resmi"], ["Penting", "Catat dan beri nama yang jelas"]]),
    B("Hitungan *bisa berbeda*", "Cek", "aturan terbaru", I),
    T("Biar *tidak keliru*", [["Catat jam", "dengan jelas"], ["Beri label", "lembur atau shift"], ["Tampilkan di slip", "terbuka"]]),
    PH("Pengajuan *dari portal.*"),
  ]),
  cfg("F58-thr-bukan-bonus", "amber", "Bedakan haknya, catat dengan jelas.", [
    V("THR dan bonus: *apa bedanya?*", "THR", ["Terkait hari raya", "keagamaan"], "BONUS", ["Kebijakan usaha", "atas pencapaian"]),
    C("Singkatnya", [["THR", "Mengikuti aturan THR"], ["Bonus", "Sesuai kebijakan usaha"], ["Slip", "Tulis terpisah dan jelas"]]),
    B("Detail aturan *THR*", "Cek", "aturan terbaru", I),
    SL("Rincian *terlihat di slip.*"),
  ]),
  cfg("F59-arsip-dokumen-karyawan", "light", "Arsip rapi, data terjaga.", [
    T("Arsip dokumen karyawan: *apa yang disimpan?*", [["Perjanjian kerja", "dan perubahan"], ["Data diri", "yang diperlukan"], ["Slip dan kehadiran", "per bulan"]]),
    B("Jaga *kerahasiaan*", "Privat", "data pribadi karyawan", "Hanya yang berwenang yang mengakses."),
    S("Cara *merapikannya*", "Pisahkan per karyawan", "Beri nama konsisten", "Cadangkan secara berkala"),
    PH("Riwayat *tersimpan di sistem.*"),
  ]),
  cfg("F60-hak-kewajiban-satu-lembar", "dark", "Jelas di awal, nyaman di akhir.", [
    S("Hak dan kewajiban: *tulis dalam satu lembar*", "Tulis hak karyawan", "Tulis kewajiban karyawan", "Bagikan dan jelaskan"),
    C("Isi *yang sebaiknya ada*", [["Jam kerja", "Masuk, pulang, istirahat"], ["Kehadiran", "Telat, izin, cuti"], ["Gaji", "Tanggal dan rincian"]]),
    B("Sesuaikan *dengan aturan*", "Cek", "aturan terbaru", I),
    PH("Aturan dan slip *di satu portal.*"),
  ]),
];
