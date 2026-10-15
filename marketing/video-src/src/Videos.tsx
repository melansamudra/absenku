import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { Background, C, Chip, EndCard, FONT, FontGate, Headline, Icon, Logo, Phone, SAFE_BOTTOM, SAFE_TOP, Scene, count, fade, pop, rupiah, useLocal } from "./kit";

const Top: React.FC<{ headline: string; size?: number; delay?: number }> = ({ headline, size = 92, delay = 2 }) => (
  <AbsoluteFill style={{ padding: `${SAFE_TOP}px 72px 0` }}>
    <Logo />
    <div style={{ marginTop: 50 }}><Headline text={headline} size={size} delay={delay} /></div>
  </AbsoluteFill>
);

export type End = "wa" | "bersih";
export const Closing: React.FC<{ line: string; end: End; solid?: boolean }> = ({ line, end, solid }) =>
  end === "wa" ? <EndCard noPrice solid={solid} line={line} sub="" /> : <EndCard noPrice plain solid={solid} line={line} sub="" />;

// ---------------- V1: chat tanggal 25 -> Portal Karyawan ----------------
const Bubble: React.FC<{ who?: string; text: string; time: string; start: number; out?: boolean; dim?: number }> = ({ who, text, time, start, out, dim = 1 }) => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps, 15);
  return (
    <div style={{ alignSelf: out ? "flex-end" : "flex-start", maxWidth: 800, background: out ? C.b700 : "#fff", color: out ? "#fff" : C.ink, borderRadius: 38, borderBottomLeftRadius: out ? 38 : 10, borderBottomRightRadius: out ? 10 : 38, padding: "26px 34px", fontFamily: FONT, fontSize: 42, lineHeight: 1.25, fontWeight: out ? 600 : 400, boxShadow: "0 14px 34px rgba(0,0,0,.25)", opacity: Math.min(1, s * 1.6) * dim, transform: `translateY(${(1 - s) * 120}px) scale(${0.9 + s * 0.1})` }}>
      {who && <div style={{ fontSize: 26, fontWeight: 800, color: C.b600, marginBottom: 6 }}>{who}</div>}
      {text}
      <div style={{ fontSize: 22, opacity: 0.55, textAlign: "right", marginTop: 8 }}>{time}</div>
    </div>
  );
};

const V1: React.FC<{ end?: End }> = ({ end = "wa" }) => (
  <FontGate>
    <Background theme="dark" />
    <Scene from={0} dur={165}>
      <Top headline="Tiap tanggal 25, HP bos *ramai begini.*" />
      <AbsoluteFill style={{ justifyContent: "center", padding: "560px 72px 0", gap: 26 }}>
        <Bubble who="Rina" text="Pak, slip gaji saya sudah ada belum?" time="07:12" start={34} />
        <Bubble who="Agus" text="Pak, sisa cuti saya berapa hari ya?" time="07:15" start={62} />
        <Bubble who="Dewi" text="Pak, kasbon saya sisa berapa?" time="07:21" start={90} />
      </AbsoluteFill>
    </Scene>
    <Scene from={160} dur={130}>
      <Top headline="Biar mereka *cek sendiri.*" />
      <AbsoluteFill style={{ justifyContent: "center", padding: "560px 72px 0", gap: 26 }}>
        <Bubble who="Rina" text="Pak, slip gaji saya sudah ada belum?" time="07:12" start={-40} dim={0.35} />
        <Bubble who="Agus" text="Pak, sisa cuti saya berapa hari ya?" time="07:15" start={-40} dim={0.35} />
        <Bubble who="Dewi" text="Pak, kasbon saya sisa berapa?" time="07:21" start={-40} dim={0.35} />
        <Bubble text="Cek sendiri di Portal Karyawan ya." time="07:22" start={26} out />
      </AbsoluteFill>
    </Scene>
    <Scene from={284} dur={130}>
      <Top headline="Slip, cuti, kasbon. *Semua di HP karyawan.*" size={80} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 470 }}>
        <Phone start={4} scale={0.8} tiles={[{ label: "Sisa cuti", value: "8 hari" }, { label: "Slip gaji terbaru", value: "Oktober 2026", chip: "Siap dilihat" }, { label: "Sisa kasbon", value: "Rp300.000" }]} />
        <Chip text="Slip gaji" start={34} x={24} y={560} />
        <Chip text="Sisa cuti" start={50} x={690} y={760} />
        <Chip text="Ajukan lembur" start={66} x={10} y={1385} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: SAFE_BOTTOM - 40 }}>
        <Pill text="Tanpa install. Cukup buka link." start={70} />
      </AbsoluteFill>
    </Scene>
    <Scene from={408} dur={132}>
      <Closing end={end} line="Portal Karyawan + laporan gaji otomatis" />
    </Scene>
  </FontGate>
);

