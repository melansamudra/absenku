// Konsep kreatif HrCash: 3 pesan inti = Portal Karyawan, tanpa install, laporan gaji otomatis.
// Jalankan: node build-kreatif.mjs [folder-output]  (butuh playwright + @fontsource/inter)
// Format: 4:5 (1080x1350), 1:1 (1080x1080), 9:16 (1080x1920, area aman Story/Reels).
// Semua nama/angka adalah CONTOH.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const fontDir = path.dirname(require.resolve("@fontsource/inter/package.json")) + "/files";
const font = (w) => pathToFileURL(`${fontDir}/inter-latin-${w}-normal.woff2`).href;
const OUT = path.resolve(process.argv[2] ?? "./out-kreatif");
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const ic = {
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  down: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16M6 14l6 6 6-6"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 10V8a6 6 0 1112 0v2h1a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V11a1 1 0 011-1h1zm2 0h8V8a4 4 0 10-8 0v2z"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4.5"/><path d="M3.5 21c.6-4.6 4-7 8.5-7s7.9 2.4 8.5 7z"/></svg>`,
  cam: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 4l-1.5 2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-2.5L15 4H9zm3 4.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z"/></svg>`,
  doc: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h8l5 5v14a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1zm7 1.5V8h4.5L13 3.5zM8 12h8v1.8H8zm0 3.5h8v1.8H8z"/></svg>`,
};
const logo = `<div class="logo"><span class="logo-mark">${ic.check}</span>HrCash</div>`;

// ---------- komponen konsep ----------
const bub = (who, txt, time, out = false) => `<div class="b ${out ? "out" : "in"}">${out ? "" : `<div class="who">${who}</div>`}<div class="bt">${txt}</div><div class="tm">${time}</div></div>`;

