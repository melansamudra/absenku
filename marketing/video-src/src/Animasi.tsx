import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Background, C, FONT, Icon, FontGate, Phone, SAFE_BOTTOM, SAFE_TOP, Scene, pop, useLocal } from "./kit";
import { Address, AppTile, Bubble, Closing, End, Flow, Pill, Slip, Step, Tick, Top } from "./Videos";

const Mid: React.FC<{ pt?: number; gap?: number; children: React.ReactNode }> = ({ pt = 560, gap = 26, children }) => (
  <AbsoluteFill style={{ padding: `${pt}px 72px 0`, gap }}>{children}</AbsoluteFill>
);
const tilesHome = [{ label: "Sisa cuti", value: "8 hari" }, { label: "Slip gaji terbaru", value: "Oktober 2026", chip: "Siap dilihat" }, { label: "Sisa kasbon", value: "Rp300.000" }];
const PhoneMid: React.FC<{ tiles: { label: string; value: string; chip?: string }[]; pt?: number }> = ({ tiles, pt = 470 }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: pt }}>
    <Phone start={4} scale={0.85} tiles={tiles} />
  </AbsoluteFill>
);

// K04: titip absen
export const K04: React.FC<{ end?: End }> = ({ end = "wa" }) => (
  <FontGate>
    <Background theme="dark" />
    <Scene from={0} dur={150}>
      <Top headline="Titip absen itu *sudah biasa?*" />
      <Mid pt={560}>
        <Bubble who="Agus" text="Bro, tolong absenin aku dulu ya." time="07:41" start={34} />
        <Bubble who="Rina" text="Siap, nanti aku absenin." time="07:42" start={70} />
        <Bubble who="Agus" text="Aman, bos nggak tahu." time="07:42" start={104} />
      </Mid>
    </Scene>
    <Scene from={144} dur={160}>
      <Top headline="Di HrCash, *susah dititipi.*" />
      <Mid pt={640}>
        <Step n={1} icon="cam" label="Selfie wajah" start={30} />
        <Step n={2} icon="check" label="Lokasi dicek" start={62} />
        <Step n={3} icon="user" label="PIN pribadi" start={94} />
      </Mid>
    </Scene>
    <Scene from={298} dur={100}>
      <Top headline="Absen jujur. *HRD tenang.*" />
      <PhoneMid tiles={[{ label: "Absen hari ini", value: "Check In 07:58", chip: "Tepat waktu" }, { label: "Lokasi", value: "Di area kantor" }, { label: "Selfie", value: "Tersimpan" }]} />
    </Scene>
    <Scene from={392} dur={88}><Closing end={end} line="Absen jujur, tanpa ribet." /></Scene>
  </FontGate>
);

// K05: rekap otomatis
export const K05: React.FC<{ end?: End }> = ({ end = "wa" }) => (
  <FontGate>
    <Background theme="dark" />
    <Scene from={0} dur={150}>
      <Top headline="Rekap absen sebulan? *Jangan hitung manual.*" size={80} />
      <Mid pt={600} gap={22}>
        <Tick title="Kehadiran" sub="dihitung otomatis" start={30} />
        <Tick title="Keterlambatan" sub="dihitung otomatis" start={54} />
        <Tick title="Lembur" sub="dihitung otomatis" start={78} />
        <Tick title="Cuti" sub="dihitung otomatis" start={102} />
      </Mid>
    </Scene>
    <Scene from={144} dur={190}>
      <Top headline="Langsung jadi *laporan gaji.*" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 640 }}><Slip /></AbsoluteFill>
    </Scene>
    <Scene from={328} dur={152}><Closing end={end} line="Rekap otomatis. Hati tenang." /></Scene>
  </FontGate>
);

// K06: gaji dikomplain
export const K06: React.FC<{ end?: End }> = ({ end = "wa" }) => (
  <FontGate>
    <Background theme="dark" />
    <Scene from={0} dur={150}>
      <Top headline="Gaji dikomplain, *kok kurang?*" />
      <Mid pt={560}>
        <Bubble who="Rina" text="Pak, kok gaji saya kurang?" time="09:03" start={34} />
        <Bubble who="Agus" text="Potongannya apa saja, Pak?" time="09:05" start={68} />
      </Mid>
    </Scene>
    <Scene from={144} dur={200}>
      <Top headline="Semua rincian *jelas dan transparan.*" size={84} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 640 }}><Slip /></AbsoluteFill>
    </Scene>
    <Scene from={338} dur={100}>
      <Top headline="Karyawan *lihat sendiri* di HP." />
      <PhoneMid tiles={tilesHome} />
    </Scene>
    <Scene from={432} dur={108}><Closing end={end} line="Gaji jelas, tidak ada debat." /></Scene>
  </FontGate>
);

// K07: cuti & lembur
export const K07: React.FC<{ end?: End }> = ({ end = "wa" }) => (
  <FontGate>
    <Background theme="dark" />
    <Scene from={0} dur={160}>
      <Top headline="Cuti dan lembur *tanpa kertas.*" />
      <Mid pt={600} gap={24}>
        <Tick title="Cuti diajukan" sub="dari HP karyawan" start={30} />
        <Tick title="Lembur dicatat" sub="lengkap dengan jam" start={64} />
        <Tick title="Atasan tinggal setuju" sub="satu klik" start={98} />
      </Mid>
    </Scene>
    <Scene from={154} dur={170}>
      <Top headline="Semua rapi di *Portal Karyawan.*" size={84} />
      <PhoneMid tiles={[{ label: "Sisa cuti", value: "8 hari" }, { label: "Ajukan lembur", value: "2 jam", chip: "Menunggu" }, { label: "Slip gaji terbaru", value: "Oktober 2026", chip: "Siap dilihat" }]} />
    </Scene>
    <Scene from={318} dur={110}>
      <Top headline="Tanpa form kertas. *Tanpa install.*" size={86} />
      <Mid pt={640}><Address /></Mid>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: SAFE_BOTTOM + 120 }}>
        <Pill text="Cukup buka link di HP" start={30} />
      </AbsoluteFill>
    </Scene>
    <Scene from={422} dur={118}><Closing end={end} line="Cuti dan lembur, beres di HP." /></Scene>
  </FontGate>
);

