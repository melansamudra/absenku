// Batch 2: 30 post feed IG (1-3 slide), tema berbeda dari batch 1.
export const POSTS = [
  // ---------- 1 slide ----------
  { id: "P31-hemat-listrik", pal: "kuning", tag: "GAYA HIDUP", cap: "Tagihan listrik naik? Coba kebiasaan kecil ini selama sebulan lalu bandingkan tagihannya. Kebiasaan mana yang sudah kamu lakukan?", slides: [
    { k: "list", title: "Tagihan listrik naik? *4 kebiasaan yang bisa dicoba*", items: [["Cabut charger", "Yang tidak dipakai jangan dibiarkan tersambung."], ["Pakai lampu LED", "Lebih hemat daripada lampu biasa."], ["Suhu AC tidak terlalu rendah", "Atur secukupnya."], ["Setrika sekali banyak", "Kumpulkan pakaian, setrika sekaligus."]] },
  ] },
  { id: "P32-tolak-ajakan-nongkrong", pal: "terang", tag: "GAYA HIDUP", cap: "Menolak ajakan itu boleh, asal jujur dan ramah. Simpan kalimat ini untuk dipakai saat butuh.", slides: [
    { k: "quote", text: "\"Aku skip dulu ya, lagi nabung. *Lain kali aku ikut.*\"", sub: "Jujur, singkat, dan tetap ramah. Tidak perlu alasan panjang." },
  ] },
  { id: "P33-self-care-gratis", pal: "koral", tag: "KESEHATAN MENTAL", cap: "Self-care tidak harus mahal. Pilih satu yang bisa kamu lakukan hari ini.", slides: [
    { k: "bullets", title: "Self-care *gratis* yang bisa dilakukan hari ini", items: ["Jalan kaki 15 menit", "Tidur lebih awal", "Matikan notifikasi 1 jam", "Tulis 3 hal yang disyukuri", "Telepon teman lama"] },
  ] },
  { id: "P34-belanja-bulanan-hemat", pal: "hijau", tag: "KEUANGAN", cap: "Belanja bulanan sering bocor di hal kecil. Coba empat langkah ini sebelum ke toko.", slides: [
    { k: "list", title: "Belanja bulanan *lebih hemat* dengan 4 langkah", items: [["Cek stok dulu", "Supaya tidak beli dobel."], ["Buat daftar belanja", "Beli sesuai daftar."], ["Bandingkan harga satuan", "Bukan harga kemasan."], ["Jangan belanja saat lapar", "Biasanya jadi beli berlebihan."]] },
  ] },
  { id: "P35-mitos-begadang", pal: "biru", tag: "PRODUKTIVITAS", cap: "Mitos dan fakta soal begadang dan produktivitas. Informasi umum, bukan saran medis.", slides: [
    { k: "compare", title: "Mitos: begadang bikin *lebih produktif*", l: ["MITOS", ["Begadang bikin kerja lebih banyak", "Kurang tidur tidak masalah"]], r: ["FAKTA", ["Tidur cukup membantu fokus dan ingatan", "Kurang tidur bisa menurunkan konsentrasi"]], note: "Informasi umum, bukan saran medis." },
  ] },
  { id: "P36-prompt-ai-bahasa-inggris", pal: "terang", tag: "AI DAN BELAJAR", cap: "Tiga prompt untuk melatih bahasa Inggris dengan AI. Ganti bagian dalam kurung dengan topikmu.", slides: [
    { k: "list", title: "3 prompt AI untuk *belajar bahasa Inggris*", items: [["Latih percakapan", "\"Jadi lawan bicaraku (level pemula) dan koreksi kesalahanku.\""], ["Kosakata", "\"Beri 10 kosakata tentang [topik] beserta contoh kalimat.\""], ["Rapikan tulisan", "\"Perbaiki kalimat ini dan jelaskan kesalahannya.\""]] },
  ] },
  { id: "P37-poll-musik-saat-kerja", pal: "kuning", tag: "PRODUKTIVITAS", cap: "Kamu tim mana? Komen A, B, atau C.", slides: [
    { k: "poll", title: "Kerja sambil dengar musik atau *hening?*", options: [["A", "Musik tanpa lirik"], ["B", "Hening total"], ["C", "Musik apa saja"]], note: "Komen A, B, atau C." },
  ] },
  { id: "P38-ritme-fokus-90-20", pal: "hijau", tag: "PRODUKTIVITAS", cap: "Contoh ritme kerja fokus. Sesuaikan durasinya dengan dirimu. Simpan untuk dicoba besok.", slides: [
    { k: "formula", title: "Ritme fokus *90/20*", big: "90/20", rows: [["90 menit", "Fokus penuh"], ["20 menit", "Istirahat"], ["2 kali", "Cukup sehari"]], note: "Contoh ritme. Sesuaikan dengan dirimu." },
  ] },
  { id: "P39-tanda-butuh-libur", pal: "koral", tag: "DUNIA KERJA", cap: "Kalau beberapa tanda ini muncul, mungkin waktunya cuti. Tag temanmu yang perlu istirahat.", slides: [
    { k: "bullets", title: "5 tanda kamu *butuh libur*", items: ["Mudah lupa hal kecil", "Lelah walau akhir pekan", "Hobi terasa membosankan", "Gampang tersinggung", "Sulit menikmati pencapaian"], note: "Ambil cuti sebelum terlalu lelah." },
  ] },
  { id: "P40-etika-chat-kerja", pal: "biru", tag: "DUNIA KERJA", cap: "Etika chat kerja yang bikin komunikasi lebih lancar. Setuju yang mana?", slides: [
    { k: "bullets", title: "5 etika *chat kerja*", items: ["Tulis tujuan di kalimat pertama", "Hindari chat di luar jam kerja kecuali mendesak", "Satu topik satu pesan", "Balas singkat agar jelas sudah dibaca", "Voice note panjang? Beri konteks dulu"] },
  ] },
  // ---------- 2 slide ----------
  { id: "P41-cv-ramah-sistem", pal: "terang", tag: "KARIER", cap: "Banyak perusahaan menyaring CV dengan sistem. Rapikan format CV-mu dengan tips ini.", slides: [
    { k: "cover", title: "CV yang *lolos seleksi sistem*", sub: "4 tips format yang aman." },
    { k: "bullets", title: "4 tips *format CV*", items: ["Pakai format sederhana, satu kolom", "Gunakan kata kunci dari lowongan", "Cantumkan angka pencapaian", "Simpan sebagai PDF kecuali diminta lain"] },
  ] },
  { id: "P42-meal-prep-seminggu", pal: "hijau", tag: "GAYA HIDUP", cap: "Meal prep bantu hemat uang dan waktu. Mulai dari porsi kecil dulu.", slides: [
    { k: "cover", title: "Meal prep hemat *untuk 1 minggu*", sub: "Urutan sederhana untuk pemula." },
    { k: "steps", title: "Urutannya *4 langkah*", items: [["Rencanakan menu", "Untuk 5 hari kerja."], ["Belanja sekali", "Sesuai daftar."], ["Masak bahan dasar", "Nasi, protein, sayur."], ["Bagi ke wadah", "Simpan sesuai aturan."]] },
  ] },
  { id: "P43-belajar-investasi-dasar", pal: "biru", tag: "KEUANGAN", cap: "Informasi umum, bukan saran investasi. Pelajari risikonya dan sesuaikan dengan kondisimu.", slides: [
    { k: "cover", title: "Belajar investasi dari nol: *urutan belajarnya*", sub: "Informasi umum, bukan saran investasi." },
    { k: "steps", title: "Urutan *yang aman*", items: [["Dana darurat dulu", "Sebelum mulai investasi."], ["Kenali produk dan risikonya", "Jangan ikut-ikutan."], ["Simulasi dulu", "Sebelum pakai uang asli."], ["Nominal kecil", "Yang tidak mengganggu kebutuhan."]] },
  ] },
  { id: "P44-rekan-suka-menyela", pal: "kuning", tag: "DUNIA KERJA", cap: "Disela saat bicara itu menyebalkan. Coba kalimat ini dengan nada tenang.", slides: [
    { k: "cover", title: "Rekan kerja suka menyela? *3 kalimat ini membantu*", sub: "Tegas tanpa harus bertengkar." },
    { k: "steps", title: "Pakai *kalimat ini*", items: [["Pertama", "\"Sebentar, saya selesaikan dulu ya.\""], ["Kedua", "\"Boleh saya lanjutkan poin ini?\""], ["Ketiga", "\"Setelah ini giliranmu, saya mau dengar.\""]] },
  ] },
  { id: "P45-rutinitas-malam", pal: "hijau", tag: "GAYA HIDUP", cap: "Rutinitas malam singkat bikin pagi lebih ringan. Coba malam ini.", slides: [
    { k: "cover", title: "Rutinitas malam *10 menit*", sub: "Biar besok pagi lebih tenang." },
    { k: "steps", title: "Urutan *10 menit*", items: [["Menit 0-3", "Rapikan meja kerja."], ["Menit 3-6", "Siapkan pakaian dan tas besok."], ["Menit 6-10", "Tulis 3 prioritas besok, lalu jauhkan HP."]] },
  ] },
  { id: "P46-aturan-dua-menit", pal: "koral", tag: "PRODUKTIVITAS", cap: "Susah mulai kebiasaan baru? Perkecil dulu sampai terasa ringan.", slides: [
    { k: "cover", title: "Susah mulai kebiasaan? *Coba aturan 2 menit*", sub: "Mulai kecil, naik pelan-pelan." },
    { k: "steps", title: "Cara *menjalankannya*", items: [["Perkecil", "Jadikan kebiasaan itu hanya 2 menit."], ["Contoh", "Baca satu halaman, bukan satu bab."], ["Konsisten", "Lakukan tiap hari."], ["Naikkan", "Setelah nyaman, tambah sedikit."]] },
  ] },
  { id: "P47-foto-produk-hp", pal: "kuning", tag: "BISNIS KECIL", cap: "Foto produk bagus tidak harus pakai kamera mahal. Cahaya dan latar yang menentukan.", slides: [
    { k: "cover", title: "Foto produk pakai HP, *tetap enak dilihat*", sub: "4 tips yang bisa langsung dipakai." },
    { k: "bullets", title: "4 tips *foto produk*", items: ["Pakai cahaya dari jendela", "Pilih latar polos", "Bersihkan lensa HP", "Ambil dari 3 sudut"] },
  ] },
  { id: "P48-nabung-52-minggu", pal: "biru", tag: "KEUANGAN", cap: "Tantangan nabung 52 minggu: naik Rp10.000 tiap minggu. Total di slide kedua adalah contoh hitungan.", slides: [
    { k: "cover", title: "Tantangan nabung *52 minggu*", sub: "Naik Rp10.000 tiap minggu." },
    { k: "formula", title: "Contoh *hitungannya*", big: "Rp13,78 jt", rows: [["Minggu 1", "Rp10.000"], ["Minggu 26", "Rp260.000"], ["Minggu 52", "Rp520.000"]], note: "Total setahun Rp13.780.000 (contoh hitungan)." },
  ] },
  { id: "P49-gugup-bicara-depan-umum", pal: "terang", tag: "KARIER", cap: "Gugup itu wajar. Latihan dan persiapan bantu banyak. Teknik mana yang mau kamu coba?", slides: [
    { k: "cover", title: "Gugup bicara di depan umum? *4 teknik ini*", sub: "Bisa dilatih, bukan bakat bawaan." },
    { k: "bullets", title: "4 teknik *yang membantu*", items: ["Latih intro berkali-kali", "Tarik napas pelan sebelum mulai", "Fokus ke pesan, bukan ke dirimu", "Siapkan satu cerita pendek"] },
  ] },
  { id: "P50-liburan-hemat", pal: "hijau", tag: "GAYA HIDUP", cap: "Liburan hemat tetap bisa menyenangkan. Mulai dari budget total.", slides: [
    { k: "cover", title: "Liburan hemat *tanpa terasa pelit*", sub: "Rencana 3 langkah." },
    { k: "steps", title: "Rencana *3 langkah*", items: [["Tentukan budget total", "Sebelum mencari tiket."], ["Pesan jauh hari", "Tiket dan penginapan."], ["Pilih 2-3 aktivitas utama", "Sisanya fleksibel."]] },
  ] },
  // ---------- 3 slide ----------
  { id: "P51-caption-jualan", pal: "kuning", tag: "BISNIS KECIL", cap: "Caption jualan sederhana dengan rumus AIDA. Contoh di slide terakhir bisa kamu ubah sesuai produkmu.", slides: [
    { k: "cover", title: "Caption jualan yang *bikin orang beli*", sub: "Pakai rumus AIDA." },
    { k: "list", title: "Rumus *AIDA*", items: [["Attention", "Hook di kalimat pertama."], ["Interest", "Ceritakan manfaat, bukan cuma fitur."], ["Desire", "Beri alasan kenapa cocok untuknya."], ["Action", "Ajak jelas: pesan, DM, atau klik."]] },
    { k: "quote", text: "\"Capek masak tiap hari? *Kami antar siap santap.* Pesan sebelum jam 10.\"", sub: "Contoh caption sederhana. Ubah sesuai produkmu." },
  ] },
  { id: "P52-inbox-realistis", pal: "terang", tag: "PRODUKTIVITAS", cap: "Inbox zero itu tidak harus sempurna. Mulai dari tiga aturan sederhana.", slides: [
    { k: "cover", title: "Inbox penuh? *Cara realistis merapikannya*", sub: "Tanpa harus kosong total." },
    { k: "bullets", title: "3 aturan *dasar*", items: ["Cek email di 2 waktu tetap", "Balas langsung kalau kurang dari 2 menit", "Arsipkan yang sudah selesai"] },
    { k: "steps", title: "Rencana *3 hari*", items: [["Hari 1", "Berhenti langganan newsletter yang tidak dibaca."], ["Hari 2", "Buat 3 label atau folder."], ["Hari 3", "Jadwalkan jam cek email."]] },
  ] },
  { id: "P53-setup-meja-wfh", pal: "biru", tag: "DUNIA KERJA", cap: "Setup meja kerja yang nyaman bikin kerja lebih tahan lama. Ada yang mau kamu ubah?", slides: [
    { k: "cover", title: "Setup meja kerja *di rumah yang nyaman*", sub: "Sederhana, tanpa perabot mahal." },
    { k: "bullets", title: "3 hal *utama*", items: ["Layar sejajar dengan mata", "Kursi menopang punggung", "Cahaya cukup, tidak silau"] },
    { k: "bullets", title: "Kebiasaan *pendukung*", items: ["Berdiri tiap 45 menit", "Siapkan air minum", "Tutup laptop saat jam kerja selesai"] },
  ] },
  { id: "P54-penghasilan-tidak-tetap", pal: "hijau", tag: "KEUANGAN", cap: "Untuk freelancer dan pekerja lepas: atur uang dengan sistem sederhana. Informasi umum, bukan saran keuangan.", slides: [
    { k: "cover", title: "Penghasilan tidak tetap? *Cara mengatur uangnya*", sub: "Untuk freelancer dan pekerja lepas." },
    { k: "bullets", title: "3 prinsip *dasar*", items: ["Hitung rata-rata 6 bulan terakhir", "Gaji dirimu sendiri tiap bulan", "Sisihkan untuk pajak dan dana darurat"] },
    { k: "formula", title: "Pakai *3 pos*", big: "3 pos", rows: [["Pos 1", "Penampung penghasilan"], ["Pos 2", "Gaji bulanan sendiri"], ["Pos 3", "Dana darurat dan pajak"]] },
  ] },
  { id: "P55-minta-feedback-atasan", pal: "koral", tag: "KARIER", cap: "Minta feedback itu tanda kamu mau berkembang. Siapkan dulu sebelum bertanya.", slides: [
    { k: "cover", title: "Cara minta feedback *ke atasan*", sub: "Biar jawabannya berguna." },
    { k: "bullets", title: "Persiapan *singkat*", items: ["Pilih waktu yang tenang", "Tanyakan hal yang spesifik", "Siap mencatat, bukan membela diri"] },
    { k: "quote", text: "\"Menurut Bapak/Ibu, *satu hal apa yang bisa saya tingkatkan?*\"", sub: "Lalu dengarkan sampai selesai." },
  ] },
  { id: "P56-validasi-ide-7-hari", pal: "kuning", tag: "BISNIS KECIL", cap: "Sebelum keluar modal besar, uji ide bisnismu dulu selama seminggu.", slides: [
    { k: "cover", title: "Validasi ide bisnis *dalam 7 hari*", sub: "Sebelum keluar modal besar." },
    { k: "list", title: "Hari *1 sampai 3*", items: [["Hari 1", "Tulis masalah yang ingin kamu selesaikan."], ["Hari 2", "Ngobrol dengan 5 calon pembeli."], ["Hari 3", "Cek pesaing dan kisaran harga."]] },
    { k: "list", title: "Hari *4 sampai 7*", items: [["Hari 4-5", "Buat versi sederhana atau pre-order."], ["Hari 6", "Tawarkan ke 10 orang."], ["Hari 7", "Catat respons, lalu putuskan lanjut atau ubah."]] },
  ] },
  { id: "P57-teknik-pomodoro", pal: "terang", tag: "PRODUKTIVITAS", cap: "Pomodoro bantu fokus pada satu tugas. Coba satu sesi hari ini.", slides: [
    { k: "cover", title: "Sulit fokus? *Coba teknik Pomodoro*", sub: "Kerja pendek, istirahat teratur." },
    { k: "formula", title: "Cara *dasarnya*", big: "25/5", rows: [["25 menit", "Fokus satu tugas"], ["5 menit", "Istirahat singkat"], ["4 putaran", "Lalu istirahat panjang"]] },
    { k: "bullets", title: "Variasi *yang bisa dicoba*", items: ["50/10 untuk tugas berat", "Matikan notifikasi saat fokus", "Catat gangguan yang muncul"] },
  ] },
  { id: "P58-evaluasi-usaha", pal: "biru", tag: "BISNIS KECIL", cap: "Rencana tidak selalu berjalan. Evaluasi singkat membantu langkah berikutnya.", slides: [
    { k: "cover", title: "Usaha tidak sesuai rencana? *3 pertanyaan evaluasi*", sub: "Evaluasi tanpa menyalahkan diri." },
    { k: "list", title: "Tiga *pertanyaan*", items: [["1", "Apa yang sebenarnya terjadi?"], ["2", "Penyebab mana yang bisa kukendalikan?"], ["3", "Apa yang akan kuubah?"]] },
    { k: "steps", title: "Tindak *lanjutnya*", items: [["Tulis fakta", "Bukan perasaan."], ["Pilih 1 perbaikan", "Jangan banyak sekaligus."], ["Uji 30 hari", "Lalu evaluasi lagi."]] },
  ] },
  { id: "P59-persiapan-wawancara-7-hari", pal: "hijau", tag: "KARIER", cap: "Persiapan seminggu cukup untuk tampil lebih percaya diri. Simpan sebagai pengingat.", slides: [
    { k: "cover", title: "Persiapan wawancara kerja *dalam 7 hari*", sub: "Rencana harian yang realistis." },
    { k: "list", title: "Hari *1 sampai 3*", items: [["Hari 1", "Riset perusahaan dan posisinya."], ["Hari 2", "Siapkan 3 cerita pencapaian."], ["Hari 3", "Latih jawaban pertanyaan umum."]] },
    { k: "list", title: "Hari *4 sampai 7*", items: [["Hari 4-5", "Simulasi dengan teman."], ["Hari 6", "Siapkan pertanyaan untuk pewawancara."], ["Hari 7", "Siapkan pakaian dan rute."]] },
  ] },
  { id: "P60-rencana-90-hari", pal: "koral", tag: "REFLEKSI", cap: "Rencana 90 hari lebih mudah dijaga daripada target setahun. Apa targetmu?", slides: [
    { k: "cover", title: "Rencana 90 hari: *target kecil, hasil nyata*", sub: "Tiga fase yang mudah diikuti." },
    { k: "list", title: "Tiga *fase*", items: [["Hari 1-30", "Fondasi: tentukan satu target."], ["Hari 31-60", "Konsisten: jaga ritme."], ["Hari 61-90", "Percepat: tambah porsi."]] },
    { k: "bullets", title: "Cara *me-review*", items: ["Review tiap minggu 15 menit", "Ukur satu angka utama", "Rayakan progres kecil"] },
  ] },
];
