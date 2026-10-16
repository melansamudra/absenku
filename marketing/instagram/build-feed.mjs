// 30 post feed IG (1080x1350) dari posts.mjs. Jalankan: node build-feed.mjs <folder-output>
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { POSTS } from "./posts.mjs";

const require = createRequire(import.meta.url);
const fontDir = path.dirname(require.resolve("@fontsource/inter/package.json")) + "/files";
const font = (w) => pathToFileURL(`${fontDir}/inter-latin-${w}-normal.woff2`).href;
const OUT = path.resolve(process.argv[2] ?? "./out-feed");
const H = 1350;
const em = (s) => s.replace(/\*(.+?)\*/g, "<em>$1</em>");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const e = (s) => em(esc(s));
const check = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
const arrow = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const mark = `<svg viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b5a85"/><stop offset="1" stop-color="#0f2f4d"/></linearGradient><clipPath id="c"><rect width="512" height="512" rx="116"/></clipPath></defs><rect width="512" height="512" rx="116" fill="url(#g)"/><g clip-path="url(#c)" fill="none" stroke="#fff"><circle cx="196" cy="316" r="96" stroke-width="26" opacity=".92"/><circle cx="196" cy="316" r="164" stroke-width="26" opacity=".55"/><circle cx="196" cy="316" r="232" stroke-width="26" opacity=".3"/><circle cx="196" cy="316" r="300" stroke-width="26" opacity=".15"/></g><circle cx="196" cy="316" r="62" fill="#f5a524"/><circle cx="196" cy="316" r="44" fill="none" stroke="#c97d0a" stroke-width="9"/></svg>`;