const Pill: React.FC<{ text: string; start: number }> = ({ text, start }) => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps, 15);
  return <div style={{ background: C.amber, color: "#2b1a00", fontFamily: FONT, fontWeight: 800, fontSize: 46, padding: "22px 46px", borderRadius: 99, opacity: Math.min(1, s * 1.5), transform: `scale(${0.7 + s * 0.3})` }}>{text}</div>;
};

// ---------------- V2: 0 aplikasi ----------------
const AppTile: React.FC<{ icon: "clock" | "wallet" | "cal"; label: string; start: number; cross: number; ink?: boolean }> = ({ icon, label, start, cross, ink }) => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps, 14);
  const x = pop(f, cross, fps, 16);
  return (
    <div style={{ width: 270, textAlign: "center", fontFamily: FONT, color: ink ? C.ink : "#fff", opacity: Math.min(1, s * 1.5) * (1 - x * 0.55), transform: `scale(${(0.5 + s * 0.5) * (1 - x * 0.12)})` }}>
      <div style={{ position: "relative", width: 190, height: 190, margin: "0 auto", borderRadius: 46, background: "#fff", color: C.b700, display: "grid", placeItems: "center", boxShadow: "0 20px 44px rgba(0,0,0,.35)" }}>
        <Icon name={icon} size={100} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 46, background: "rgba(194,65,12,.88)", display: "grid", placeItems: "center", color: "#fff", opacity: x, transform: `scale(${0.6 + x * 0.4})` }}><Icon name="x" size={120} /></div>
      </div>
      <div style={{ marginTop: 20, fontWeight: 600, fontSize: 32 }}>{label}</div>
    </div>
  );
};