const C = {
  chat: `<div class="chat">
    ${bub("Rina", "Pak, slip gaji saya sudah ada belum?", "07:12")}
    ${bub("Agus", "Pak, sisa cuti saya berapa hari ya?", "07:15")}
    ${bub("Dewi", "Pak, kasbon saya sisa berapa?", "07:21")}
    ${bub("", "Cek sendiri di Portal Karyawan ya.", "07:22", true)}
  </div>`,
  nolist: `<div class="card nolist">
    <div class="nl"><i>${ic.x}</i><span>Install aplikasi</span></div>
    <div class="nl"><i>${ic.x}</i><span>Rekap absen di Excel</span></div>
    <div class="nl"><i>${ic.x}</i><span>Hitung lembur pakai kalkulator</span></div>
    <div class="nl"><i>${ic.x}</i><span>Kirim slip gaji satu per satu</span></div>
    <div class="nl yes"><i>${ic.check}</i><span>Cukup buka link. Selesai.</span></div>
  </div>`,
  browser: `<div class="browser">
    <div class="bar"><span></span><span></span><span></span><div class="addr">${ic.lock}<b>link-absen-toko-kamu</b></div></div>
    <div class="bbody"><div class="muted">Absen Selfie</div><div class="name">Toko Maju Jaya</div>
      <div class="field">Budi Santoso</div><div class="btn">${ic.cam}Ambil selfie</div></div>
    <div class="pills"><span>Tanpa download</span><span>Tanpa update</span><span>Memori HP aman</span></div>
  </div>`,
  split: `<div class="split">
    <div class="col old"><div class="tag">Sebelum</div>
      <div class="it"><i>${ic.x}</i>Rekap di Excel</div><div class="it"><i>${ic.x}</i>Hitung lembur manual</div><div class="it"><i>${ic.x}</i>Kirim slip satu-satu</div><div class="it"><i>${ic.x}</i>Karyawan terus bertanya</div></div>
    <div class="col new"><div class="tag">Sesudah</div>
      <div class="it"><i>${ic.check}</i>Laporan gaji otomatis</div><div class="it"><i>${ic.check}</i>Lembur terhitung sendiri</div><div class="it"><i>${ic.check}</i>Slip dicek lewat portal</div><div class="it"><i>${ic.check}</i>Kamu tinggal cek hasil</div></div>
  </div>`,
  calendar: `<div class="cal">
    <div class="calbox"><div class="calhead">OKTOBER 2026</div><div class="calday">25</div><div class="calfoot">Hari gajian</div></div>
    <div class="calside">
      <div class="cs"><i>${ic.check}</i><div><b>Laporan gaji</b><span>sudah siap</span></div></div>
      <div class="cs"><i>${ic.check}</i><div><b>Slip karyawan</b><span>sudah siap</span></div></div>
      <div class="cs"><i>${ic.check}</i><div><b>Kamu</b><span>tinggal santai</span></div></div>
    </div>
  </div>`,
  phone: `<div class="hero">
    <div class="phone"><div class="pt"><div class="muted">Portal Karyawan</div><div class="name">Halo, Sari</div></div>
      <div class="tile"><div class="muted">Sisa cuti</div><div class="big2">8 hari</div></div>
      <div class="tile"><div class="muted">Slip gaji terbaru</div><div class="big2">Oktober 2026</div></div>
      <div class="tile"><div class="muted">Sisa kasbon</div><div class="big2">Rp300.000</div></div></div>
    <div class="fl f1"><i>${ic.check}</i>Slip gaji</div><div class="fl f2"><i>${ic.check}</i>Sisa cuti</div>
    <div class="fl f3"><i>${ic.check}</i>Sisa kasbon</div><div class="fl f4"><i>${ic.check}</i>Ajukan lembur</div>
  </div>`,
  poster: `<div class="poster-ans"><span>Jawabannya</span><b>Portal Karyawan.</b><em>Karyawan cek sendiri, kamu tidak perlu mengirimkan satu-satu.</em></div>`,
  versus: `<div class="vs">
    <div class="vcol old"><div class="tag">Cara lama</div>
      <div class="msg">Kirim ke Rina<small>Terkirim</small></div><div class="msg">Kirim ke Agus<small>Terkirim</small></div><div class="msg">Kirim ke Dewi<small>Terkirim</small></div><div class="msg dim2">&hellip; dan seterusnya</div></div>
    <div class="vsb">VS</div>
    <div class="vcol new"><div class="tag">Cara baru</div>
      <div class="one">${ic.doc}</div><div class="onet">Semua karyawan cek slip sendiri di portal</div></div>
  </div>`,
  pipeline: `<div class="pipe">
    <div class="ps"><span>1</span>Absen selfie karyawan</div><div class="pa">${ic.down}</div>
    <div class="ps"><span>2</span>Telat dan lembur terhitung</div><div class="pa">${ic.down}</div>
    <div class="ps"><span>3</span>Kasbon terpotong</div><div class="pa">${ic.down}</div>
    <div class="ps end"><span>${ic.check}</span>Laporan gaji dan slip jadi otomatis</div>
  </div>`,
  steps: `<div class="stp">
    <div class="sc"><div class="sn">1</div><div class="si">${ic.user}</div><b>Pilih nama</b></div>
    <div class="sc"><div class="sn">2</div><div class="si">${ic.cam}</div><b>Ambil selfie</b></div>
    <div class="sc"><div class="sn">3</div><div class="si">${ic.check}</div><b>Selesai</b></div>
  </div>`,
  zero: `<div class="zero"><div class="z0">0</div><div class="zt"><b>aplikasi yang perlu diinstal.</b>
    <div class="zl"><i>${ic.check}</i>Karyawan absen lewat link di browser</div>
    <div class="zl"><i>${ic.check}</i>Cek slip lewat Portal Karyawan</div>
    <div class="zl"><i>${ic.check}</i>Pemilik pantau dari HP atau laptop</div></div></div>`,
};

