// 30 post feed IG (1-3 slide). Tema umum yang sedang ramai dibahas; tidak harus HrCash.
export const POSTS = [
  // ---------- 1 slide ----------
  { id: "P01-bocor-halus-gaji", pal: "biru", tag: "KEUANGAN", cap: "Gaji cepat habis padahal merasa tidak belanja besar? Sering kali bocornya halus. Catat pengeluaran 1 bulan penuh, lalu lihat totalnya. Simpan postingan ini untuk dicek di akhir bulan.", slides: [
    { k: "list", title: "Gaji habis sebelum tanggal tua? *Cek 3 bocor halus ini*", items: [["Langganan terlupa", "Aplikasi dan layanan yang jarang dipakai tapi tetap ditagih."], ["Jajan dan kopi harian", "Kecil per hari, besar per bulan."], ["Pesan antar tiap hari", "Ongkir dan biaya layanan ikut terhitung."]], note: "Catat 1 bulan, lalu lihat totalnya." },
  ] },
  { id: "P02-quiet-quitting", pal: "terang", tag: "DUNIA KERJA", cap: "Bekerja sesuai peran dan jam kerja itu wajar. Yang tidak wajar adalah beban tanpa batas. Setuju atau tidak? Tulis pendapatmu di komentar.", slides: [
    { k: "quote", text: "Quiet quitting bukan soal malas. *Ini soal batas.*", sub: "Bekerja sesuai peran dan jam kerja itu wajar. Yang tidak wajar: beban tanpa batas." },
  ] },
  { id: "P03-red-flag-green-flag", pal: "kuning", tag: "DUNIA KERJA", cap: "Red flag dan green flag di tempat kerja. Kamu pernah mengalami yang mana? Tag temanmu yang perlu lihat ini.", slides: [
    { k: "compare", title: "Red flag vs *green flag* di tempat kerja", l: ["RED FLAG", ["Jam kerja tidak jelas", "Gaji telat tanpa kabar", "Urusan kerja lewat chat tengah malam"]], r: ["GREEN FLAG", ["Peran dan jam jelas", "Gaji tepat waktu", "Feedback disampaikan terbuka"]] },
  ] },
  { id: "P04-aturan-50-30-20", pal: "hijau", tag: "KEUANGAN", cap: "Bingung bagi gaji? Mulai dari aturan 50/30/20. Ini panduan awal, boleh disesuaikan dengan kondisimu. Simpan dulu, hitung nanti.", slides: [
    { k: "formula", title: "Aturan *50/30/20* untuk gaji", big: "50/30/20", rows: [["50%", "Kebutuhan"], ["30%", "Keinginan"], ["20%", "Tabungan dan investasi"]], note: "Contoh gaji Rp5.000.000: Rp2,5 jt / Rp1,5 jt / Rp1 jt." },
  ] },
  { id: "P05-tanda-burnout", pal: "koral", tag: "KESEHATAN MENTAL", cap: "Ini tanda umum, bukan diagnosis. Kalau berlangsung lama dan mengganggu, bicarakan dengan profesional. Jaga dirimu.", slides: [
    { k: "bullets", title: "Burnout? 5 tanda tubuhmu *minta istirahat*", items: ["Lelah terus walau sudah tidur", "Mudah kesal pada hal kecil", "Malas memulai pekerjaan", "Sulit fokus", "Hilang semangat"], note: "Tanda umum, bukan diagnosis. Jika berlanjut, bicarakan dengan profesional." },
  ] },
  { id: "P06-tiga-prompt-ai", pal: "biru", tag: "AI DAN PRODUKTIVITAS", cap: "Tiga prompt sederhana yang bisa langsung dipakai. Ganti bagian dalam kurung dengan konteksmu. Simpan untuk dicoba.", slides: [
    { k: "list", title: "3 prompt AI yang *beneran kepakai* di kerja", items: [["Ringkas rapat", "\"Ringkas catatan ini jadi 5 poin dan daftar tugas.\""], ["Rapikan email", "\"Perbaiki email ini agar sopan dan singkat.\""], ["Ide konten", "\"Beri 10 ide konten untuk [usahamu] minggu ini.\""]] },
  ] },
  { id: "P07-no-buy-challenge", pal: "terang", tag: "KEUANGAN", cap: "No-buy challenge 30 hari: bukan berhenti belanja total, tapi lebih sadar. Berani coba? Tulis tanggal mulaimu di komentar.", slides: [
    { k: "steps", title: "No-buy challenge 30 hari: *aturan mainnya*", items: [["Kebutuhan pokok", "Tetap boleh dibeli."], ["Keinginan", "Masuk daftar tunggu 7 hari."], ["Catat", "Setiap barang yang berhasil ditahan."], ["Hari ke-30", "Hitung total yang berhasil dihemat."]] },
  ] },
  { id: "P08-poll-wfo-hybrid", pal: "kuning", tag: "DUNIA KERJA", cap: "Kamu tim mana? Komen A, B, atau C. Ceritakan alasanmu.", slides: [
    { k: "poll", title: "WFO, hybrid, atau WFH? *Kamu tim mana?*", options: [["A", "Tim WFO: ketemu langsung lebih cepat"], ["B", "Tim hybrid: fleksibel dan hemat ongkos"], ["C", "Tim WFH: lebih fokus di rumah"]], note: "Komen A, B, atau C." },
  ] },
  { id: "P09-mitos-investasi", pal: "hijau", tag: "KEUANGAN", cap: "Mitos dan fakta soal investasi. Ini informasi umum, bukan ajakan atau saran investasi. Pelajari dulu dan sesuaikan dengan profil risikomu.", slides: [
    { k: "compare", title: "Mitos: investasi itu *hanya untuk orang kaya*", l: ["MITOS", ["Harus punya jutaan dulu", "Pasti untung"]], r: ["FAKTA", ["Banyak produk bisa dimulai dari nominal kecil", "Ada risiko. Pelajari dulu"]], note: "Informasi umum, bukan saran investasi." },
  ] },
  { id: "P10-jam-produktif", pal: "koral", tag: "PRODUKTIVITAS", cap: "Cocokkan jenis tugas dengan jam energimu. Kamu paling produktif jam berapa?", slides: [
    { k: "list", title: "Jam produktifmu kapan? *Cocokkan dengan tugasnya*", items: [["Pagi", "Kerjakan tugas yang paling berat dulu."], ["Siang", "Rapat dan koordinasi dengan tim."], ["Malam", "Tugas kreatif dan perencanaan."]], note: "Pilih jam energimu, jangan dipaksa sama dengan orang lain." },
  ] },
  // ---------- 2 slide ----------
  { id: "P11-side-hustle-modal-kecil", pal: "biru", tag: "SIDE HUSTLE", cap: "Ide side hustle dengan modal kecil. Pilih satu, coba 30 hari, lalu evaluasi. Ide mana yang paling cocok denganmu?", slides: [
    { k: "cover", title: "Side hustle modal *di bawah Rp1 juta*", sub: "5 ide yang bisa dimulai minggu ini." },
    { k: "list", title: "5 ide untuk *mulai minggu ini*", items: [["Reseller produk lokal", "Mulai dari stok sedikit."], ["Template desain", "Jual template untuk UMKM."], ["Camilan rumahan", "Pesan lewat WhatsApp."], ["Les privat", "Ajarkan skill yang kamu kuasai."], ["Admin sosmed", "Bantu usaha kecil sekitarmu."]] },
  ] },
  { id: "P12-menolak-lembur", pal: "terang", tag: "DUNIA KERJA", cap: "Menolak lembur tanpa drama itu bisa. Simpan skrip ini untuk dipakai saat dibutuhkan.", slides: [
    { k: "cover", title: "Cara menolak lembur *tanpa drama*", sub: "3 langkah dengan kalimat siap pakai." },
    { k: "steps", title: "Pakai *3 langkah* ini", items: [["Apresiasi", "\"Terima kasih sudah percaya ke saya.\""], ["Jelaskan batas", "\"Hari ini saya ada urusan setelah jam kerja.\""], ["Tawarkan solusi", "\"Bisa saya kerjakan besok pagi jam 9.\""]] },
  ] },
  { id: "P13-soft-life-budget-biasa", pal: "kuning", tag: "GAYA HIDUP", cap: "Soft life tidak harus mahal. Mulai dari kebiasaan kecil yang bikin hidup lebih tenang.", slides: [
    { k: "cover", title: "Soft life dengan *budget biasa*", sub: "Hidup lebih tenang tanpa harus mahal." },
    { k: "bullets", title: "4 kebiasaan *sederhana*", items: ["Masak sederhana di rumah", "Rapikan satu sudut kamar", "Jalan kaki 20 menit", "Tidur di jam yang sama"] },
  ] },
  { id: "P14-dana-darurat", pal: "hijau", tag: "KEUANGAN", cap: "Dana darurat itu bantalan, bukan investasi. Hitung kebutuhanmu dan mulai nabung sedikit demi sedikit.", slides: [
    { k: "cover", title: "Dana darurat itu *berapa sih?*", sub: "Rumus sederhana yang bisa kamu hitung sekarang." },
    { k: "formula", title: "Rumus *dana darurat*", big: "3-6x", rows: [["Pengeluaran bulanan", "Rp3.000.000"], ["Target 3 bulan", "Rp9.000.000"], ["Target 6 bulan", "Rp18.000.000"]], note: "Penghasilan tunggal atau tanggungan banyak: pilih target yang lebih tinggi." },
  ] },
  { id: "P15-kelemahan-wawancara", pal: "koral", tag: "KARIER", cap: "Pertanyaan klasik wawancara kerja. Siapkan jawabanmu dengan struktur ini.", slides: [
    { k: "cover", title: "Wawancara: *\"Apa kelemahanmu?\"*", sub: "Template jawaban yang jujur dan aman." },
    { k: "steps", title: "Jawab dengan *3 bagian*", items: [["Sebut yang nyata", "Pilih kelemahan yang tidak krusial untuk posisinya."], ["Usaha memperbaiki", "Ceritakan langkah yang sudah kamu lakukan."], ["Hasilnya", "Tutup dengan perkembangan yang terlihat."]] },
  ] },
  { id: "P16-slow-morning", pal: "biru", tag: "GAYA HIDUP", cap: "Pagi yang pelan 15 menit bisa mengubah harimu. Coba besok dan ceritakan hasilnya.", slides: [
    { k: "cover", title: "Slow morning *15 menit*", sub: "Mulai hari tanpa langsung buka HP." },
    { k: "steps", title: "Urutannya *sederhana*", items: [["Menit 0-5", "Minum air dan buka jendela."], ["Menit 5-10", "Peregangan ringan."], ["Menit 10-15", "Tulis 3 prioritas hari ini."]] },
  ] },
  { id: "P17-overthinking-karier", pal: "terang", tag: "KARIER", cap: "Kalau sedang bimbang soal karier, jawab tiga pertanyaan ini secara tertulis.", slides: [
    { k: "cover", title: "Overthinking soal karier? *Jawab 3 pertanyaan ini*", sub: "Tulis jawabannya, jangan hanya dipikirkan." },
    { k: "list", title: "Tiga pertanyaan *untuk dirimu*", items: [["1", "Apa yang membuatku bertahan?"], ["2", "Apa yang membuatku ingin pergi?"], ["3", "Apa satu langkah kecil minggu ini?"]] },
  ] },
  { id: "P18-konten-umkm", pal: "kuning", tag: "BISNIS KECIL", cap: "Konten UMKM tidak harus rumit. Pilih satu ide, buat konsisten. Usahamu apa? Tulis di komentar.", slides: [
    { k: "cover", title: "Konten UMKM *tanpa ribet*", sub: "4 ide yang bisa direkam pakai HP." },
    { k: "bullets", title: "4 ide *yang mudah*", items: ["Proses pembuatan produk", "Testimoni pembeli (dengan izin)", "Tanya jawab singkat", "Tips memakai produk"] },
  ] },
  { id: "P19-aturan-24-jam", pal: "hijau", tag: "KEUANGAN", cap: "Aturan 24 jam bantu menahan belanja impulsif. Coba untuk belanjaan berikutnya.", slides: [
    { k: "cover", title: "Tahan beli impulsif dengan *aturan 24 jam*", sub: "Simpel, gratis, dan bisa dicoba hari ini." },
    { k: "steps", title: "Langkah *aturan 24 jam*", items: [["Masuk keranjang", "Jangan langsung checkout."], ["Tunggu 24 jam", "Biarkan keinginannya mereda."], ["Tanya diri", "Aku butuh, atau cuma ingin?"], ["Putuskan", "Kalau masih mau dan dananya ada, beli."]] },
  ] },
  { id: "P20-networking-introvert", pal: "koral", tag: "KARIER", cap: "Networking tidak harus ramai. Mulai dari yang kecil dan konsisten.", slides: [
    { k: "cover", title: "Networking untuk *introvert*", sub: "Tanpa harus jadi orang yang berbeda." },
    { k: "bullets", title: "4 tips *yang realistis*", items: ["Mulai dari 1 orang, bukan 1 ruangan", "Siapkan 2 pertanyaan pembuka", "Follow up lewat pesan singkat", "Datang ke acara kecil dulu"] },
  ] },
  // ---------- 3 slide ----------
  { id: "P21-belajar-skill-30-hari", pal: "biru", tag: "PRODUKTIVITAS", cap: "Belajar skill baru dalam 30 hari: fokus satu hal dan konsisten. Skill apa yang mau kamu pelajari?", slides: [
    { k: "cover", title: "Belajar skill baru *dalam 30 hari*", sub: "Rencana dua tahap yang realistis." },
    { k: "list", title: "Minggu *1 dan 2*", items: [["Pilih satu skill", "Jangan tiga sekaligus."], ["30 menit per hari", "Konsisten lebih penting dari lama."], ["Target kecil", "Contoh: selesaikan satu latihan."]] },
    { k: "list", title: "Minggu *3 dan 4*", items: [["Buat proyek mini", "Praktikkan, bukan hanya menonton."], ["Minta feedback", "Dari teman atau komunitas."], ["Catat progres", "Lihat bedanya dengan hari pertama."]] },
  ] },
  { id: "P22-fire-vs-yolo", pal: "terang", tag: "KEUANGAN", cap: "FIRE atau YOLO? Keduanya punya sisi baik. Kamu lebih condong ke mana? Informasi umum, bukan saran keuangan.", slides: [
    { k: "cover", title: "FIRE vs YOLO: *kamu tim mana?*", sub: "Dua gaya mengatur uang yang sering diperdebatkan." },
    { k: "bullets", title: "Gaya *FIRE*", items: ["Hemat dan nabung agresif", "Targetnya bebas finansial lebih awal", "Risikonya: terlalu menahan diri"] },
    { k: "bullets", title: "Gaya *YOLO*", items: ["Nikmati hidup sekarang", "Pengeluaran fleksibel", "Risikonya: masa depan kurang siap"], note: "Jalan tengah: tetap nabung rutin dan sisakan dana untuk menikmati hidup." },
  ] },
  { id: "P23-budget-pekerja-baru", pal: "kuning", tag: "KEUANGAN", cap: "Contoh alokasi untuk pekerja baru. Ubah angkanya sesuai kondisimu. Simpan sebagai template.", slides: [
    { k: "cover", title: "Budget bulanan untuk *pekerja baru*", sub: "Contoh alokasi gaji Rp4.000.000." },
    { k: "formula", title: "Contoh *alokasi*", big: "Rp4 jt", rows: [["Kos / sewa", "Rp1.200.000"], ["Makan", "Rp1.000.000"], ["Transport", "Rp400.000"], ["Tabungan", "Rp600.000"], ["Lain-lain", "Rp800.000"]] },
    { k: "bullets", title: "3 kebiasaan *yang menolong*", items: ["Pindahkan tabungan di awal bulan", "Catat pengeluaran tiap hari", "Sisakan dana untuk bersenang-senang"] },
  ] },
  { id: "P24-harga-jual-umkm", pal: "hijau", tag: "BISNIS KECIL", cap: "Menentukan harga jual jangan asal. Hitung biayanya dulu. Angka di slide hanya contoh.", slides: [
    { k: "cover", title: "Harga jual UMKM: *jangan asal tebak*", sub: "Rumus dasar supaya tidak rugi tanpa sadar." },
    { k: "formula", title: "Rumus *dasar*", big: "HPP+", rows: [["HPP", "Biaya bahan dan pembuatan"], ["Biaya operasional", "Kemasan, ongkir, listrik"], ["Margin", "Keuntungan yang kamu mau"]], note: "Harga jual = biaya total + margin." },
    { k: "formula", title: "Contoh *hitungan*", big: "Rp13rb", rows: [["Biaya total", "Rp10.000"], ["Margin 30%", "Rp3.000"], ["Harga jual", "Rp13.000"]], note: "Angka contoh. Sesuaikan dengan produkmu." },
  ] },
  { id: "P25-kapan-delegasi", pal: "koral", tag: "BISNIS KECIL", cap: "Kalau usaha berhenti saat kamu libur, mungkin saatnya mulai delegasi. Mulai dari tugas kecil.", slides: [
    { k: "cover", title: "Kapan owner *harus berhenti* kerja sendiri?", sub: "Tanda dan langkah awal untuk delegasi." },
    { k: "bullets", title: "Tanda *kamu perlu delegasi*", items: ["Kerja sampai malam tiap hari", "Semua keputusan harus lewat kamu", "Usaha berhenti saat kamu libur"] },
    { k: "steps", title: "Langkah *awalnya*", items: [["Tulis SOP singkat", "Satu halaman cukup."], ["Delegasikan tugas kecil", "Mulai dari yang risikonya rendah."], ["Evaluasi tiap minggu", "Perbaiki sambil jalan."]] },
  ] },
  { id: "P26-digital-detox", pal: "biru", tag: "GAYA HIDUP", cap: "Digital detox weekend: coba 1 hari dulu. Banyak orang merasa lebih tenang. Apakah kamu berani coba?", slides: [
    { k: "cover", title: "Digital detox *akhir pekan*", sub: "Rehat dari layar tanpa harus menghilang." },
    { k: "bullets", title: "3 aturan *main*", items: ["Mode pesawat 3 jam", "Matikan notifikasi medsos", "Taruh HP di luar kamar"] },
    { k: "bullets", title: "Yang *biasanya dirasakan*", items: ["Tidur terasa lebih nyenyak", "Lebih hadir saat bertemu orang", "Ada waktu untuk hobi"], note: "Pengalaman tiap orang bisa berbeda." },
  ] },
  { id: "P27-negosiasi-gaji", pal: "terang", tag: "KARIER", cap: "Negosiasi gaji butuh persiapan. Simpan kalimat ini.", slides: [
    { k: "cover", title: "Negosiasi gaji: *siapkan ini dulu*", sub: "Persiapan dan kalimat pembuka." },
    { k: "bullets", title: "Persiapan *sebelum bicara*", items: ["Riset kisaran gaji posisimu", "Catat pencapaian kerja", "Tentukan batas minimal"] },
    { k: "quote", text: "\"Berdasarkan hasil kerja dan riset pasar, saya ingin *membahas penyesuaian gaji.*\"", sub: "Lalu tanyakan: apa yang perlu saya capai agar itu bisa terwujud?" },
  ] },
  { id: "P28-meeting-jadi-chat", pal: "kuning", tag: "DUNIA KERJA", cap: "Tidak semua rapat perlu rapat. Tag rekan kerja yang sering mengundang meeting tanpa agenda.", slides: [
    { k: "cover", title: "Meeting yang *seharusnya jadi chat*", sub: "Kenali tandanya dan cari alternatifnya." },
    { k: "bullets", title: "Tanda *meeting tidak perlu*", items: ["Tidak ada agenda", "Satu orang bicara terus", "Keputusan tidak butuh diskusi"] },
    { k: "bullets", title: "Alternatif *yang lebih hemat waktu*", items: ["Ringkasan tertulis", "Voice note", "Dokumen bersama"] },
  ] },
  { id: "P29-komunikasi-lintas-generasi", pal: "hijau", tag: "DUNIA KERJA", cap: "Gaya kerja tiap orang berbeda, apa pun generasinya. Sepakati cara berkomunikasi.", slides: [
    { k: "cover", title: "Kerja bareng *lintas generasi*", sub: "Gaya komunikasi boleh beda, tujuan tetap sama." },
    { k: "list", title: "Gaya yang *sering berbeda*", items: [["Telepon vs chat", "Ada yang suka bicara langsung, ada yang suka tulisan."], ["Kepastian vs fleksibel", "Ada yang butuh aturan jelas, ada yang butuh ruang."]] },
    { k: "bullets", title: "Titik *temunya*", items: ["Sepakati jalur komunikasi", "Jelaskan alasan di balik permintaan", "Hargai gaya kerja yang berbeda"] },
  ] },
  { id: "P30-review-akhir-tahun", pal: "koral", tag: "REFLEKSI", cap: "Akhir tahun waktunya refleksi. Tulis jawabanmu dan simpan postingan ini.", slides: [
    { k: "cover", title: "Review akhir tahun: *5 pertanyaan untuk dirimu*", sub: "Luangkan 15 menit, siapkan pena." },
    { k: "list", title: "Pertanyaan *1 sampai 3*", items: [["1", "Apa pencapaian yang paling kubanggakan?"], ["2", "Apa pelajaran terbesar tahun ini?"], ["3", "Apa yang ingin kuhentikan?"]] },
    { k: "list", title: "Pertanyaan *4 dan 5*", items: [["4", "Apa yang ingin kumulai tahun depan?"], ["5", "Siapa yang ingin kuucapi terima kasih?"]], note: "Tulis jawabanmu, lalu simpan postingan ini." },
  ] },
];
