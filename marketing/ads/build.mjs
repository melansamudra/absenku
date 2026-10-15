// Generator gambar iklan HrCash (PNG untuk Meta Ads) + lembar teks iklan.
// Jalankan dari folder yang punya paket `playwright` dan `@fontsource/inter`:
//   node build.mjs [folder-output]   -> PNG ke ./out, teks iklan ke ./ads-copy.md
// Data iklan ada di ads-data.mjs. Semua angka di mockup adalah CONTOH (bukan data pelanggan).
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { ads, angles } from "./ads-data.mjs";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const fontDir = path.dirname(require.resolve("@fontsource/inter/package.json")) + "/files";
const font = (w) => pathToFileURL(`${fontDir}/inter-latin-${w}-normal.woff2`).href;

const OUT = path.resolve(process.argv[2] ?? "./out");
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// --- ikon (SVG inline, tanpa emoji supaya tampil sama di semua mesin) ---
const ic = {
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 10V8a6 6 0 1112 0v2h1a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V11a1 1 0 011-1h1zm2 0h8V8a4 4 0 10-8 0v2z"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4.5"/><path d="M3.5 21c.6-4.6 4-7 8.5-7s7.9 2.4 8.5 7z"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h8l5 5v14a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1zm7 1.5V8h4.5L13 3.5z"/></svg>`,
};

const logo = `<div class="logo"><span class="logo-mark">${ic.check}</span>HrCash</div>`;
const kv = (a, b, cls = "") => `<div class="kv ${cls}"><span>${a}</span><b>${b}</b></div>`;
const line = (icon, t, s) => `<div class="line"><span class="line-ic blue">${icon}</span><div><b>${t}</b><div class="muted">${s}</div></div></div>`;
const head = (n, s, chip) => `<div class="row"><div><div class="name">${n}</div><div class="muted">${s}</div></div>${chip}</div>`;