// ---------- daftar konsep ----------
const concepts = [
  { slug: "k01-chat-tanggal-25", theme: "light", price: false, comp: "chat", pillar: "Portal Karyawan",
    h: "Tiap tanggal 25, HP bos <em>ramai begini.</em>", sub: "Biar mereka cek sendiri di Portal Karyawan.",
    primary: "Tiap gajian, chat masuk: slip gaji mana, sisa cuti berapa, kasbon sisa berapa. Di HrCash, karyawan cek sendiri di Portal Karyawan dengan PIN pribadi, dari HP masing-masing.\n\nRp289.000 sekali bayar.", headline: "Karyawan cek slip sendiri", desc: "Portal Karyawan HrCash" },
  { slug: "k02-tidak-perlu", theme: "dark", price: true, comp: "nolist", pillar: "Tanpa install + otomatis",
    h: "Yang <em>tidak perlu</em> kamu lakukan lagi.", sub: "Absen, lembur, dan slip gaji berjalan otomatis.",
    primary: "Tidak perlu install aplikasi. Tidak perlu rekap di Excel. Tidak perlu hitung lembur pakai kalkulator. Cukup buka link, dan laporan gaji terkumpul otomatis.\n\nHrCash: Rp289.000 sekali bayar.", headline: "Tanpa install, tanpa rekap manual", desc: "Absen selfie + payroll" },
  { slug: "k03-tanpa-install", theme: "amber", price: false, comp: "browser", pillar: "Tanpa install",
    h: "Tanpa install aplikasi. <em>Cukup buka link.</em>", sub: "Karyawan absen dari browser HP masing-masing.",
    primary: "Karyawan tidak perlu download apa pun. Buka link absen di browser HP, pilih nama, ambil selfie, selesai. Tidak makan memori, tidak perlu update.\n\nRp289.000 sekali bayar.", headline: "Absen lewat link, tanpa install", desc: "Dari browser HP karyawan" },
  { slug: "k04-sebelum-sesudah", theme: "dark", price: true, comp: "split", pillar: "Laporan otomatis",
    h: "Sebelum dan sesudah <em>pakai HrCash.</em>", sub: "Dari rekap manual ke laporan gaji otomatis.",
    primary: "Dulu: rekap di Excel, hitung lembur manual, kirim slip satu-satu. Sekarang: laporan gaji otomatis, lembur terhitung sendiri, slip dicek karyawan lewat portal.\n\nRp289.000 sekali bayar.", headline: "Laporan gaji jadi otomatis", desc: "Dari manual ke otomatis" },
  { slug: "k05-kalender-gajian", theme: "amber", price: true, comp: "calendar", pillar: "Laporan otomatis",
    h: "Tanggal 25 <em>tidak lagi bikin pusing.</em>", sub: "Absen, lembur, potongan, dan kasbon sudah terhitung.",
    primary: "Hari gajian tanpa begadang: absensi, lembur, potongan telat, dan kasbon sudah terkumpul jadi laporan gaji dan slip karyawan.\n\nHrCash: Rp289.000 sekali bayar.", headline: "Gajian tanpa pusing", desc: "Laporan gaji otomatis" },
  { slug: "k06-portal-hp", theme: "light", price: true, comp: "phone", pillar: "Portal Karyawan",
    h: "Slip, cuti, kasbon. <em>Semua di HP karyawan.</em>", sub: "Portal Karyawan dengan PIN pribadi.",
    primary: "Portal Karyawan HrCash: karyawan lihat slip gaji, sisa cuti, kasbon, dan bisa mengajukan lembur, semua dari HP, tanpa install aplikasi.\n\nRp289.000 sekali bayar.", headline: "Portal Karyawan", desc: "Slip, cuti, kasbon di HP" },
  { slug: "k07-slip-mana", theme: "dark", price: false, comp: "poster", pillar: "Portal Karyawan", big: true,
    h: "&ldquo;Pak, slip gaji saya <em>mana?</em>&rdquo;", sub: "",
    primary: "Pertanyaan yang muncul tiap gajian. Dengan Portal Karyawan HrCash, karyawan tidak perlu bertanya lagi: slip gaji, sisa cuti, dan kasbon bisa dicek sendiri.\n\nRp289.000 sekali bayar.", headline: "Karyawan tak perlu bertanya lagi", desc: "Portal Karyawan HrCash" },
  { slug: "k08-kirim-satu-satu", theme: "light", price: true, comp: "versus", pillar: "Portal Karyawan",
    h: "Kirim slip satu-satu, <em>atau biar mereka cek sendiri?</em>", sub: "",
    primary: "Kirim slip gaji ke tiap karyawan itu menyita waktu. Dengan Portal Karyawan, semua cek sendiri kapan saja.\n\nHrCash: Rp289.000 sekali bayar.", headline: "Slip gaji tanpa kirim satu-satu", desc: "Cek sendiri lewat portal" },
  { slug: "k09-alur-otomatis", theme: "amber", price: true, comp: "pipeline", pillar: "Laporan otomatis",
    h: "Dari absen sampai slip gaji, <em>jalan sendiri.</em>", sub: "Kamu tinggal cek hasilnya.",
    primary: "Absen selfie karyawan, telat dan lembur terhitung, kasbon terpotong, lalu laporan gaji dan slip jadi otomatis.\n\nHrCash: Rp289.000 sekali bayar.", headline: "Alur gaji otomatis", desc: "Dari absen sampai slip" },
  { slug: "k10-tiga-langkah", theme: "dark", price: false, comp: "steps", pillar: "Tanpa install",
    h: "Absen cuma <em>3 langkah.</em>", sub: "Tanpa install, dari browser HP.",
    primary: "Pilih nama, ambil selfie, selesai. Karyawan absen dari browser HP tanpa install aplikasi apa pun.\n\nRp289.000 sekali bayar.", headline: "Absen 3 langkah, tanpa install", desc: "Dari browser HP" },
  { slug: "k11-nol-aplikasi", theme: "light", price: true, comp: "zero", pillar: "Tanpa install",
    h: "", sub: "",
    primary: "0 aplikasi yang perlu diinstal. Karyawan absen lewat link, cek slip lewat Portal Karyawan, pemilik memantau dari HP atau laptop.\n\nHrCash: Rp289.000 sekali bayar.", headline: "0 aplikasi yang perlu diinstal", desc: "Cukup buka link" },
];