const body = (s) => {
  switch (s.k) {
    case "cover":
      return `<div class="grow"></div><h1 class="big">${e(s.title)}</h1><div class="sub">${esc(s.sub)}</div><div class="grow"></div>`;
    case "quote":
      return `<div class="grow"></div><h1 class="big q">${e(s.text)}</h1>${s.sub ? `<div class="sub">${esc(s.sub)}</div>` : ""}<div class="grow"></div>`;
    case "list":
      return `<h1>${e(s.title)}</h1><div class="stack">${s.items.map(([a, b], i) => `<div class="card"><span class="num">${/^\d$/.test(a) ? a : i + 1}</span><div><b>${/^\d$/.test(a) ? esc(b) : esc(a)}</b>${/^\d$/.test(a) ? "" : `<span>${esc(b)}</span>`}</div></div>`).join("")}</div>${s.note ? `<div class="note">${esc(s.note)}</div>` : ""}`;
    case "bullets":
      return `<h1>${e(s.title)}</h1><div class="stack">${s.items.map((t) => `<div class="card slim"><i>${check}</i><b>${esc(t)}</b></div>`).join("")}</div>${s.note ? `<div class="note">${esc(s.note)}</div>` : ""}`;
    case "steps":
      return `<h1>${e(s.title)}</h1><div class="tl">${s.items.map(([a, b], i) => `<div class="st"><span class="dot">${i + 1}</span><div><b>${esc(a)}</b><span>${esc(b)}</span></div></div>`).join("")}</div>${s.note ? `<div class="note">${esc(s.note)}</div>` : ""}`;
    case "formula":
      return `<h1>${e(s.title)}</h1><div class="formula"><div class="fbig">${esc(s.big)}</div>${s.rows.map(([a, b]) => `<div class="frow"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join("")}</div>${s.note ? `<div class="note">${esc(s.note)}</div>` : ""}`;
    case "poll":
      return `<h1>${e(s.title)}</h1><div class="stack">${s.options.map(([a, b]) => `<div class="card"><span class="num amb">${a}</span><div><b>${esc(b)}</b></div></div>`).join("")}</div>${s.note ? `<div class="note big2">${esc(s.note)}</div>` : ""}`;
    case "compare":
      return `<h1>${e(s.title)}</h1><div class="cmp"><div class="col bad"><div class="ct">${s.l[0]}</div>${s.l[1].map((t) => `<div class="ci">${esc(t)}</div>`).join("")}</div><div class="col good"><div class="ct">${s.r[0]}</div>${s.r[1].map((t) => `<div class="ci">${esc(t)}</div>`).join("")}</div></div>${s.note ? `<div class="note">${esc(s.note)}</div>` : ""}`;
  }
  return "";
};

const page = (post, s, i, n) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Inter;font-weight:400;src:url(${font(400)})}@font-face{font-family:Inter;font-weight:600;src:url(${font(600)})}@font-face{font-family:Inter;font-weight:800;src:url(${font(800)})}
:root{--b50:#f1f7fd;--b100:#e3effc;--b200:#c4d8ee;--b600:#3b6a97;--b700:#2b5a85;--b800:#1f4a73;--b900:#17436a;--amber:#f5a524;--ink:#10243a}
*{box-sizing:border-box;margin:0}body{width:1080px;height:${H}px;font-family:Inter,sans-serif}
.p{width:1080px;height:${H}px;padding:72px 72px 56px;display:flex;flex-direction:column;position:relative;overflow:hidden}
.biru{background:radial-gradient(900px 700px at 90% -10%,#3b6a97 0%,transparent 60%),linear-gradient(160deg,#17436a,#0f2f4d);color:#fff;--em:#f5a524;--sub:#c4d8ee;--chip:rgba(255,255,255,.14);--num:#f5a524;--numfg:#2b1a00}
.terang{background:#f1f7fd;color:#10243a;--em:#2b5a85;--sub:#4a6580;--chip:#e3effc;--num:#2b5a85;--numfg:#fff}
.kuning{background:linear-gradient(160deg,#ffc24a,#f5a524);color:#10243a;--em:#17436a;--sub:#4a3510;--chip:rgba(16,36,58,.12);--num:#10243a;--numfg:#fff}
.hijau{background:radial-gradient(900px 700px at 90% -10%,#1f7a6c 0%,transparent 60%),linear-gradient(160deg,#0f4a44,#0a2a28);color:#fff;--em:#8ff0c4;--sub:#bfe9dc;--chip:rgba(255,255,255,.14);--num:#8ff0c4;--numfg:#06302b}
.koral{background:#fff1ec;color:#2a1410;--em:#e2502d;--sub:#6b3a2e;--chip:#ffd9cc;--num:#e2502d;--numfg:#fff}
.top{display:flex;align-items:center;justify-content:space-between}.tag{font-size:26px;font-weight:800;letter-spacing:3px;background:var(--chip);border-radius:99px;padding:12px 26px}
h1{font-size:78px;line-height:1.06;letter-spacing:-2.8px;font-weight:800;margin-top:38px}h1 em,.big em{font-style:normal;color:var(--em)}
h1.big{font-size:104px;letter-spacing:-4px;line-height:1.02;margin-top:0}h1.big.q{font-size:84px}
.sub{font-size:42px;line-height:1.3;color:var(--sub);margin-top:34px;font-weight:600;max-width:900px}
.grow{flex:1}.mid{flex:1;display:flex;flex-direction:column;justify-content:center}.mid h1{margin-top:0}
.stack{display:flex;flex-direction:column;gap:20px;margin-top:40px}
.card{display:flex;align-items:center;gap:26px;background:#fff;color:#10243a;border-radius:34px;padding:28px 34px;box-shadow:0 16px 36px rgba(0,0,0,.14)}
.card b{display:block;font-size:46px;letter-spacing:-1px;line-height:1.15}.card span:not(.num){display:block;font-size:33px;color:#5f7690;font-weight:600;margin-top:6px;line-height:1.25}
.num{width:68px;height:68px;border-radius:50%;background:var(--num);color:var(--numfg);font-weight:800;font-size:38px;display:grid;place-items:center;flex:none}
.card.slim{padding:30px 34px}.card.slim i{width:60px;height:60px;border-radius:50%;background:var(--num);color:var(--numfg);display:grid;place-items:center;padding:14px;flex:none}
.tl{display:flex;flex-direction:column;gap:30px;margin-top:44px;position:relative}.tl:before{content:"";position:absolute;left:35px;top:34px;bottom:34px;width:6px;background:var(--chip)}
.st{display:flex;align-items:flex-start;gap:30px;position:relative}.dot{width:72px;height:72px;border-radius:50%;background:var(--num);color:var(--numfg);font-weight:800;font-size:38px;display:grid;place-items:center;flex:none}
.st b{display:block;font-size:48px;letter-spacing:-1px;margin-top:6px}.st span:not(.dot){display:block;font-size:37px;color:var(--sub);font-weight:600;margin-top:6px;line-height:1.28}
.formula{margin-top:40px;background:#fff;color:#10243a;border-radius:40px;padding:38px 44px;box-shadow:0 20px 44px rgba(0,0,0,.16)}.fbig{font-size:124px;font-weight:800;letter-spacing:-5px;color:#17436a;line-height:1}
.frow{display:flex;justify-content:space-between;align-items:center;gap:20px;border-top:3px solid #e6eef6;margin-top:22px;padding-top:22px;font-size:38px}.frow b{font-size:44px}.frow span{color:#4a6580;font-weight:600;text-align:right;font-size:36px}
.cmp{display:flex;gap:24px;margin-top:44px}.col{flex:1;border-radius:36px;padding:34px 30px;box-shadow:0 20px 44px rgba(0,0,0,.16);background:#fff;color:#10243a}
.ct{font-size:30px;font-weight:800;letter-spacing:3px;margin-bottom:18px;border-radius:99px;display:inline-block;padding:8px 22px}.bad .ct{background:#fde7df;color:#c2410c}.good .ct{background:#dcf5ea;color:#1f9d6b}
.ci{font-size:42px;font-weight:800;letter-spacing:-.8px;line-height:1.18;padding:20px 0;border-top:3px solid #e6eef6}
.note{font-size:34px;font-weight:600;color:var(--sub);margin-top:34px;line-height:1.3}.note.big2{font-size:42px;font-weight:800;color:var(--em)}
.foot{margin-top:auto;padding-top:26px;display:flex;align-items:center;justify-content:space-between;font-size:28px;font-weight:600;color:var(--sub)}
.brand{display:flex;align-items:center;gap:14px;font-weight:800;font-size:30px;color:inherit}.brand svg{width:46px;height:46px}.brand b{color:var(--em)}
.swipe{display:flex;align-items:center;gap:12px;font-weight:800;font-size:30px;background:var(--chip);border-radius:99px;padding:14px 28px}.swipe svg{width:28px;height:28px}
</style></head><body><div class="p ${post.pal}"><div class="top"><span class="tag">${post.tag}</span><span style="font-size:28px;font-weight:600;color:var(--sub)">${n > 1 ? `${i + 1}/${n}` : ""}</span></div>
<div class="mid">${body(s)}</div>
<div class="foot"><span class="brand">${mark}<span>Cash <b>Impact</b></span></span>${n > 1 && i < n - 1 ? `<span class="swipe">Geser ${arrow}</span>` : `<span>Simpan dan bagikan</span>`}</div></div></body></html>`;

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
let count = 0;
const capLines = [];
for (const post of POSTS) {
  const dir = path.join(OUT, post.id);
  mkdirSync(dir, { recursive: true });
  for (let i = 0; i < post.slides.length; i++) {
    const pg = await browser.newPage({ viewport: { width: 1080, height: H } });
    await pg.setContent(page(post, post.slides[i], i, post.slides.length));
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(dir, `slide-${i + 1}.png`) });
    await pg.close();
    count++;
  }
  capLines.push(`### ${post.id} (${post.slides.length} slide)\n${post.cap}\n`);
}
await browser.close();
writeFileSync(path.join(OUT, "caption.md"), "# Caption 30 post feed IG\n\nTema umum yang sedang ramai dibahas. Silakan sesuaikan hashtag dan waktu unggah.\n\n" + capLines.join("\n"));
console.log("selesai:", POSTS.length, "post,", count, "slide");