const Step: React.FC<{ n: number; icon: "user" | "cam" | "check"; label: string; start: number }> = ({ n, icon, label, start }) => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps, 15);
  const active = f >= start;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28, background: "#fff", borderRadius: 36, padding: "28px 36px", boxShadow: "0 20px 44px rgba(0,0,0,.3)", opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 200}px)`, fontFamily: FONT, color: C.ink, borderLeft: `14px solid ${active ? C.ok : C.b200}` }}>
      <div style={{ width: 96, height: 96, borderRadius: 28, background: C.b100, color: C.b600, display: "grid", placeItems: "center" }}><Icon name={icon} size={54} /></div>
      <div><div style={{ fontSize: 28, color: "#5f7690", fontWeight: 600 }}>Langkah {n}</div><div style={{ fontSize: 50, fontWeight: 800, letterSpacing: -1 }}>{label}</div></div>
    </div>
  );
};

const V2: React.FC<{ end?: End }> = ({ end = "wa" }) => {
  return (
    <FontGate>
      <Background theme="amber" />
      <Scene from={0} dur={160}>
        <AbsoluteFill style={{ padding: `${SAFE_TOP}px 72px 0` }}>
          <Logo dark={false} />
          <div style={{ marginTop: 50 }}><Headline text="Perlu install berapa aplikasi buat absen dan gajian?" size={84} color={C.ink} em={C.b900} delay={2} /></div>
        </AbsoluteFill>
        <AbsoluteFill style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 24, paddingTop: 460 }}>
          <AppTile ink icon="clock" label="Aplikasi absen" start={30} cross={74} />
          <AppTile ink icon="wallet" label="Aplikasi gaji" start={42} cross={88} />
          <AppTile ink icon="cal" label="Aplikasi cuti" start={54} cross={102} />
        </AbsoluteFill>
        <ZeroBig />
      </Scene>
      <Scene from={154} dur={190}>
        <AbsoluteFill style={{ padding: `${SAFE_TOP}px 72px 0` }}>
          <Logo dark={false} />
          <div style={{ marginTop: 50 }}><Headline text="Cukup *buka link.* Absen 3 langkah." size={88} color={C.ink} em={C.b900} delay={2} /></div>
        </AbsoluteFill>
        <AbsoluteFill style={{ padding: "640px 72px 0", gap: 26 }}>
          <Address />
          <Step n={1} icon="user" label="Pilih nama" start={70} />
          <Step n={2} icon="cam" label="Ambil selfie" start={100} />
          <Step n={3} icon="check" label="Selesai" start={130} />
        </AbsoluteFill>
      </Scene>
      <Scene from={338} dur={110}>
        <AbsoluteFill style={{ padding: `${SAFE_TOP}px 72px 0` }}>
          <Logo dark={false} />
          <div style={{ marginTop: 50 }}><Headline text="Slip, cuti, kasbon: *karyawan cek sendiri.*" size={80} color={C.ink} em={C.b900} delay={2} /></div>
        </AbsoluteFill>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 640 }}>
          <Phone start={4} scale={0.85} tiles={[{ label: "Sisa cuti", value: "8 hari" }, { label: "Slip gaji terbaru", value: "Oktober 2026", chip: "Siap dilihat" }, { label: "Sisa kasbon", value: "Rp300.000" }]} />
        </AbsoluteFill>
      </Scene>
      <Scene from={442} dur={98}>
        <Closing end={end} solid line="Absen selfie + payroll. Tanpa install." />
      </Scene>
    </FontGate>
  );
};

const ZeroBig: React.FC = () => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const s = pop(f, 116, fps, 11);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 1000, opacity: Math.min(1, s * 1.5) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 28, transform: `scale(${0.5 + s * 0.5})`, fontFamily: FONT, color: C.ink }}>
        <div style={{ fontWeight: 800, fontSize: 330, letterSpacing: -14, lineHeight: 0.85, color: C.b900 }}>0</div>
        <div style={{ fontWeight: 800, fontSize: 62, lineHeight: 1.08, letterSpacing: -1.5, maxWidth: 480 }}>aplikasi yang perlu diinstal.</div>
      </div>
    </AbsoluteFill>
  );
};

const Address: React.FC = () => {
  const f = useLocal();
  const txt = "link-absen-toko-kamu";
  const n = Math.round(interpolate(f, [8, 52], [0, txt.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const { fps } = useVideoConfig();
  const s = pop(f, 4, fps);
  return (
    <div style={{ background: "#fff", borderRadius: 40, padding: "26px 34px", display: "flex", alignItems: "center", gap: 18, boxShadow: "0 20px 44px rgba(0,0,0,.3)", fontFamily: FONT, color: C.ink, opacity: s, transform: `translateY(${(1 - s) * 60}px)` }}>
      <span style={{ color: C.ok }}><Icon name="lock" size={40} /></span>
      <span style={{ fontSize: 46, fontWeight: 600 }}>{txt.slice(0, n)}<span style={{ opacity: f % 16 < 8 ? 1 : 0 }}>|</span></span>
    </div>
  );
};

// ---------------- V3: kalender gajian + alur otomatis ----------------
const Tick: React.FC<{ title: string; sub: string; start: number }> = ({ title, sub, start }) => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps, 15);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26, background: "#fff", borderRadius: 34, padding: "26px 34px", boxShadow: "0 20px 44px rgba(0,0,0,.3)", fontFamily: FONT, color: C.ink, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 260}px)` }}>
      <div style={{ width: 76, height: 76, borderRadius: "50%", background: "#dcf5ea", color: C.ok, display: "grid", placeItems: "center", transform: `scale(${s})` }}><Icon name="check" size={42} /></div>
      <div><div style={{ fontWeight: 800, fontSize: 46 }}>{title}</div><div style={{ fontSize: 34, color: "#5f7690" }}>{sub}</div></div>
    </div>
  );
};

const Calendar: React.FC = () => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const s = pop(f, 6, fps, 14);
  const day = Math.max(1, count(f, 14, 58, 25));
  return (
    <div style={{ width: 520, background: "#fff", borderRadius: 52, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,.4)", textAlign: "center", fontFamily: FONT, color: C.ink, transform: `scale(${0.6 + s * 0.4}) rotate(${(1 - s) * -10}deg)`, opacity: Math.min(1, s * 1.5) }}>
      <div style={{ background: "#d94a2a", color: "#fff", fontWeight: 800, fontSize: 40, letterSpacing: 3, padding: 26 }}>OKTOBER 2026</div>
      <div style={{ fontWeight: 800, fontSize: 300, letterSpacing: -14, lineHeight: 1.05 }}>{day}</div>
      <div style={{ fontWeight: 800, fontSize: 46, color: C.b700, paddingBottom: 34 }}>Hari gajian</div>
    </div>
  );
};