// K08: kasbon
export const K08: React.FC<{ end?: End }> = ({ end = "wa" }) => (
  <FontGate>
    <Background theme="dark" />
    <Scene from={0} dur={150}>
      <Top headline="Kasbon lupa dicatat? *Pusing nagihnya.*" size={84} />
      <Mid pt={600}>
        <Bubble who="Dewi" text="Pak, kasbon saya sisa berapa?" time="10:11" start={34} />
        <Bubble text="Sebentar, saya cek bukunya dulu..." time="10:14" start={70} out />
        <Bubble who="Dewi" text="Kemarin katanya sudah lunas, Pak." time="10:15" start={104} />
      </Mid>
    </Scene>
    <Scene from={144} dur={190}>
      <Top headline="Catat sekali. *Terpotong otomatis.*" size={86} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 640 }}><Slip /></AbsoluteFill>
    </Scene>
    <Scene from={328} dur={110}>
      <Top headline="Sisa kasbon *terlihat jelas.*" />
      <PhoneMid tiles={tilesHome} />
    </Scene>
    <Scene from={432} dur={108}><Closing end={end} line="Kasbon rapi, tidak ada salah catat." /></Scene>
  </FontGate>
);

// K09: ganti buku absen (latar kuning)
export const K09: React.FC<{ end?: End }> = ({ end = "wa" }) => (
  <FontGate>
    <Background theme="amber" />
    <Scene from={0} dur={170}>
      <AbsoluteFill style={{ padding: `${SAFE_TOP}px 72px 0` }}>
        <div style={{ marginTop: 0 }}><Top2 text="Buku absen, rekap manual, titip absen. *Cukup sudah.*" /></div>
      </AbsoluteFill>
      <AbsoluteFill style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 24, paddingTop: 500 }}>
        <AppTile ink icon="cal" label="Buku absen" start={30} cross={78} />
        <AppTile ink icon="wallet" label="Rekap manual" start={42} cross={92} />
        <AppTile ink icon="clock" label="Titip absen" start={54} cross={106} />
      </AbsoluteFill>
    </Scene>
    <Scene from={164} dur={190}>
      <AbsoluteFill style={{ padding: `${SAFE_TOP}px 72px 0` }}><Top2 text="Ganti dengan *satu link.*" /></AbsoluteFill>
      <Mid pt={640}>
        <Address />
        <Step n={1} icon="user" label="Pilih nama" start={70} />
        <Step n={2} icon="cam" label="Ambil selfie" start={100} />
        <Step n={3} icon="check" label="Selesai" start={130} />
      </Mid>
    </Scene>
    <Scene from={348} dur={192}><Closing end={end} solid line="Absen digital. Rapi dan jujur." /></Scene>
  </FontGate>
);

// K10: hitung gaji dulu vs sekarang
export const Versus: React.FC<{ old: string; olds: string; now: string; nows: string; tagOld?: string; tagNow?: string; strike?: boolean }> = ({ old, olds, now, nows, tagOld = "DULU", tagNow = "SEKARANG", strike = true }) => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const a = pop(f, 30, fps, 15), b = pop(f, 80, fps, 15);
  const card = (bg: string, fg: string, tag: string, big: string, small: string, s: number, strike?: boolean) => (
    <div style={{ background: bg, color: fg, borderRadius: 44, padding: "36px 44px", fontFamily: FONT, boxShadow: "0 24px 50px rgba(0,0,0,.35)", opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 120}px) scale(${0.92 + s * 0.08})` }}>
      <div style={{ fontSize: 32, fontWeight: 800, opacity: 0.7, letterSpacing: 2 }}>{tag}</div>
      <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -3, lineHeight: 1.05, textDecoration: strike ? "line-through" : "none", textDecorationThickness: 8 }}>{big}</div>
      <div style={{ fontSize: 38, marginTop: 6, opacity: 0.85 }}>{small}</div>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      {card("#fff", C.ink, tagOld, old, olds, a, strike && f > 96)}
      {card(C.amber, "#2b1a00", tagNow, now, nows, b)}
    </div>
  );
};
export const K10: React.FC<{ end?: End }> = ({ end = "wa" }) => (
  <FontGate>
    <Background theme="dark" />
    <Scene from={0} dur={170}>
      <Top headline="Hitung gaji *berjam-jam?*" />
      <Mid pt={600}><Versus old="Berjam-jam" olds="hitung manual, rawan salah" now="Hitungan menit" nows="otomatis dari data absen" /></Mid>
    </Scene>
    <Scene from={164} dur={190}>
      <Top headline="Dari absen sampai slip, *jalan sendiri.*" size={84} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 560 }}><Flow /></AbsoluteFill>
    </Scene>
    <Scene from={348} dur={192}><Closing end={end} line="Gajian jadi lebih ringan." /></Scene>
  </FontGate>
);

// Judul untuk latar kuning (teks gelap).
import { Headline, Logo } from "./kit";
const Top2: React.FC<{ text: string }> = ({ text }) => (
  <>
    <Logo dark={false} />
    <div style={{ marginTop: 50 }}><Headline text={text} size={80} color={C.ink} em={C.b900} delay={2} /></div>
  </>
);
void Icon;