const css = (w, h) => {
  const story = h > 1500, tall = h > w;
  const padT = story ? 200 : tall ? 76 : 60, padB = story ? 300 : tall ? 70 : 52;
  const hs = story ? 100 : tall ? 88 : 76;
  const zoom = story ? 1.12 : tall ? 1 : 0.82;
  return `
@font-face{font-family:Inter;font-weight:400;src:url(${font(400)})}
@font-face{font-family:Inter;font-weight:600;src:url(${font(600)})}
@font-face{font-family:Inter;font-weight:800;src:url(${font(800)})}
:root{--b50:#f1f7fd;--b100:#e3effc;--b200:#c4d8ee;--b600:#3b6a97;--b700:#2b5a85;--b800:#1f4a73;--b900:#17436a;--amber:#f5a524;--ink:#10243a;--ok:#1f9d6b;--neg:#c2410c}
*{box-sizing:border-box;margin:0;padding:0}
body{width:${w}px;height:${h}px;font-family:Inter,sans-serif;color:#fff;overflow:hidden;position:relative;
 background:radial-gradient(900px 700px at 90% -10%,#3b6a97 0%,transparent 60%),linear-gradient(160deg,var(--b900),#0f2f4d)}
.wrap{height:100%;padding:${padT}px 72px ${padB}px;display:flex;flex-direction:column}
.logo{display:flex;align-items:center;gap:14px;font-weight:800;font-size:34px;letter-spacing:-.5px}
.logo-mark{width:46px;height:46px;border-radius:13px;background:#fff;color:var(--b700);display:grid;place-items:center}.logo-mark svg{width:28px;height:28px}
h1{font-weight:800;letter-spacing:-2px;line-height:1.04;font-size:${hs}px;margin-top:${tall ? 48 : 30}px}
h1.big{font-size:${story ? 150 : tall ? 132 : 104}px;letter-spacing:-4px;line-height:1}
h1 em{font-style:normal;color:var(--amber)}
.sub{font-size:${tall ? 36 : 31}px;color:var(--b200);margin-top:22px;line-height:1.3;max-width:900px}
.stage{flex:1;display:flex;align-items:center;justify-content:center;min-height:0;margin:${tall ? 26 : 14}px 0}
.stage>*{zoom:${zoom}}
.muted{color:#5f7690;font-size:26px;margin-top:2px}.name{font-weight:800;font-size:34px;letter-spacing:-.5px}
.foot{display:flex;align-items:center;gap:22px}
.price{background:var(--amber);color:#2b1a00;border-radius:22px;padding:18px 30px;font-weight:800;font-size:${tall ? 40 : 36}px;letter-spacing:-1px;line-height:1}
.price small{display:block;font-weight:600;font-size:22px;letter-spacing:0;margin-top:6px;opacity:.8}
.cta{margin-left:auto;display:flex;align-items:center;gap:14px;background:#fff;color:var(--b800);border-radius:22px;padding:22px 32px;font-weight:800;font-size:32px}.cta svg{width:30px;height:30px}
.cta.full{margin-left:0;width:100%;justify-content:center}
.eg{position:absolute;right:30px;bottom:${story ? 250 : 14}px;font-size:18px;color:rgba(255,255,255,.45)}

/* chat */
.chat{width:100%;max-width:900px;display:flex;flex-direction:column;gap:18px}
.b{max-width:78%;border-radius:30px;padding:20px 26px;font-size:32px;line-height:1.25;box-shadow:0 10px 26px rgba(23,67,106,.14)}
.b.in{background:#fff;color:var(--ink);border-bottom-left-radius:8px;align-self:flex-start}.b.out{background:var(--b700);color:#fff;border-bottom-right-radius:8px;align-self:flex-end;font-weight:600}
.b .who{font-size:22px;font-weight:800;color:var(--b600);margin-bottom:4px}.b .tm{font-size:19px;opacity:.55;text-align:right;margin-top:6px}
/* daftar tidak perlu */
.card{background:#fff;color:var(--ink);border-radius:32px;padding:30px 38px;width:100%;max-width:880px;box-shadow:0 30px 70px rgba(0,0,0,.35)}
.nl{display:flex;align-items:center;gap:22px;padding:20px 0;font-size:34px;font-weight:600;border-bottom:2px solid #e6eef6;color:#7b8fa3;text-decoration:line-through;text-decoration-thickness:3px}
.nl i{width:48px;height:48px;border-radius:50%;background:#fde4dc;color:var(--neg);display:grid;place-items:center;flex:none;text-decoration:none}.nl i svg{width:24px;height:24px}
.nl.yes{border:0;color:var(--ok);font-weight:800;text-decoration:none;font-size:38px;padding-bottom:6px}.nl.yes i{background:#dcf5ea;color:var(--ok)}
/* browser */
.browser{width:100%;max-width:880px}
.bar{display:flex;align-items:center;gap:10px;background:#fff;border-radius:26px 26px 0 0;padding:20px 24px;box-shadow:0 20px 50px rgba(120,70,0,.25)}
.bar span{width:16px;height:16px;border-radius:50%;background:#d6dfe8}.addr{margin-left:14px;flex:1;display:flex;align-items:center;gap:12px;background:var(--b50);border-radius:99px;padding:12px 22px;color:var(--ink);font-size:26px}.addr svg{width:22px;height:22px;color:var(--ok)}
.bbody{background:#fff;color:var(--ink);padding:26px 40px 36px;border-top:2px solid #e6eef6;border-radius:0 0 26px 26px;box-shadow:0 30px 60px rgba(120,70,0,.3)}
.field{margin-top:20px;border:3px solid var(--b200);border-radius:20px;padding:18px 24px;font-size:30px;font-weight:600}
.btn{margin-top:18px;background:var(--b700);color:#fff;border-radius:22px;padding:20px;font-size:32px;font-weight:800;display:flex;gap:14px;align-items:center;justify-content:center}.btn svg{width:34px;height:34px}
.pills{display:flex;gap:12px;margin-top:22px;flex-wrap:wrap}.pills span{background:#fff;color:var(--ink);font-weight:800;font-size:26px;padding:12px 22px;border-radius:99px;box-shadow:0 8px 20px rgba(120,70,0,.2)}
/* split */
.split{display:flex;gap:24px;width:100%;max-width:930px}
.col{flex:1;border-radius:30px;padding:30px 28px}.col.old{background:rgba(255,255,255,.1);border:2px dashed rgba(255,255,255,.3);color:#cfdeee}.col.new{background:#fff;color:var(--ink);border:4px solid var(--amber);box-shadow:0 30px 60px rgba(0,0,0,.3)}
.tag{font-weight:800;font-size:24px;letter-spacing:1px;text-transform:uppercase;margin-bottom:18px}.old .tag{color:#a6bdd4}.new .tag{color:#c26a00}
.it{display:flex;align-items:center;gap:14px;font-size:29px;font-weight:600;padding:12px 0;line-height:1.15}.it i{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;flex:none}.it i svg{width:20px;height:20px}
.old .it i{background:rgba(255,255,255,.16);color:#e8c0b0}.new .it i{background:#dcf5ea;color:var(--ok)}
/* kalender */
.cal{display:flex;gap:30px;align-items:center;width:100%;max-width:930px}
.calbox{width:340px;background:#fff;border-radius:34px;overflow:hidden;box-shadow:0 30px 60px rgba(120,70,0,.35);color:var(--ink);text-align:center;flex:none}
.calhead{background:#d94a2a;color:#fff;font-weight:800;font-size:26px;letter-spacing:2px;padding:18px}.calday{font-weight:800;font-size:190px;letter-spacing:-8px;line-height:1.05;padding-top:6px}.calfoot{font-weight:800;font-size:30px;color:var(--b700);padding:0 0 26px}
.calside{display:flex;flex-direction:column;gap:18px;flex:1}.cs{display:flex;align-items:center;gap:18px;background:#fff;color:var(--ink);border-radius:26px;padding:22px 26px;box-shadow:0 14px 30px rgba(120,70,0,.25)}
.cs i{width:52px;height:52px;border-radius:50%;background:#dcf5ea;color:var(--ok);display:grid;place-items:center;flex:none}.cs i svg{width:26px;height:26px}.cs b{display:block;font-size:30px}.cs span{font-size:26px;color:#5f7690}
/* phone hero */
.hero{position:relative;width:880px;height:640px;display:flex;justify-content:center;align-items:center}
.phone{width:430px;background:#fff;color:var(--ink);border-radius:54px;padding:32px 28px 36px;box-shadow:0 30px 70px rgba(23,67,106,.3);border:10px solid #0b1f33;transform:rotate(-4deg)}
.pt{padding:4px 6px 14px}.phone .tile{background:var(--b50);border-radius:24px;padding:18px 22px;margin-top:12px}.big2{font-weight:800;font-size:34px;letter-spacing:-1px;color:var(--b700);margin-top:2px}
.fl{position:absolute;display:flex;align-items:center;gap:12px;background:var(--b800);color:#fff;font-weight:800;font-size:30px;padding:18px 28px;border-radius:99px;box-shadow:0 16px 36px rgba(23,67,106,.35)}
.fl i{width:34px;height:34px;border-radius:50%;background:var(--amber);color:#2b1a00;display:grid;place-items:center}.fl i svg{width:18px;height:18px}
.f1{left:0;top:70px}.f2{right:0;top:160px}.f3{left:10px;bottom:150px}.f4{right:0;bottom:70px}
/* poster */
.poster-ans{background:#fff;color:var(--ink);border-radius:34px;padding:34px 40px;max-width:880px;box-shadow:0 30px 70px rgba(0,0,0,.35)}
.poster-ans span{display:block;font-weight:800;font-size:24px;letter-spacing:1px;text-transform:uppercase;color:#c26a00}.poster-ans b{display:block;font-size:68px;font-weight:800;letter-spacing:-2px;color:var(--b700);margin-top:6px}.poster-ans em{display:block;font-style:normal;font-size:30px;color:#5f7690;margin-top:10px;line-height:1.3}
/* versus */
.vs{display:flex;align-items:stretch;gap:0;width:100%;max-width:940px;position:relative}
.vcol{flex:1;border-radius:30px;padding:28px 26px;background:#fff;border:2px solid #d5e4f2;box-shadow:0 20px 44px rgba(23,67,106,.14)}.vcol.new{background:var(--b800);color:#fff;border:4px solid var(--amber)}
.vcol .tag{margin-bottom:16px}.vcol.old .tag{color:#7a93ab}.vcol.new .tag{color:var(--amber)}
.msg{display:flex;justify-content:space-between;align-items:center;background:var(--b50);border-radius:18px;padding:16px 20px;margin-top:12px;font-size:27px;font-weight:600;color:var(--ink)}.msg small{font-size:20px;color:#7a93ab;font-weight:600}.msg.dim2{background:transparent;color:#7a93ab;justify-content:center}
.vsb{align-self:center;z-index:2;margin:0 -22px;width:70px;height:70px;border-radius:50%;background:var(--amber);color:#2b1a00;display:grid;place-items:center;font-weight:800;font-size:26px;box-shadow:0 10px 24px rgba(0,0,0,.25)}
.one{width:120px;height:120px;border-radius:30px;background:var(--amber);color:#2b1a00;display:grid;place-items:center;margin:14px auto 18px}.one svg{width:70px;height:70px}.onet{text-align:center;font-size:32px;font-weight:800;line-height:1.2;padding:0 8px}
/* pipeline */
.pipe{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;max-width:820px}
.ps{width:100%;display:flex;align-items:center;gap:22px;background:#fff;color:var(--ink);border-radius:26px;padding:20px 28px;font-size:32px;font-weight:800;box-shadow:0 14px 34px rgba(120,70,0,.25)}
.ps span{width:52px;height:52px;border-radius:50%;background:var(--b100);color:var(--b700);display:grid;place-items:center;font-size:28px;flex:none}.ps span svg{width:28px;height:28px}
.ps.end{background:var(--ink);color:#fff}.ps.end span{background:var(--amber);color:#2b1a00}
.pa{color:var(--ink);opacity:.7}.pa svg{width:34px;height:34px}
/* langkah */
.stp{display:flex;gap:22px;width:100%;max-width:930px}
.sc{flex:1;background:#fff;color:var(--ink);border-radius:30px;padding:30px 20px;text-align:center;box-shadow:0 26px 56px rgba(0,0,0,.32);position:relative}
.sn{position:absolute;top:-22px;left:50%;transform:translateX(-50%);width:50px;height:50px;border-radius:50%;background:var(--amber);color:#2b1a00;font-weight:800;font-size:28px;display:grid;place-items:center}
.si{width:100px;height:100px;border-radius:28px;background:var(--b100);color:var(--b600);display:grid;place-items:center;margin:18px auto 18px}.si svg{width:56px;height:56px}.sc b{font-size:34px}
/* nol */
.zero{display:flex;align-items:center;gap:30px;width:100%;max-width:930px}.z0{font-weight:800;font-size:480px;letter-spacing:-20px;line-height:.85;color:#c26a00}
.zt{flex:1}.zt>b{display:block;font-size:58px;font-weight:800;letter-spacing:-1px;line-height:1.1;color:var(--ink)}
.zl{display:flex;align-items:center;gap:14px;font-size:32px;font-weight:600;margin-top:22px;line-height:1.2;color:#365572}.zl i{width:40px;height:40px;border-radius:50%;background:#dcf5ea;color:var(--ok);display:grid;place-items:center;flex:none}.zl i svg{width:22px;height:22px}

/* tema terang */
body.th-light{color:var(--ink);background:radial-gradient(900px 700px at 100% -10%,#cfe3f6 0%,transparent 60%),linear-gradient(160deg,#fbfdff,#e3effc)}
.th-light .logo-mark{background:var(--b700);color:#fff}.th-light h1 em{color:#c26a00}.th-light .sub{color:#4a6580}.th-light .cta{background:var(--b800);color:#fff}.th-light .eg{color:rgba(16,36,58,.4)}
/* tema kuning */
body.th-amber{color:#1a1200;background:radial-gradient(800px 600px at 100% -10%,#ffd27a 0%,transparent 60%),linear-gradient(160deg,#f7b538,#f29a0c)}
.th-amber .logo-mark{background:var(--ink);color:var(--amber)}.th-amber h1 em{color:var(--b900);background:linear-gradient(transparent 62%,rgba(255,255,255,.55) 62%)}
.th-amber .sub{color:#4a3300}.th-amber .price{background:var(--ink);color:#fff}.th-amber .cta{background:#fff;color:var(--ink)}.th-amber .eg{color:rgba(26,18,0,.45)}
`;
};