// --- mockup (semua data contoh) ---
const mock = {
  absen: `<div class="card"><div class="row"><div class="avatar">${ic.user}</div><div><div class="name">Budi Santoso</div><div class="muted">Absen masuk &middot; 07:58</div></div><div class="chip ok">Tepat waktu</div></div><div class="rule"></div>${line(ic.pin, "Lokasi sesuai", "23 m dari kantor (batas 100 m)")}${line(ic.user, "Selfie terverifikasi", "Foto diambil saat absen")}<div class="line"><span class="line-ic blue">${ic.lock}</span><div><b>PIN pribadi</b><div class="muted pin">&bull; &bull; &bull; &bull;</div></div></div></div>`,
  absenLuar: `<div class="card"><div class="row"><div class="avatar">${ic.user}</div><div><div class="name">Rina Putri</div><div class="muted">Mencoba absen &middot; 08:03</div></div><div class="chip bad">Ditolak</div></div><div class="rule"></div><div class="line"><span class="line-ic bad">${ic.pin}</span><div><b>Di luar radius kantor</b><div class="muted">480 m dari kantor (batas 100 m)</div></div></div><div class="note">Absen hanya bisa dilakukan di lokasi yang kamu tentukan</div></div>`,
  slip: `<div class="card">${head("Slip Gaji &middot; Oktober 2026", "Sari Wulandari", '<div class="chip ok">Lunas</div>')}<div class="rule"></div>${kv("Gaji pokok", "Rp3.200.000")}${kv("Uang makan", "Rp450.000")}${kv("Lembur (6 jam)", "Rp180.000")}${kv("Potongan telat", "-Rp40.000", "neg")}${kv("Kasbon", "-Rp200.000", "neg")}<div class="rule"></div>${kv("Total diterima", "Rp3.590.000", "total")}</div>`,
  sekali: `<div class="duo"><div class="card dim"><div class="tag gray">Aplikasi langganan</div><div class="big gray">Bayar tiap bulan</div><div class="muted2 soft">Selama dipakai, tagihan terus jalan. Berhenti bayar, tidak bisa pakai.</div></div><div class="card hot"><div class="tag amber">HrCash</div><div class="big">Rp289.000</div><div class="muted2">Sekali bayar. Tanpa langganan bulanan.</div><div class="ticks"><span>${ic.check}Tanpa biaya per karyawan</span><span>${ic.check}Absen selfie + payroll lengkap</span></div></div></div>`,
  harga: `<div class="card hot2"><div class="tag amber">HrCash &middot; satu akun bisnis</div><div class="big huge">Rp289.000</div><div class="muted2">Sekali bayar</div><div class="ticks"><span>${ic.check}Absen selfie + lokasi + PIN</span><span>${ic.check}Slip gaji, lembur, dan kasbon</span><span>${ic.check}Cuti dan Portal Karyawan</span><span>${ic.check}Tanpa tagihan bulanan</span></div></div>`,
  lembur: `<div class="card">${head("Rekap Hari Ini", "Contoh perhitungan", '<div class="chip">Contoh</div>')}<div class="rule"></div>${kv("Jadwal masuk", "08:00")}${kv("Absen masuk", "08:12")}${kv("Terlambat", "12 menit", "neg")}<div class="rule"></div>${kv("Jadwal pulang", "17:00")}${kv("Absen pulang", "18:35")}${kv("Lembur dihitung", "1,5 jam", "pos")}<div class="note">Aturan telat dan lembur kamu atur sendiri</div></div>`,
  telatTier: `<div class="card">${head("Aturan Potongan Telat", "Bertingkat, kamu yang atur", '<div class="chip">Contoh</div>')}<div class="rule"></div>${kv("Telat 1&ndash;5 menit", "Rp0")}${kv("Telat 6&ndash;15 menit", "-Rp10.000", "neg")}${kv("Telat 16&ndash;30 menit", "-Rp25.000", "neg")}${kv("Telat lebih dari 30 menit", "-Rp50.000", "neg")}<div class="note">Dipotong otomatis di slip gaji</div></div>`,
  portal: `<div class="phone"><div class="phone-top"><div class="muted">Portal Karyawan</div><div class="name">Halo, Sari</div></div><div class="tile"><div class="muted">Sisa cuti</div><div class="big2">8 hari</div></div><div class="tile"><div class="muted">Slip gaji terbaru</div><div class="big2">Oktober 2026</div><div class="chip ok sm">Siap dilihat</div></div><div class="tile"><div class="muted">Sisa kasbon</div><div class="big2">Rp300.000</div></div></div>`,
  cuti: `<div class="card">${head("Pengajuan Cuti", "Dewi Lestari &middot; 3 hari", '<div class="chip ok">Disetujui</div>')}<div class="rule"></div>${kv("Jenis cuti", "Cuti tahunan")}${kv("Tanggal", "20&ndash;22 Okt 2026")}${kv("Sisa kuota", "5 hari", "pos")}<div class="note">Sisa kuota terhitung otomatis setelah disetujui</div></div>`,
  kasbon: `<div class="card">${head("Kasbon &middot; Agus", "Cicilan dipotong dari gaji", '<div class="chip">Contoh</div>')}<div class="rule"></div>${kv("Total kasbon", "Rp1.000.000")}${kv("Cicilan per bulan", "Rp250.000")}${kv("Sudah dibayar", "Rp500.000", "pos")}<div class="bar"><i style="width:50%"></i></div>${kv("Sisa", "Rp500.000", "total")}</div>`,
  importCsv: `<div class="card">${head("Import Karyawan", "Dari file CSV", '<div class="chip ok">Selesai</div>')}<div class="rule"></div><div class="line"><span class="line-ic blue">${ic.file}</span><div><b>karyawan.csv</b><div class="muted">50 baris dibaca</div></div></div>${kv("Berhasil diimpor", "48 karyawan", "pos")}${kv("Perlu dicek", "2 baris", "neg")}<div class="note">Baris bermasalah ditandai tanpa menggagalkan yang lain</div></div>`,
  link: `<div class="phone"><div class="phone-top"><div class="muted">Absen Selfie</div><div class="name">Toko Maju Jaya</div></div><div class="tile"><div class="muted">1. Pilih nama</div><div class="big2">Budi Santoso</div></div><div class="tile"><div class="muted">2. Ambil selfie</div><div class="big2">Kamera depan</div></div><div class="tile"><div class="muted">3. Kirim absen</div><div class="chip ok sm">Selesai</div></div></div>`,
  pajak: `<div class="card">${head("Potongan Gaji", "Bisa diaktifkan per bisnis", '<div class="chip">Opsional</div>')}<div class="rule"></div><div class="ticks dark"><span>${ic.check}BPJS Kesehatan &amp; Ketenagakerjaan</span><span>${ic.check}PPh 21 metode TER</span><span>${ic.check}Status PTKP per karyawan</span><span>${ic.check}Bisa dikoreksi manual per slip</span></div><div class="note">Membantu menghitung. Konfirmasi ke akuntan untuk pelaporan resmi</div></div>`,
  dashboard: `<div class="card">${head("Hari Ini", "Ringkasan absensi", '<div class="chip">Contoh</div>')}<div class="rule"></div><div class="tiles"><div class="t"><b>42</b><span>Hadir</span></div><div class="t"><b class="neg">3</b><span>Terlambat</span></div><div class="t"><b>2</b><span>Cuti</span></div><div class="t"><b>4</b><span>Menunggu persetujuan</span></div></div></div>`,
  foto: `<div class="card">${head("Siklus Foto Selfie", "Privasi karyawan terjaga", "")}<div class="rule"></div><div class="steps"><div class="step"><span class="dot">${ic.user}</span><div><b>Karyawan absen selfie</b><div class="muted">07:58 &middot; lokasi tercatat</div></div></div><div class="step"><span class="dot ok">${ic.check}</span><div><b>Admin menyetujui</b><div class="muted">Absen terverifikasi</div></div></div><div class="step"><span class="dot bad">${ic.trash}</span><div><b>Foto dihapus permanen</b><div class="muted">Jam &amp; lokasi tetap tersimpan</div></div></div></div></div>`,
};

