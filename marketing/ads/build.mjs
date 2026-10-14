// Generator gambar iklan HrCash (PNG untuk Meta Ads).
// Jalankan dari folder yang punya paket `playwright` dan `@fontsource/inter`:
//   node build.mjs            -> tulis PNG ke ./out
// Semua angka di mockup adalah CONTOH (bukan data pelanggan asli).
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const fontDir = path.dirname(require.resolve("@fontsource/inter/package.json")) + "/files";
const font = (w) => pathToFileURL(`${fontDir}/inter-latin-${w}-normal.woff2`).href;

const OUT = path.resolve(process.argv[2] ?? "./out");
mkdirSync(OUT, { recursive: true });

// --- ikon (SVG inline, tanpa emoji supaya tampil sama di semua mesin) ---
const ic = {
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 10V8a6 6 0 1112 0v2h1a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V11a1 1 0 011-1h1zm2 0h8V8a4 4 0 10-8 0v2z"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4.5"/><path d="M3.5 21c.6-4.6 4-7 8.5-7s7.9 2.4 8.5 7z"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
};

const logo = `<div class="logo"><span class="logo-mark">${ic.check}</span>HrCash</div>`;

// --- mockup tiap iklan ---
const mock = {
  absen: `
    <div class="card">
      <div class="row">
        <div class="avatar">${ic.user}</div>
        <div><div class="name">Budi Santoso</div><div class="muted">Absen masuk · 07:58</div></div>
        <div class="chip ok">Tepat waktu</div>
      </div>
      <div class="rule"></div>
      <div class="line"><span class="line-ic blue">${ic.pin}</span><div><b>Lokasi sesuai</b><div class="muted">23 m dari kantor (batas 100 m)</div></div></div>
      <div class="line"><span class="line-ic blue">${ic.user}</span><div><b>Selfie terverifikasi</b><div class="muted">Foto diambil saat absen</div></div></div>
      <div class="line"><span class="line-ic blue">${ic.lock}</span><div><b>PIN pribadi</b><div class="muted pin">&bull; &bull; &bull; &bull;</div></div></div>
    </div>`,
  slip: `
    <div class="card">
      <div class="row"><div><div class="name">Slip Gaji · Oktober 2026</div><div class="muted">Sari Wulandari</div></div><div class="chip ok">Lunas</div></div>
      <div class="rule"></div>
      <div class="kv"><span>Gaji pokok</span><b>Rp3.200.000</b></div>
      <div class="kv"><span>Uang makan</span><b>Rp450.000</b></div>
      <div class="kv"><span>Lembur (6 jam)</span><b>Rp180.000</b></div>
      <div class="kv neg"><span>Potongan telat</span><b>-Rp40.000</b></div>
      <div class="kv neg"><span>Kasbon</span><b>-Rp200.000</b></div>
      <div class="rule"></div>
      <div class="kv total"><span>Total diterima</span><b>Rp3.590.000</b></div>
    </div>`,
  sekali: `
    <div class="duo">
      <div class="card dim">
        <div class="tag gray">Aplikasi langganan</div>
        <div class="big gray">Bayar tiap bulan</div>
        <div class="muted2" style="color:#c9d9ea">Selama dipakai, tagihan terus jalan. Berhenti bayar, tidak bisa pakai.</div>
      </div>
      <div class="card hot">
        <div class="tag amber">HrCash</div>
        <div class="big">Rp289.000</div>
        <div class="muted2">Sekali bayar. Tanpa langganan bulanan.</div>
        <div class="ticks"><span>${ic.check}Tanpa biaya per karyawan</span><span>${ic.check}Absen selfie + payroll lengkap</span></div>
      </div>
    </div>`,
  lembur: `
    <div class="card">
      <div class="row"><div class="name">Rekap Hari Ini</div><div class="chip">Contoh</div></div>
      <div class="rule"></div>
      <div class="kv"><span>Jadwal masuk</span><b>08:00</b></div>
      <div class="kv"><span>Absen masuk</span><b>08:12</b></div>
      <div class="kv neg"><span>Terlambat</span><b>12 menit</b></div>
      <div class="rule"></div>
      <div class="kv"><span>Jadwal pulang</span><b>17:00</b></div>
      <div class="kv"><span>Absen pulang</span><b>18:35</b></div>
      <div class="kv pos"><span>Lembur dihitung</span><b>1,5 jam</b></div>
      <div class="note">Aturan telat dan lembur kamu atur sendiri</div>
    </div>`,
  portal: `
    <div class="phone">
      <div class="phone-top"><div class="muted">Portal Karyawan</div><div class="name">Halo, Sari</div></div>
      <div class="tile"><div class="muted">Sisa cuti</div><div class="big2">8 hari</div></div>
      <div class="tile"><div class="muted">Slip gaji terbaru</div><div class="big2">Oktober 2026</div><div class="chip ok sm">Siap dilihat</div></div>
      <div class="tile"><div class="muted">Sisa kasbon</div><div class="big2">Rp300.000</div></div>
    </div>`,
};