const Flow: React.FC = () => {
  const f = useLocal();
  const steps = ["Absen selfie karyawan", "Telat dan lembur terhitung", "Kasbon terpotong", "Laporan gaji dan slip jadi"];
  const t = [26, 66, 106, 146];
  const { fps } = useVideoConfig();
  const dotY = interpolate(f, [t[0], t[3]], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ width: 900, display: "flex", flexDirection: "column", gap: 34, position: "relative" }}>
      {steps.map((txt, i) => {
        const s = pop(f, 4 + i * 8, fps, 15);
        const done = f >= t[i] + 18;
        const last = i === 3;
        return (
          <React.Fragment key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 28, background: last && done ? C.ink : "#fff", color: last && done ? "#fff" : C.ink, borderRadius: 36, padding: "30px 38px", boxShadow: "0 20px 44px rgba(0,0,0,.3)", fontFamily: FONT, fontWeight: 800, fontSize: 50, opacity: Math.min(1, s * 1.5), transform: `scale(${0.9 + s * 0.1})` }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: done ? (last ? C.amber : C.ok) : C.b100, color: done ? (last ? "#2b1a00" : "#fff") : C.b700, display: "grid", placeItems: "center", fontSize: 40, flex: "none" }}>
                {done ? <Icon name="check" size={44} /> : i + 1}
              </div>
              {txt}
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 76, top: 40 + dotY * 160, width: 22, height: 22, borderRadius: "50%", background: C.amber, boxShadow: "0 0 30px 10px rgba(245,165,36,.7)", opacity: f >= t[0] && f < t[3] + 14 ? 1 : 0 }} />
    </div>
  );
};

const Slip: React.FC = () => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const s = pop(f, 4, fps, 15);
  const rows: [string, string, boolean][] = [["Gaji pokok", "Rp3.200.000", false], ["Uang makan", "Rp450.000", false], ["Lembur (6 jam)", "Rp180.000", false], ["Potongan telat", "-Rp40.000", true], ["Kasbon", "-Rp200.000", true]];
  const total = count(f, 70, 110, 3590000);
  return (
    <div style={{ width: 900, background: "#fff", borderRadius: 50, padding: "44px 54px", boxShadow: "0 40px 90px rgba(0,0,0,.4)", fontFamily: FONT, color: C.ink, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 500}px) scale(${0.9 + s * 0.1})` }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div><div style={{ fontWeight: 800, fontSize: 48 }}>Slip Gaji · Oktober 2026</div><div style={{ fontSize: 32, color: "#5f7690" }}>Sari Wulandari</div></div>
        <div style={{ marginLeft: "auto", background: "#dcf5ea", color: C.ok, fontWeight: 600, fontSize: 30, padding: "8px 24px", borderRadius: 99, opacity: fade(f, 100, 112) }}>Lunas</div>
      </div>
      <div style={{ height: 3, background: "#e6eef6", margin: "28px 0" }} />
      {rows.map(([a, b, neg], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: 40, opacity: fade(f, 20 + i * 8, 30 + i * 8), transform: `translateX(${(1 - fade(f, 20 + i * 8, 30 + i * 8)) * 40}px)` }}>
          <span style={{ color: "#4a6580" }}>{a}</span><b style={{ color: neg ? C.neg : C.ink }}>{b}</b>
        </div>
      ))}
      <div style={{ height: 3, background: "#e6eef6", margin: "24px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 52, fontWeight: 800 }}>
        <span>Total diterima</span><span style={{ color: C.b700 }}>{rupiah(total)}</span>
      </div>
    </div>
  );
};

const V3: React.FC<{ end?: End }> = ({ end = "wa" }) => (
  <FontGate>
    <Background theme="dark" />
    <Scene from={0} dur={160}>
      <Top headline="Tanggal 25 *tidak lagi bikin pusing.*" />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 640 }}><Calendar /></AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: `0 72px ${SAFE_BOTTOM - 80}px`, gap: 18 }}>
        <Tick title="Laporan gaji" sub="sudah siap" start={80} />
        <Tick title="Slip karyawan" sub="sudah siap" start={100} />
      </AbsoluteFill>
    </Scene>
    <Scene from={154} dur={190}>
      <Top headline="Dari absen sampai slip gaji, *jalan sendiri.*" size={84} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 560 }}><Flow /></AbsoluteFill>
    </Scene>
    <Scene from={338} dur={120}>
      <Top headline="Laporan gaji *otomatis.* Kamu tinggal cek." size={80} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 640 }}><Slip /></AbsoluteFill>
    </Scene>
    <Scene from={452} dur={88}>
      <Closing end={end} line="Gajian tanpa pusing." />
    </Scene>
  </FontGate>
);

export { V1, V2, V3, Top, Bubble, Pill, AppTile, Step, Address, Tick, Calendar, Flow, Slip };