const css = (w, h) => `
@font-face{font-family:Inter;font-weight:400;src:url(${font(400)})}
@font-face{font-family:Inter;font-weight:600;src:url(${font(600)})}
@font-face{font-family:Inter;font-weight:800;src:url(${font(800)})}
:root{--b50:#f1f7fd;--b100:#e3effc;--b200:#c4d8ee;--b600:#3b6a97;--b700:#2b5a85;--b800:#1f4a73;--b900:#17436a;--amber:#f5a524;--ink:#10243a;--ok:#1f9d6b;--neg:#c2410c}
*{box-sizing:border-box;margin:0;padding:0}
body{width:${w}px;height:${h}px;font-family:Inter,sans-serif;color:#fff;overflow:hidden;
 background:radial-gradient(900px 700px at 90% -10%,#3b6a97 0%,transparent 60%),linear-gradient(160deg,var(--b900),#0f2f4d)}
.wrap{height:100%;padding:${h > w ? 76 : 64}px 72px ${h > w ? 70 : 56}px;display:flex;flex-direction:column}
.logo{display:flex;align-items:center;gap:14px;font-weight:800;font-size:34px;letter-spacing:-.5px}
.logo-mark{width:46px;height:46px;border-radius:13px;background:#fff;color:var(--b700);display:grid;place-items:center}
.logo-mark svg{width:28px;height:28px}
h1{font-weight:800;letter-spacing:-2px;line-height:1.04;font-size:${h > w ? 88 : 76}px;margin-top:${h > w ? 52 : 34}px}
h1 em{font-style:normal;color:var(--amber)}
.sub{font-size:${h > w ? 36 : 32}px;color:var(--b200);margin-top:22px;line-height:1.3;max-width:900px}
.stage{flex:1;display:flex;align-items:center;justify-content:center;min-height:0;margin:${h > w ? 28 : 18}px 0}
.card{background:#fff;color:var(--ink);border-radius:32px;padding:36px 40px;width:100%;max-width:880px;box-shadow:0 30px 70px rgba(0,0,0,.35)}
.row{display:flex;align-items:center;gap:20px}.row .chip{margin-left:auto}
.avatar{width:72px;height:72px;border-radius:50%;background:var(--b100);color:var(--b600);display:grid;place-items:center;flex:none}
.avatar svg{width:42px;height:42px}
.name{font-weight:800;font-size:34px;letter-spacing:-.5px}
.muted{color:#5f7690;font-size:26px;margin-top:2px}.muted2{color:#d6e4f3;font-size:26px;margin-top:6px}.muted2.soft{color:#c9d9ea}
.chip{font-weight:600;font-size:24px;padding:8px 20px;border-radius:99px;background:var(--b100);color:var(--b700);white-space:nowrap}
.chip.ok{background:#dcf5ea;color:var(--ok)}.chip.bad{background:#fde4dc;color:var(--neg)}.chip.sm{display:inline-block;margin-top:10px;font-size:20px;padding:5px 14px}
.rule{height:2px;background:#e6eef6;margin:24px 0}
.line{display:flex;gap:20px;align-items:center;padding:10px 0;font-size:28px}
.line-ic{width:54px;height:54px;border-radius:16px;display:grid;place-items:center;flex:none}
.line-ic.blue{background:var(--b100);color:var(--b600)}.line-ic.bad{background:#fde4dc;color:var(--neg)}.line-ic svg{width:28px;height:28px}
.line b{font-size:30px}.pin{letter-spacing:6px;font-size:30px;color:var(--ink)}
.kv{display:flex;justify-content:space-between;gap:20px;padding:9px 0;font-size:29px}
.kv span{color:#4a6580}.kv b{font-weight:800;white-space:nowrap}.kv.neg b{color:var(--neg)}.kv.pos b{color:var(--ok)}
.kv.total{font-size:36px;padding:2px 0}.kv.total span{color:var(--ink);font-weight:800}.kv.total b{color:var(--b700)}
.note{margin-top:14px;font-size:24px;color:#5f7690;background:var(--b50);border-radius:14px;padding:12px 18px}
.bar{height:16px;border-radius:99px;background:#e6eef6;margin:12px 0 16px;overflow:hidden}.bar i{display:block;height:100%;background:var(--ok);border-radius:99px}
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:16px}.t{background:var(--b50);border-radius:22px;padding:22px 26px}
.t b{display:block;font-size:64px;font-weight:800;letter-spacing:-2px;color:var(--b700);line-height:1}.t b.neg{color:var(--neg)}.t span{font-size:25px;color:#5f7690}
.steps{display:flex;flex-direction:column;gap:22px}.step{display:flex;gap:22px;align-items:center}.step b{font-size:30px}
.dot{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:var(--b100);color:var(--b600);flex:none}.dot svg{width:30px;height:30px}
.dot.ok{background:#dcf5ea;color:var(--ok)}.dot.bad{background:#fde4dc;color:var(--neg)}
.duo{display:flex;gap:26px;width:100%;max-width:930px;align-items:stretch}
.duo .card{padding:34px 34px}.duo .dim{background:rgba(255,255,255,.1);color:#e3eefa;box-shadow:none;border:2px dashed rgba(255,255,255,.3)}
.duo .hot,.hot2{background:linear-gradient(160deg,#2b5a85,#1f4a73);color:#fff;border:3px solid var(--amber)}
.tag{font-weight:600;font-size:22px;letter-spacing:.5px;text-transform:uppercase;margin-bottom:14px}.tag.gray{color:#a6bdd4}.tag.amber{color:var(--amber)}
.big{font-weight:800;font-size:${h > w ? 70 : 58}px;letter-spacing:-2px;line-height:1.05}.big.gray{font-size:44px;letter-spacing:-1px}.big.huge{font-size:${h > w ? 112 : 92}px}
.ticks{display:flex;flex-direction:column;gap:12px;margin-top:22px;font-size:25px}.ticks span{display:flex;align-items:center;gap:12px}
.ticks svg{width:26px;height:26px;color:var(--amber);flex:none}.ticks.dark{font-size:29px;color:var(--ink);margin-top:0}.ticks.dark svg{color:var(--ok)}
.phone{width:470px;background:#fff;color:var(--ink);border-radius:54px;padding:34px 30px 38px;box-shadow:0 30px 70px rgba(0,0,0,.4);border:10px solid #0b1f33}
.phone-top{padding:6px 6px 18px}.phone .tile{background:var(--b50);border-radius:24px;padding:20px 24px;margin-top:14px}
.big2{font-weight:800;font-size:36px;letter-spacing:-1px;color:var(--b700);margin-top:2px}
.foot{display:flex;align-items:center;gap:22px}
.price{background:var(--amber);color:#2b1a00;border-radius:22px;padding:18px 30px;font-weight:800;font-size:${h > w ? 40 : 36}px;letter-spacing:-1px;line-height:1}
.price small{display:block;font-weight:600;font-size:22px;letter-spacing:0;margin-top:6px;opacity:.8}
.cta{margin-left:auto;display:flex;align-items:center;gap:14px;background:#fff;color:var(--b800);border-radius:22px;padding:22px 32px;font-weight:800;font-size:32px}
.cta svg{width:30px;height:30px}
.eg{position:absolute;right:30px;bottom:14px;font-size:18px;color:rgba(255,255,255,.45)}
.sq .cstage .card{zoom:.68}.sq .phone{zoom:.66}.sq .card{zoom:.78}.sq .duo .card{zoom:.9}.sq .hot2{zoom:.8}

/* tema terang */
body.th-light{color:var(--ink);background:radial-gradient(900px 700px at 100% -10%,#cfe3f6 0%,transparent 60%),linear-gradient(160deg,#fbfdff,#e3effc)}
.th-light .logo-mark{background:var(--b700);color:#fff}.th-light h1 em{color:#c26a00}.th-light .sub{color:#4a6580}
.th-light .card{border:2px solid #d5e4f2;box-shadow:0 22px 50px rgba(23,67,106,.16)}.th-light .phone{box-shadow:0 22px 50px rgba(23,67,106,.25)}
.th-light .duo .dim{background:#fff;color:var(--ink);border:2px dashed #b3c8dc}.th-light .duo .dim .big.gray{color:#4a6580}.th-light .duo .dim .tag.gray{color:#7a93ab}.th-light .muted2.soft{color:#5f7690}
.th-light .cta{background:var(--b800);color:#fff}.th-light .eg{color:rgba(16,36,58,.4)}
.th-light .hot2,.th-light .duo .hot{color:#fff}
/* tema kuning */
body.th-amber{color:#1a1200;background:radial-gradient(800px 600px at 100% -10%,#ffd27a 0%,transparent 60%),linear-gradient(160deg,#f7b538,#f29a0c)}
.th-amber .logo-mark{background:var(--ink);color:var(--amber)}.th-amber h1 em{color:var(--b900);background:linear-gradient(transparent 62%,rgba(255,255,255,.55) 62%)}
.th-amber .sub{color:#4a3300}.th-amber .price{background:var(--ink);color:#fff}.th-amber .cta{background:#fff;color:var(--ink)}.th-amber .eg{color:rgba(26,18,0,.45)}
.th-amber .card{box-shadow:0 26px 60px rgba(120,70,0,.35)}.th-amber .phone{box-shadow:0 26px 60px rgba(120,70,0,.4)}
.th-amber .hot2{background:linear-gradient(160deg,#17436a,#0f2f4d);color:#fff;border-color:#fff}
`;

