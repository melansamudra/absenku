// Data iklan HrCash: tiap entri = 1 hook (headline di gambar) + teks iklan Meta.
// Aturan: tidak ada testimoni/angka palsu; klaim hanya fitur yang memang ada di aplikasi.
// Harga: Rp289.000 sekali bayar (satu akun bisnis).

export const angles = {
  A: "Titip absen & kecurangan",
  B: "Gajian ribet",
  C: "Harga: bayar sekali",
  D: "Telat & lembur",
  E: "Karyawan mandiri (slip, cuti)",
  F: "Kasbon",
  G: "Kemudahan",
  H: "BPJS & PPh 21",
  I: "Privasi foto selfie",
  J: "Pertanyaan pembuka",
};

// theme: dark | light | amber. mock: lihat build.mjs. cta: tombol Meta.
export const ads = [
  // --- A. Titip absen ---
  { slug: "a1-lebih-sulit", angle: "A", theme: "dark", mock: "absen",
    h: "Karyawan titip absen? <em>Lebih sulit</em> sekarang.", sub: "Absen selfie + lokasi kantor + PIN pribadi.",
    primary: "Capek karyawan titip absen? Di HrCash, karyawan absen lewat selfie, harus berada di lokasi kantor, dan memasukkan PIN pribadi. Telat dan lembur terhitung otomatis.\n\nRp289.000 sekali bayar, tanpa langganan.",
    headline: "Absen selfie anti titip", desc: "Bayar sekali, tanpa langganan", cta: "Pelajari Selengkapnya" },
  { slug: "a2-dari-rumah", angle: "A", theme: "light", mock: "absenLuar",
    h: "Absen dari rumah? <em>Sistem tahu</em> lokasinya.", sub: "Di luar radius kantor, absen ditolak.",
    primary: "Absen dari luar kantor tidak lolos. HrCash mengecek lokasi karyawan saat absen selfie: di luar radius yang kamu tentukan, absen ditolak.\n\nCocok untuk toko, kafe, klinik, dan bengkel. Rp289.000 sekali bayar.",
    headline: "Absen hanya sah di lokasi kantor", desc: "Radius kantor kamu yang atur", cta: "Pelajari Selengkapnya" },
  { slug: "a3-buku-absen", angle: "A", theme: "amber", mock: "dashboard",
    h: "Buku absen bisa <em>diisi siapa saja.</em>", sub: "Ganti dengan absen selfie yang terekam rapi.",
    primary: "Buku absen gampang diisi orang lain, dan rekapnya makan waktu. Dengan HrCash, tiap absen tercatat lengkap: jam, lokasi, dan selfie. Rekap bulanan jadi otomatis.\n\nRp289.000 sekali bayar.",
    headline: "Ganti buku absen dengan selfie", desc: "Rekap otomatis tiap bulan", cta: "Pelajari Selengkapnya" },

  // --- B. Gajian ---
  { slug: "b1-tanggal-25", angle: "B", theme: "dark", mock: "slip",
    h: "Tanggal 25, <em>jangan begadang</em> rekap gaji.", sub: "Absen, lembur, dan potongan sudah terhitung.",
    primary: "Gajian tiap bulan, rekap dari tanggal 20? HrCash mengumpulkan absensi, lembur, potongan telat, dan kasbon jadi slip gaji otomatis.\n\nRp289.000 sekali bayar, tanpa biaya per karyawan.",
    headline: "Slip gaji jadi otomatis", desc: "Tanpa biaya per karyawan", cta: "Pelajari Selengkapnya" },
  { slug: "b2-sekali-klik", angle: "B", theme: "light", mock: "slip",
    h: "Gajian beres <em>sekali klik.</em>", sub: "Absen, lembur, potongan, dan kasbon jadi slip gaji otomatis.",
    primary: "Satu klik, semua slip gaji bulan ini jadi. Karyawan bisa cek slipnya sendiri, kamu bisa cetak kalau perlu.\n\nHrCash: Rp289.000 sekali bayar.",
    headline: "Slip gaji sekali klik", desc: "Bisa dicetak atau dilihat online", cta: "Daftar" },
  { slug: "b3-berapa-jam", angle: "B", theme: "dark", mock: "dashboard",
    h: "Berapa jam sebulan kamu habiskan <em>buat hitung gaji?</em>", sub: "HrCash merangkumnya otomatis dari data absen.",
    primary: "Hitung gaji manual itu menyita waktu dan rawan salah. Dengan HrCash, data absen, lembur, dan potongan sudah terkumpul sebelum gajian tiba.\n\nRp289.000 sekali bayar.",
    headline: "Hemat waktu tiap gajian", desc: "Data absen terkumpul otomatis", cta: "Pelajari Selengkapnya" },

  // --- C. Harga ---
  { slug: "c1-bayar-sekali", angle: "C", theme: "dark", mock: "sekali",
    h: "Bayar <em>sekali.</em> Bukan langganan.", sub: "Absensi dan payroll untuk usaha kecil.",
    primary: "Banyak aplikasi HR menarik bayaran tiap bulan. HrCash cukup Rp289.000 sekali bayar. Absen selfie, payroll, cuti, lembur, dan kasbon sudah termasuk. Lihat demonya dulu.",
    headline: "Rp289rb, sekali bayar", desc: "Tanpa langganan bulanan", cta: "Pelajari Selengkapnya", hidePrice: true },
  { slug: "c2-sekali-titik", angle: "C", theme: "amber", mock: "harga",
    h: "Rp289.000. <em>Sekali. Titik.</em>", sub: "Tanpa langganan bulanan, tanpa biaya per karyawan.",
    primary: "Rp289.000. Sekali bayar. Tanpa tagihan bulanan dan tanpa biaya per karyawan (untuk satu akun bisnis).\n\nAbsen selfie, payroll, cuti, lembur, kasbon.",
    headline: "Rp289.000 sekali bayar", desc: "Satu akun bisnis, tanpa langganan", cta: "Pelajari Selengkapnya", hidePrice: true },
  { slug: "c3-per-hari", angle: "C", theme: "light", mock: "harga",
    h: "Kurang dari <em>Rp800 per hari</em> kalau dipakai setahun.", sub: "Bayar sekali, tanpa tagihan bulanan.",
    primary: "Rp289.000 dibagi 365 hari kurang dari Rp800 per hari, dan bayarnya cuma sekali. Itu untuk absensi, payroll, cuti, lembur, dan kasbon sekaligus.",
    headline: "Kurang dari Rp800 per hari", desc: "Bayar sekali saja", cta: "Pelajari Selengkapnya", hidePrice: true },
  { slug: "c4-tanpa-tagihan", angle: "C", theme: "light", mock: "sekali",
    h: "Aplikasi HR <em>tanpa tagihan bulanan.</em>", sub: "Absensi, cuti, lembur, kasbon, dan slip gaji.",
    primary: "Aplikasi HR tanpa tagihan bulanan: ada. HrCash Rp289.000 sekali bayar untuk satu akun bisnis. Cocok untuk usaha dengan karyawan yang tidak banyak.",
    headline: "HR tanpa tagihan bulanan", desc: "Sekali bayar Rp289.000", cta: "Pelajari Selengkapnya", hidePrice: true },

  // --- D. Telat & lembur ---
  { slug: "d1-pakai-perasaan", angle: "D", theme: "dark", mock: "lembur",
    h: "Lembur dihitung <em>pakai perasaan?</em>", sub: "Hitung otomatis dari jam absen dan aturanmu.",
    primary: "Lembur yang dihitung kira-kira bikin karyawan ragu dan pemilik rugi. HrCash menghitung lembur dari jam absen pulang, dengan aturan yang kamu atur sendiri.\n\nRp289.000 sekali bayar.",
    headline: "Lembur dihitung otomatis", desc: "Aturan kamu yang atur", cta: "Pelajari Selengkapnya" },
  { slug: "d2-telat-berapa", angle: "D", theme: "light", mock: "telatTier",
    h: "Telat 10 menit, dipotong berapa? <em>Kamu yang atur.</em>", sub: "Potongan telat bertingkat sesuai kebijakan usahamu.",
    primary: "Atur potongan telat bertingkat sesuai kebijakanmu, misalnya telat sebentar tidak dipotong, telat lama dipotong lebih besar. Semua terhitung otomatis di slip gaji.\n\nRp289.000 sekali bayar.",
    headline: "Potongan telat bertingkat", desc: "Aturan sesuai kebijakanmu", cta: "Pelajari Selengkapnya" },
  { slug: "d3-otomatis", angle: "D", theme: "amber", mock: "lembur",
    h: "Telat dan lembur <em>dihitung otomatis.</em>", sub: "Adil buat karyawan, aman buat pemilik usaha.",
    primary: "Telat dan lembur terhitung otomatis dari jam absen. Adil buat karyawan, aman buat pemilik usaha.\n\nHrCash: Rp289.000 sekali bayar.",
    headline: "Telat & lembur otomatis", desc: "Adil dan transparan", cta: "Pelajari Selengkapnya" },

  // --- E. Karyawan mandiri ---
  { slug: "e1-slip-mana", angle: "E", theme: "dark", mock: "portal",
    h: "&ldquo;Bos, slip gaji saya <em>mana?</em>&rdquo;", sub: "Sekarang karyawan cek sendiri di portal.",
    primary: "Tiap gajian ada saja yang nanya slip. Di HrCash, karyawan masuk ke Portal Karyawan dengan PIN, lalu cek slip gaji, sisa cuti, dan kasbonnya sendiri.\n\nRp289.000 sekali bayar.",
    headline: "Karyawan cek slip sendiri", desc: "Lewat Portal Karyawan", cta: "Pelajari Selengkapnya" },
  { slug: "e2-cek-sendiri", angle: "E", theme: "light", mock: "portal",
    h: "Karyawan cek slip <em>sendiri.</em>", sub: "Tidak perlu lagi kirim slip satu per satu.",
    primary: "Tidak perlu lagi kirim slip gaji satu per satu lewat chat. Karyawan cek sendiri lewat Portal Karyawan, dari HP masing-masing.\n\nRp289.000 sekali bayar.",
    headline: "Portal Karyawan", desc: "Slip, cuti, dan kasbon sendiri", cta: "Pelajari Selengkapnya" },
  { slug: "e3-cuti-wa", angle: "E", theme: "amber", mock: "cuti",
    h: "Izin cuti <em>tanpa chat WA.</em>", sub: "Ajukan, setujui, dan sisa kuota terhitung otomatis.",
    primary: "Pengajuan cuti lewat chat WA gampang tenggelam. Di HrCash, karyawan mengajukan lewat link, kamu setujui atau tolak, dan sisa kuota cuti terhitung otomatis.\n\nRp289.000 sekali bayar.",
    headline: "Pengajuan cuti rapi", desc: "Sisa kuota otomatis", cta: "Pelajari Selengkapnya" },

  // --- F. Kasbon ---
  { slug: "f1-kasbon-lupa", angle: "F", theme: "dark", mock: "kasbon",
    h: "Kasbon lupa dicatat? <em>Rugi diam-diam.</em>", sub: "Semua tercatat dan dipotong dari gaji.",
    primary: "Kasbon yang cuma dicatat di ingatan gampang terlewat. HrCash mencatat kasbon dan pinjaman karyawan, lalu memotongnya dari slip gaji sesuai cicilan.\n\nRp289.000 sekali bayar.",
    headline: "Kasbon tercatat rapi", desc: "Terpotong dari gaji otomatis", cta: "Pelajari Selengkapnya" },
  { slug: "f2-kasbon-otomatis", angle: "F", theme: "light", mock: "kasbon",
    h: "Kasbon <em>terpotong otomatis</em> dari gaji.", sub: "Sisa dan riwayatnya jelas untuk kedua pihak.",
    primary: "Karyawan tahu sisa kasbonnya, kamu tahu siapa yang masih punya tanggungan. Cicilan terpotong otomatis di slip gaji.\n\nHrCash: Rp289.000 sekali bayar.",
    headline: "Sisa kasbon selalu jelas", desc: "Riwayat bisa dicek karyawan", cta: "Pelajari Selengkapnya" },

  // --- G. Kemudahan ---
  { slug: "g1-import", angle: "G", theme: "dark", mock: "importCsv",
    h: "Karyawan banyak? <em>Import sekaligus.</em>", sub: "Upload file CSV, data karyawan langsung masuk.",
    primary: "Tidak perlu input satu per satu. Siapkan data karyawan di file CSV, upload ke HrCash, dan baris yang bermasalah ditandai tanpa menggagalkan yang lain.\n\nRp289.000 sekali bayar.",
    headline: "Import karyawan lewat CSV", desc: "Data langsung masuk", cta: "Pelajari Selengkapnya" },
  { slug: "g2-tanpa-install", angle: "G", theme: "light", mock: "link",
    h: "Tanpa install aplikasi. <em>Cukup buka link.</em>", sub: "Karyawan absen dari browser HP masing-masing.",
    primary: "Karyawan tidak perlu install apa pun. Cukup buka link absen di HP, pilih nama, ambil selfie, dan selesai.\n\nRp289.000 sekali bayar.",
    headline: "Absen lewat link, tanpa install", desc: "Dari browser HP karyawan", cta: "Pelajari Selengkapnya" },
  { slug: "g3-pantau", angle: "G", theme: "amber", mock: "dashboard",
    h: "Pantau absensi dari HP, <em>kapan saja.</em>", sub: "Ringkas: hadir, telat, cuti, dan persetujuan.",
    primary: "Lihat siapa yang sudah hadir, telat, atau izin hari ini dari HP kamu, tanpa harus ke kantor. Dashboard ringkas, mudah dipahami.\n\nRp289.000 sekali bayar.",
    headline: "Pantau absensi dari mana saja", desc: "Dashboard ringkas", cta: "Pelajari Selengkapnya" },

  // --- H. BPJS & PPh 21 (opsional, hati-hati klaim) ---
  { slug: "h1-bpjs-pph", angle: "H", theme: "dark", mock: "pajak",
    h: "BPJS dan PPh 21 <em>ikut terhitung.</em>", sub: "Fitur opsional untuk membantu hitung potongan gaji.",
    primary: "Aktifkan perhitungan BPJS dan PPh 21 (metode TER) kalau usahamu membutuhkannya. Fitur ini membantu menghitung; tetap konfirmasikan ke akuntan atau konsultan pajak untuk pelaporan resmi.\n\nRp289.000 sekali bayar.",
    headline: "Bantu hitung BPJS & PPh 21", desc: "Fitur opsional", cta: "Pelajari Selengkapnya" },

  // --- I. Privasi (pastikan fitur hapus foto sudah ter-deploy sebelum iklan jalan) ---
  { slug: "i1-foto-dihapus", angle: "I", theme: "dark", mock: "foto",
    h: "Selfie karyawan <em>otomatis terhapus</em> setelah disetujui.", sub: "Data jam dan lokasi tetap tersimpan.",
    primary: "Foto selfie absen dihapus permanen setelah admin menyetujui, dan paling lambat 30 hari kalau belum disetujui. Data jam, lokasi, dan status absensi tetap tersimpan.\n\nRp289.000 sekali bayar.",
    headline: "Selfie otomatis terhapus", desc: "Privasi karyawan lebih terjaga", cta: "Pelajari Selengkapnya" },

  // --- J. Pertanyaan pembuka ---
  { slug: "j1-buku-excel", angle: "J", theme: "amber", mock: "absen",
    h: "Masih absen pakai <em>buku dan Excel?</em>", sub: "Saatnya pindah ke yang otomatis.",
    primary: "Absen di buku, rekap di Excel, hitung gaji pakai kalkulator. Capek, kan? Pindah ke HrCash: absen selfie, rekap otomatis, slip gaji jadi sendiri.\n\nRp289.000 sekali bayar.",
    headline: "Pindah dari buku & Excel", desc: "Absen, rekap, gaji otomatis", cta: "Pelajari Selengkapnya" },
];
