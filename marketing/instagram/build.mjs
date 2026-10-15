// Konten gambar HrCash: 5 post IG (pain point owner) + carousel 3 gambar (IG & TikTok) untuk konten #1.
// Jalankan: node build.mjs <folder-output>   (butuh playwright + @fontsource/inter)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const fontDir = path.dirname(require.resolve("@fontsource/inter/package.json")) + "/files";
const font = (w) => pathToFileURL(`${fontDir}/inter-latin-${w}-normal.woff2`).href;
const OUT = path.resolve(process.argv[2] ?? "./out");
mkdirSync(OUT, { recursive: true });
const WA = "081234556757";

const ic = {
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  cam: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 4l-1.5 2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-2.5L15 4H9zm3 4.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2.2"/></svg>`,
  down: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16M6 14l6 6 6-6"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  q: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M9 9a3 3 0 116 0c0 2-3 2.5-3 5M12 18.5v.5"/></svg>`,
};
const logo = `<div class="logo"><span class="logo-mark">${ic.check}</span>HrCash</div>`;
const em = (s) => s.replace(/\*(.+?)\*/g, "<em>$1</em>");

// ---------- visual ----------
const bub = (who, txt, time, out) => `<div class="b ${out ? "out" : "in"}">${who ? `<div class="who">${who}</div>` : ""}<div>${txt}</div><div class="tm">${time}</div></div>`;
const V = {
  bukti: `<div class="chat">${bub("Budi", "Saya masuk jam 8 kok, Pak.", "09:14")}${bub("", "Buktinya mana?", "09:15", true)}
    <div class="nobukti"><i>${ic.q}</i><div><b>Bukti kehadiran: tidak ada</b><span>Hanya catatan di buku absen</span></div></div></div>`,
  sheet: (() => {
    const rows = [["Budi", "22", "2", "?"], ["Sari", "24", "0", "Rp340.000"], ["Agus", "#REF!", "5", "Rp0"], ["Dewi", "21", "?", "Rp215.000"], ["Rina", "23", "1", "#SALAH"]];
    const bad = (v) => /#|\?/.test(v);
    return `<div class="sheet"><div class="stime">${ic.clock}<b>22:47</b><span>masih merekap</span></div>
      <table><tr><th>Nama</th><th>Hadir</th><th>Telat</th><th>Lembur</th></tr>${rows.map((r) => `<tr>${r.map((c) => `<td class="${bad(c) ? "bad" : ""}">${c}</td>`).join("")}</tr>`).join("")}</table></div>`;
  })(),
  selisih: `<div class="vs"><div class="vcard"><span>Hitungan owner</span><b>Rp3.450.000</b></div><div class="neq">≠</div><div class="vcard hot"><span>Hitungan karyawan</span><b>Rp3.600.000</b></div>
    <div class="chat tight">${bub("Rina", "Pak, kok gaji saya kurang?", "09:03")}</div></div>`,
  titip: `<div class="list">${[["R", "Rina"], ["A", "Agus"], ["D", "Dewi"]].map(([a, n]) => `<div class="row"><span class="av">${a}</span><b>${n}</b><span class="chip ok">Hadir 07:58</span></div>`).join("")}
    <div class="foot-note"><i>${ic.cam}</i>Semua dicatat dari satu HP. Siapa yang benar-benar datang?</div></div>`,
  siapa: `<div class="list"><div class="count"><b>2</b> dari 5 karyawan sudah absen</div>${[["Budi", "Hadir 07:55", "ok"], ["Sari", "Hadir 08:02", "ok"], ["Agus", "Belum ada kabar", "mute"], ["Dewi", "Izin? Sakit?", "mute"], ["Rina", "Belum ada kabar", "mute"]].map(([n, s, k]) => `<div class="row"><span class="av">${n[0]}</span><b>${n}</b><span class="chip ${k}">${s}</span></div>`).join("")}</div>`,
  masalah: `<div class="list">${["Buku absen mudah diubah", "Jam dan lokasi tidak terbukti", "Semua bergantung rasa percaya"].map((t) => `<div class="prob"><i>${ic.x}</i>${t}</div>`).join("")}
    <div class="arrowdown">${ic.down}</div><div class="solve">Absen dengan selfie, lokasi, dan jam otomatis</div></div>`,
  langkah: `<div class="list">${[[ic.cam, "Selfie wajah", "Foto diambil saat absen"], [ic.pin, "Lokasi tercatat", "Dicek lewat peta di HP"], [ic.clock, "Jam otomatis", "Tidak bisa diubah sendiri"]].map(([i, t, s], n) => `<div class="step"><span class="num">${n + 1}</span><i>${i}</i><div><b>${t}</b><span>${s}</span></div></div>`).join("")}</div>`,
};

// ---------- halaman ----------
const page = ({ theme, h, head, sub, vis, foot = "wa", tall }) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Inter;font-weight:400;src:url(${font(400)})}@font-face{font-family:Inter;font-weight:600;src:url(${font(600)})}@font-face{font-family:Inter;font-weight:800;src:url(${font(800)})}
:root{--b50:#f1f7fd;--b100:#e3effc;--b200:#c4d8ee;--b600:#3b6a97;--b700:#2b5a85;--b800:#1f4a73;--b900:#17436a;--amber:#f5a524;--ink:#10243a;--ok:#1f9d6b;--neg:#c2410c}
*{box-sizing:border-box;margin:0}body{width:1080px;height:${h}px;font-family:Inter,sans-serif}
.p{width:1080px;height:${h}px;padding:${tall ? "190px 72px 330px" : "72px 72px 60px"};display:flex;flex-direction:column;position:relative;overflow:hidden}
.dark{background:radial-gradient(900px 700px at 90% -10%,#3b6a97 0%,transparent 60%),linear-gradient(160deg,var(--b900),#0f2f4d);color:#fff;--em:var(--amber);--sub:var(--b200);--card:#fff;--cardfg:var(--ink)}
.light{background:var(--b50);color:var(--ink);--em:var(--b700);--sub:#4a6580;--card:#fff;--cardfg:var(--ink)}
.amber{background:linear-gradient(160deg,#ffc24a,#f5a524);color:var(--ink);--em:var(--b900);--sub:#4a3510;--card:#fff;--cardfg:var(--ink)}
.logo{display:flex;align-items:center;gap:14px;font-weight:800;font-size:34px;letter-spacing:-.5px}
.logo-mark{width:46px;height:46px;border-radius:13px;background:var(--b700);color:#fff;display:grid;place-items:center}.dark .logo-mark{background:#fff;color:var(--b700)}.logo-mark svg{width:28px;height:28px}
h1{font-size:${tall ? 96 : 86}px;line-height:1.04;letter-spacing:-3px;font-weight:800;margin-top:${tall ? 44 : 36}px}h1 em{font-style:normal;color:var(--em)}
.sub{font-size:${tall ? 38 : 33}px;line-height:1.3;color:var(--sub);margin-top:22px;max-width:930px;font-weight:600}
.vis{flex:1;display:flex;flex-direction:column;justify-content:center;gap:22px;padding:${tall ? 30 : 18}px 0}
.foot{display:flex;align-items:center;justify-content:space-between;font-size:28px;font-weight:600;color:var(--sub)}.foot b{color:inherit;font-weight:800}
.swipe{display:flex;align-items:center;gap:12px;font-weight:800;font-size:32px;color:var(--cardfg);background:var(--card);border-radius:99px;padding:16px 32px}.swipe svg{width:30px;height:30px}
.chat{display:flex;flex-direction:column;gap:22px}.chat.tight{margin-top:26px}
.b{max-width:800px;padding:24px 32px;border-radius:36px;font-size:40px;line-height:1.25;box-shadow:0 14px 34px rgba(0,0,0,.18)}.b.in{background:#fff;color:var(--ink);border-bottom-left-radius:8px;align-self:flex-start}.b.out{background:var(--b700);color:#fff;border-bottom-right-radius:8px;align-self:flex-end;font-weight:600}
.light .b.out{background:var(--b800)}.who{font-size:24px;font-weight:800;color:var(--b600);margin-bottom:4px}.tm{font-size:20px;opacity:.55;text-align:right;margin-top:6px}
.nobukti{display:flex;gap:24px;align-items:center;border:5px dashed var(--neg);border-radius:32px;padding:28px 32px;background:rgba(194,65,12,.12);margin-top:8px}.nobukti i{width:72px;height:72px;flex:none;color:var(--neg)}.nobukti b{display:block;font-size:40px;color:#ffb48c}.nobukti span{font-size:30px;opacity:.85}
.nobukti b{color:var(--neg)}.dark .nobukti b{color:#ffb48c}
.sheet{background:#fff;border-radius:34px;padding:28px 30px;box-shadow:0 24px 50px rgba(0,0,0,.18);color:var(--ink);position:relative}
.stime{display:flex;align-items:center;gap:14px;color:var(--neg);font-size:34px;margin-bottom:16px}.stime svg{width:44px;height:44px}.stime b{font-size:54px;letter-spacing:-1px}.stime span{font-weight:600;color:#4a6580}
table{width:100%;border-collapse:collapse;font-size:34px}th{background:var(--b100);padding:14px;text-align:left;font-weight:800}td{padding:14px;border-bottom:2px solid #e6eef6;font-weight:600}td.bad{background:#fde7df;color:var(--neg);font-weight:800}
.vs{display:flex;flex-direction:column;align-items:stretch}.vcard{background:#fff;color:var(--ink);border-radius:34px;padding:30px 38px;box-shadow:0 20px 44px rgba(0,0,0,.18)}.vcard span{display:block;font-size:30px;font-weight:600;color:#5f7690}.vcard b{font-size:76px;letter-spacing:-2px}.vcard.hot b{color:var(--neg)}
.neq{text-align:center;font-size:90px;font-weight:800;line-height:1;margin:10px 0;color:var(--em)}
.list{display:flex;flex-direction:column;gap:20px}.row{display:flex;align-items:center;gap:22px;background:#fff;color:var(--ink);border-radius:30px;padding:24px 30px;box-shadow:0 16px 36px rgba(0,0,0,.16)}
.av{width:74px;height:74px;border-radius:50%;background:var(--b100);color:var(--b700);display:grid;place-items:center;font-weight:800;font-size:36px}.row b{font-size:42px;flex:1}
.chip{font-size:28px;font-weight:800;border-radius:99px;padding:10px 24px}.chip.ok{background:#dcf5ea;color:var(--ok)}.chip.mute{background:#eef2f6;color:#6b7f93}
.foot-note{display:flex;align-items:center;gap:20px;background:rgba(194,65,12,.14);border:4px dashed var(--neg);border-radius:30px;padding:24px 30px;font-size:34px;font-weight:800;line-height:1.25}.foot-note i{width:54px;height:54px;flex:none;color:var(--neg)}
.light .foot-note,.amber .foot-note{color:var(--ink)}.dark .foot-note{color:#ffd6bf}
.count{font-size:38px;font-weight:600;margin-bottom:4px}.count b{font-size:70px;color:var(--em);letter-spacing:-2px}
.prob{display:flex;align-items:center;gap:26px;background:#fff;color:var(--ink);border-radius:30px;padding:30px 34px;font-size:42px;font-weight:800;box-shadow:0 16px 36px rgba(0,0,0,.16)}.prob i{width:60px;height:60px;border-radius:50%;background:#fde7df;color:var(--neg);display:grid;place-items:center;flex:none;padding:12px}
.arrowdown{width:70px;height:70px;align-self:center;color:var(--em)}.solve{background:var(--amber);color:#2b1a00;border-radius:34px;padding:34px 40px;font-size:46px;font-weight:800;line-height:1.15;text-align:center}
.light .solve{background:var(--b700);color:#fff}
.step{display:flex;align-items:center;gap:26px;background:#fff;color:var(--ink);border-radius:34px;padding:30px 34px;box-shadow:0 20px 44px rgba(0,0,0,.2)}.step i{width:92px;height:92px;border-radius:26px;background:var(--b100);color:var(--b600);display:grid;place-items:center;padding:22px;flex:none}.step b{display:block;font-size:48px;letter-spacing:-1px}.step span{font-size:32px;color:#5f7690;font-weight:600}
.num{width:56px;height:56px;border-radius:50%;background:var(--amber);color:#2b1a00;font-weight:800;font-size:34px;display:grid;place-items:center;flex:none}
</style></head><body><div class="p ${theme}">${logo}<h1>${em(head)}</h1>${sub ? `<div class="sub">${sub}</div>` : ""}<div class="vis">${vis}</div>
<div class="foot">${foot === "swipe" ? `<span>HrCash · absensi &amp; payroll</span><span class="swipe">Geser ${ic.arrow}</span>` : foot === "none" ? "" : `<span>HrCash · absensi &amp; payroll</span><span>Tanya via WA <b>${WA}</b></span>`}</div></div></body></html>`;

// ---------- daftar gambar ----------
const singles = [
  { f: "konten-1-bukti-kehadiran", theme: "dark", head: "Katanya masuk jam 8. *Buktinya mana?*", sub: "Absen di buku gampang diubah. Tanpa bukti, owner yang rugi.", vis: V.bukti, foot: "swipe" },
  { f: "konten-2-rekap-sampai-malam", theme: "light", head: "Akhir bulan, *rekap absen sampai malam.*", sub: "Telat, lembur, izin dihitung satu per satu. Salah satu angka, semuanya ikut salah.", vis: V.sheet },
  { f: "konten-3-gaji-dikomplain", theme: "dark", head: "Gaji beda hitungan, *karyawan protes.*", sub: "Tanpa rincian yang jelas, selisih kecil jadi debat panjang.", vis: V.selisih },
  { f: "konten-4-titip-absen", theme: "amber", head: "Satu orang absen, *tiga nama tercatat.*", sub: "Gaji dibayar untuk jam yang tidak pernah ada.", vis: V.titip },
  { f: "konten-5-siapa-sudah-masuk", theme: "light", head: "Jam 9 pagi. *Siapa yang sudah masuk?*", sub: "Owner yang sibuk tidak bisa cek satu per satu.", vis: V.siapa },
];
const carousel = (tall) => [
  { theme: "dark", head: "Katanya masuk jam 8. *Buktinya mana?*", sub: "Absen di buku gampang diubah. Tanpa bukti, owner yang rugi.", vis: V.bukti, foot: "swipe" },
  { theme: "light", head: "Kenapa ini *terus terulang?*", sub: "", vis: V.masalah, foot: "swipe" },
  { theme: "dark", head: "Absen yang *ada buktinya.*", sub: "Pernah mengalami ini? Tulis di komentar.", vis: V.langkah, foot: "wa" },
].map((x) => ({ ...x, tall }));

const jobs = [];
for (const s of singles) jobs.push({ dir: "ig-post", name: s.f, h: 1350, ...s });
carousel(false).forEach((s, i) => jobs.push({ dir: "ig-carousel-konten-1", name: `slide-${i + 1}`, h: 1350, ...s }));
carousel(true).forEach((s, i) => jobs.push({ dir: "tiktok-konten-1", name: `slide-${i + 1}`, h: 1920, ...s }));

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const j of jobs) {
  mkdirSync(path.join(OUT, j.dir), { recursive: true });
  const pg = await browser.newPage({ viewport: { width: 1080, height: j.h } });
  await pg.setContent(page(j));
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(OUT, j.dir, `${j.name}.png`) });
  await pg.close();
}
await browser.close();
console.log("selesai:", jobs.length, "gambar");