const frame = (w, h, inner, theme = "dark") =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${css(w, h)}</style></head><body class="th-${theme} ${w === h ? "sq" : "tall"}"><div class="wrap">${inner}</div><div class="eg">Tampilan contoh</div></body></html>`;

const footer = `<div class="foot"><div class="price">Rp289.000<small>sekali bayar</small></div><div class="cta">Lihat demo ${ic.arrow}</div></div>`;
const footerCta = `<div class="foot"><div class="cta" style="margin-left:0;width:100%;justify-content:center">Lihat demo ${ic.arrow}</div></div>`;

const single = (ad, w, h) =>
  frame(w, h, `${logo}<h1>${ad.h}</h1><p class="sub">${ad.sub}</p><div class="stage">${mock[ad.mock]}</div>${ad.hidePrice ? footerCta : footer}`, ad.theme);

// --- carousel 1080x1080 ---
const swipe = `<div class="foot"><div style="color:var(--b200);font-size:28px">Geser untuk lanjut</div><div class="cta" style="padding:16px 26px;font-size:28px">${ic.arrow}</div></div>`;
const cs = (n, title, body, extra) => `
  ${logo}
  <div style="margin-top:44px;display:flex;align-items:center;gap:14px"><span style="background:var(--amber);color:#2b1a00;font-weight:800;font-size:28px;border-radius:99px;padding:8px 22px">${n}</span></div>
  <h1 style="margin-top:26px;font-size:84px">${title}</h1>
  <p class="sub" style="font-size:36px">${body}</p>
  <div class="stage cstage">${extra}</div>${swipe}`;

const carousel = [
  frame(1080, 1080, `${logo}<h1 style="margin-top:70px;font-size:96px">3 tanda usahamu butuh <em>absen digital.</em></h1><p class="sub" style="font-size:38px;margin-top:30px">Salah satunya kamu alami? Geser.</p><div class="stage"></div>${swipe}`),
  frame(1080, 1080, cs("1", `Ada yang <em>titip absen.</em>`, "Buku absen gampang diisi orang lain.", mock.absen)),
  frame(1080, 1080, cs("2", `Rekap gaji <em>makan waktu.</em>`, "Hitung lembur, telat, dan kasbon manual tiap akhir bulan.", mock.slip)),
  frame(1080, 1080, cs("3", `Sering <em>selisih paham</em> soal lembur.`, "Tanpa aturan jelas, karyawan dan pemilik sama-sama ragu.", mock.lembur)),
  frame(1080, 1080, `${logo}<h1 style="margin-top:60px;font-size:90px">Semua beres di <em>satu aplikasi.</em></h1><p class="sub" style="font-size:36px">Absen selfie, lembur, cuti, kasbon, dan slip gaji.</p><div class="stage" style="flex-direction:column;gap:26px"><div class="price" style="font-size:76px;padding:30px 50px">Rp289.000<small style="font-size:30px">sekali bayar, tanpa langganan</small></div></div>${footerCta}`),
];

// --- render ---
const browser = await chromium.launch({
  executablePath: existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined,
});
const tmp = path.join(OUT, ".tmp.html");
async function shot(html, w, h, name) {
  writeFileSync(tmp, html);
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(pathToFileURL(tmp).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, name) });
  await page.close();
}

let n = 0;
for (const ad of ads) {
  n++;
  ad.file = `${String(n).padStart(2, "0")}-${ad.slug}`;
  await shot(single(ad, 1080, 1350), 1080, 1350, `${ad.file}_4x5.png`);
  await shot(single(ad, 1080, 1080), 1080, 1080, `${ad.file}_1x1.png`);
}
for (let i = 0; i < carousel.length; i++) await shot(carousel[i], 1080, 1080, `carousel-3-tanda_${i + 1}.png`);
await browser.close();
rmSync(tmp, { force: true });

// --- lembar teks iklan ---
const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/&ldquo;|&rdquo;/g, '"').replace(/&amp;/g, "&").replace(/&ndash;/g, "-");
let md = `# HrCash — ${ads.length} hook iklan Meta