const page = (c, w, h) => {
  const foot = c.price
    ? `<div class="foot"><div class="price">Rp289.000<small>sekali bayar</small></div><div class="cta">Lihat demo ${ic.arrow}</div></div>`
    : `<div class="foot"><div class="cta full">Lihat demo ${ic.arrow}</div></div>`;
  const body = c.comp === "zero"
    ? `${logo}<div class="stage" style="flex:1">${C.zero}</div>${foot}`
    : `${logo}<h1${c.big ? ' class="big"' : ""}>${c.h}</h1>${c.sub ? `<p class="sub">${c.sub}</p>` : ""}<div class="stage">${C[c.comp]}${c.comp === "poster" ? "" : ""}</div>${foot}`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css(w, h)}</style></head><body class="th-${c.theme}"><div class="wrap">${body}</div><div class="eg">Tampilan contoh</div></body></html>`;
};

const browser = await chromium.launch({ executablePath: existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined });
const tmp = path.join(OUT, ".tmp.html");
async function shot(html, w, h, name) {
  writeFileSync(tmp, html);
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(tmp).href);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(OUT, name) });
  await p.close();
}
const sizes = [["4x5", 1080, 1350], ["1x1", 1080, 1080], ["9x16", 1080, 1920]];
for (const c of concepts) for (const [k, w, h] of sizes) await shot(page(c, w, h), w, h, `${c.slug}_${k}.png`);
await browser.close();
rmSync(tmp, { force: true });

const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/&ldquo;|&rdquo;/g, '"').replace(/&hellip;/g, "...");
let md = `# HrCash — ${concepts.length} konsep kreatif (Portal Karyawan, tanpa install, laporan otomatis)\n\nSetiap konsep punya 3 ukuran: 4:5 (feed), 1:1, dan 9:16 (Story/Reels, area aman sudah disisakan). Harga: Rp289.000 sekali bayar. Semua nama/angka adalah contoh.\n\n`;
for (const c of concepts) {
  md += `## ${c.slug}\n- **Pesan inti:** ${c.pillar}\n- **Hook:** ${strip(c.h) || "0 aplikasi yang perlu diinstal."}\n- **Gambar:** \`out-kreatif/${c.slug}_4x5.png\`, \`_1x1.png\`, \`_9x16.png\`\n- **Primary text:**\n\n${c.primary.split("\n").map((l) => "  > " + l).join("\n")}\n\n- **Headline:** ${c.headline}\n- **Description:** ${c.desc}\n- **CTA:** Pelajari Selengkapnya\n\n`;
}
writeFileSync(path.join(here, "ads-copy-kreatif.md"), md);
console.log(`ok: ${concepts.length} konsep x ${sizes.length} ukuran`);