// --- iklan tunggal ---
const ads = [
  { id: "01-anti-titip-absen", headline: `Karyawan titip absen? <em>Lebih sulit</em> sekarang.`, sub: "Absen selfie + lokasi kantor + PIN pribadi.", mock: mock.absen },
  { id: "02-gajian-sekali-klik", headline: `Gajian beres <em>sekali klik.</em>`, sub: "Absen, lembur, potongan, dan kasbon jadi slip gaji otomatis.", mock: mock.slip },
  { id: "03-bayar-sekali", headline: `Bayar <em>sekali.</em> Bukan langganan.`, sub: "Absensi dan payroll untuk usaha kecil.", mock: mock.sekali, hidePrice: true },
  { id: "04-telat-lembur-otomatis", headline: `Telat dan lembur <em>dihitung otomatis.</em>`, sub: "Adil buat karyawan, aman buat pemilik usaha.", mock: mock.lembur },
  { id: "05-karyawan-cek-slip", headline: `Karyawan cek slip <em>sendiri.</em>`, sub: "Tidak perlu lagi kirim slip satu per satu.", mock: mock.portal },
];

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
h1{font-weight:800;letter-spacing:-2px;line-height:1.02;font-size:${h > w ? 92 : 80}px;margin-top:${h > w ? 52 : 34}px}
h1 em{font-style:normal;color:var(--amber)}
.sub{font-size:${h > w ? 36 : 32}px;color:var(--b200);margin-top:22px;line-height:1.3;max-width:900px}
.stage{flex:1;display:flex;align-items:center;justify-content:center;min-height:0;margin:${h > w ? 28 : 18}px 0}
.card{background:#fff;color:var(--ink);border-radius:32px;padding:36px 40px;width:100%;max-width:880px;box-shadow:0 30px 70px rgba(0,0,0,.35)}
.row{display:flex;align-items:center;gap:20px}.row .chip{margin-left:auto}
.avatar{width:72px;height:72px;border-radius:50%;background:var(--b100);color:var(--b600);display:grid;place-items:center}
.avatar svg{width:42px;height:42px}
.name{font-weight:800;font-size:34px;letter-spacing:-.5px}
.muted{color:#5f7690;font-size:26px;margin-top:2px}.muted2{color:#d6e4f3;font-size:26px;margin-top:6px}
.chip{font-weight:600;font-size:24px;padding:8px 20px;border-radius:99px;background:var(--b100);color:var(--b700);white-space:nowrap}
.chip.ok{background:#dcf5ea;color:var(--ok)}.chip.sm{display:inline-block;margin-top:10px;font-size:20px;padding:5px 14px}
.rule{height:2px;background:#e6eef6;margin:24px 0}
.line{display:flex;gap:20px;align-items:center;padding:10px 0;font-size:28px}
.line-ic{width:54px;height:54px;border-radius:16px;display:grid;place-items:center;flex:none}
.line-ic.blue{background:var(--b100);color:var(--b600)}.line-ic svg{width:28px;height:28px}
.line b{font-size:30px}.pin{letter-spacing:6px;font-size:30px;color:var(--ink)}
.kv{display:flex;justify-content:space-between;padding:9px 0;font-size:29px}
.kv span{color:#4a6580}.kv b{font-weight:800}.kv.neg b{color:var(--neg)}.kv.pos b{color:var(--ok)}
.kv.total{font-size:36px;padding:2px 0}.kv.total span{color:var(--ink);font-weight:800}.kv.total b{color:var(--b700)}
.note{margin-top:14px;font-size:24px;color:#5f7690;background:var(--b50);border-radius:14px;padding:12px 18px}
.duo{display:flex;gap:26px;width:100%;max-width:930px;align-items:stretch}
.duo .card{padding:34px 34px}.duo .dim{background:rgba(255,255,255,.1);color:#e3eefa;box-shadow:none;border:2px dashed rgba(255,255,255,.3)}
.duo .hot{background:linear-gradient(160deg,#2b5a85,#1f4a73);color:#fff;border:3px solid var(--amber)}
.tag{font-weight:600;font-size:22px;letter-spacing:.5px;text-transform:uppercase;margin-bottom:14px}.tag.gray{color:#a6bdd4}.tag.amber{color:var(--amber)}
.big{font-weight:800;font-size:${h > w ? 70 : 58}px;letter-spacing:-2px;line-height:1.05}.big.gray{font-size:44px;letter-spacing:-1px}
.ticks{display:flex;flex-direction:column;gap:12px;margin-top:22px;font-size:25px}.ticks span{display:flex;align-items:center;gap:12px}
.ticks svg{width:26px;height:26px;color:var(--amber);flex:none}
.phone{width:470px;background:#fff;color:var(--ink);border-radius:54px;padding:34px 30px 38px;box-shadow:0 30px 70px rgba(0,0,0,.4);border:10px solid #0b1f33}
.phone-top{padding:6px 6px 18px}.phone .tile{background:var(--b50);border-radius:24px;padding:20px 24px;margin-top:14px}
.big2{font-weight:800;font-size:38px;letter-spacing:-1px;color:var(--b700);margin-top:2px}
.foot{display:flex;align-items:center;gap:22px}
.price{background:var(--amber);color:#2b1a00;border-radius:22px;padding:18px 30px;font-weight:800;font-size:${h > w ? 40 : 36}px;letter-spacing:-1px;line-height:1}
.price small{display:block;font-weight:600;font-size:22px;letter-spacing:0;margin-top:6px;opacity:.8}
.cta{margin-left:auto;display:flex;align-items:center;gap:14px;background:#fff;color:var(--b800);border-radius:22px;padding:22px 32px;font-weight:800;font-size:32px}
.cta svg{width:30px;height:30px}
.sq .cstage .card{zoom:.68}.sq .phone{zoom:.66}.sq .card{zoom:.86}.sq .duo .card{zoom:.9}
.eg{position:absolute;right:30px;bottom:14px;font-size:18px;color:rgba(255,255,255,.45)}
`;

const frame = (w, h, inner) => `<!doctype html><html><head><meta charset="utf-8"><style>${css(w, h)}</style></head><body class="${w === h ? "sq" : "tall"}"><div class="wrap">${inner}</div><div class="eg">Tampilan contoh</div></body></html>`;

const footer = `<div class="foot"><div class="price">Rp289.000<small>sekali bayar</small></div><div class="cta">Lihat demo ${ic.arrow}</div></div>`;

const footerCta = `<div class="foot"><div class="cta" style="margin-left:0;width:100%;justify-content:center">Lihat demo ${ic.arrow}</div></div>`;

const single = (ad, w, h) =>
  frame(w, h, `${logo}<h1>${ad.headline}</h1><p class="sub">${ad.sub}</p><div class="stage">${ad.mock}</div>${ad.hidePrice ? footerCta : footer}`);

// --- carousel 1080x1080 ---
const cs = (n, title, body, extra = "") => `
  ${logo}
  <div style="margin-top:44px;display:flex;align-items:center;gap:14px"><span style="background:var(--amber);color:#2b1a00;font-weight:800;font-size:28px;border-radius:99px;padding:8px 22px">${n}</span></div>
  <h1 style="margin-top:26px;font-size:84px">${title}</h1>
  <p class="sub" style="font-size:36px">${body}</p>
  <div class="stage cstage">${extra}</div>
  <div class="foot"><div style="color:var(--b200);font-size:26px">Geser untuk lanjut</div><div class="cta" style="padding:16px 26px;font-size:28px">${ic.arrow}</div></div>`;

const carousel = [
  frame(1080, 1080, `${logo}<h1 style="margin-top:70px;font-size:96px">3 tanda usahamu butuh <em>absen digital.</em></h1><p class="sub" style="font-size:38px;margin-top:30px">Salah satunya kamu alami? Geser.</p><div class="stage"></div><div class="foot"><div style="color:var(--b200);font-size:28px">Geser untuk lanjut</div><div class="cta" style="padding:16px 26px;font-size:28px">${ic.arrow}</div></div>`),
  frame(1080, 1080, cs("1", `Ada yang <em>titip absen.</em>`, "Buku absen gampang diisi orang lain.", mock.absen.replace("max-width:880px", ""))),
  frame(1080, 1080, cs("2", `Rekap gaji <em>makan waktu.</em>`, "Hitung lembur, telat, dan kasbon manual tiap akhir bulan.", mock.slip)),
  frame(1080, 1080, cs("3", `Sering <em>selisih paham</em> soal lembur.`, "Tanpa aturan jelas, karyawan dan pemilik sama-sama ragu.", mock.lembur)),
  frame(1080, 1080, `${logo}<h1 style="margin-top:60px;font-size:90px">Semua beres di <em>satu aplikasi.</em></h1><p class="sub" style="font-size:36px">Absen selfie, lembur, cuti, kasbon, dan slip gaji.</p><div class="stage" style="flex-direction:column;gap:26px"><div class="price" style="font-size:76px;padding:30px 50px">Rp289.000<small style="font-size:30px">sekali bayar, tanpa langganan</small></div></div><div class="foot"><div class="cta" style="margin-left:0;width:100%;justify-content:center">Lihat demo ${ic.arrow}</div></div>`),
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
  console.log("ok", name);
}

for (const ad of ads) {
  await shot(single(ad, 1080, 1350), 1080, 1350, `${ad.id}_4x5.png`);
  await shot(single(ad, 1080, 1080), 1080, 1080, `${ad.id}_1x1.png`);
}
for (let i = 0; i < carousel.length; i++) {
  await shot(carousel[i], 1080, 1080, `carousel-3-tanda_${i + 1}.png`);
}
await browser.close();