Setiap hook punya gambar (4:5 dan 1:1) di \`out/\`, plus teks iklan di bawah. Harga: **Rp289.000 sekali bayar**.
Semua angka di gambar adalah contoh. Tidak ada testimoni atau statistik karangan.

## Cara tes (disarankan)

1. **Putaran 1 (3 hari):** pilih 1 hook terbaik per sudut pandang (A-F) = 6 iklan dalam 1 ad set. Budget Rp50-100 ribu per hari total. Jangan ubah apa pun selama 3 hari.
2. Matikan 3 iklan dengan biaya per hasil (chat/klik) terburuk. Biarkan yang bagus.
3. **Putaran 2:** ambil sudut pandang pemenang, uji 2-3 hook lain dari sudut yang sama, lalu uji gambar vs video.
4. Yang diukur: CTR link (target awal >= 1%), biaya per chat, dan berapa yang akhirnya bayar. Titik impas = Rp289.000 dikurangi biaya server dan waktu support per pelanggan.

## Catatan sebelum iklan jalan
- Atur **tujuan klik** di Meta (WhatsApp atau halaman HrCash). Tombol di gambar bertuliskan "Lihat demo".
- Hook **I1 (foto dihapus)** dan **H1 (BPJS/PPh 21)** baru boleh dipakai kalau fiturnya sudah ter-deploy dan diuji. Untuk H1, jangan menjanjikan akurat pajak.
- Jangan menambah klaim seperti "nomor 1", "100% anti curang", atau perbandingan dengan merek tertentu.

`;
const byAngle = {};
for (const ad of ads) (byAngle[ad.angle] ??= []).push(ad);
for (const [k, label] of Object.entries(angles)) {
  if (!byAngle[k]) continue;
  md += `## ${k}. ${label}\n\n`;
  for (const ad of byAngle[k]) {
    md += `### ${ad.file}\n- **Hook (di gambar):** ${strip(ad.h)}\n- **Subjudul:** ${ad.sub}\n- **Gambar:** \`out/${ad.file}_4x5.png\`, \`out/${ad.file}_1x1.png\` (tema ${ad.theme})\n- **Primary text:**\n\n${ad.primary.split("\n").map((l) => "  > " + l).join("\n")}\n\n- **Headline:** ${ad.headline}\n- **Description:** ${ad.desc}\n- **Tombol CTA:** ${ad.cta}\n\n`;
  }
}
md += `## Carousel: 3 tanda usahamu butuh absen digital\nBerkas \`out/carousel-3-tanda_1..5.png\` (1:1). Primary text: "Salah satunya kamu alami? Geser. HrCash: absen selfie, lembur, cuti, kasbon, dan slip gaji dalam satu aplikasi. Rp289.000 sekali bayar." Headline: "3 tanda butuh absen digital". CTA: Pelajari Selengkapnya.\n`;
writeFileSync(path.join(here, "ads-copy.md"), md);
console.log(`ok: ${ads.length} hook x 2 ukuran + ${carousel.length} slide carousel`);
