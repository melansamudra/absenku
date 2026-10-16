import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { Background, C, EndCard, FONT, FontGate, Headline, Logo, SAFE_TOP, Scene, pop, useLocal } from "./kit";

// Jendela potong rekaman (384x832): buang status bar atas (46 px) dan area bawah
// (708 px ke bawah: bar Safari + banner "terlambat"). Tombol Check In tetap terlihat.
const VW = 384, VH = 832, CROP_TOP = 46, CROP_BOTTOM = 708;
const SCREEN_W = 560;
const k = SCREEN_W / VW;
const WIN_H = (CROP_BOTTOM - CROP_TOP) * k;

export const Top: React.FC<{ headline: string; size?: number }> = ({ headline, size = 92 }) => (
  <AbsoluteFill style={{ padding: `${SAFE_TOP}px 72px 0` }}>
    <Logo />
    <div style={{ marginTop: 50 }}><Headline text={headline} size={size} delay={2} /></div>
  </AbsoluteFill>
);

// Bingkai HP: isi (rekaman atau screenshot) di dalam jendela layar.
export const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const s = pop(f, 2, fps, 16);
  return (
    <div style={{ position: "absolute", left: (1080 - (SCREEN_W + 24)) / 2, top: 480, width: SCREEN_W + 24, borderRadius: 72, background: "#0b1f33", padding: 12, boxShadow: "0 40px 90px rgba(0,0,0,.45)", opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 700}px)` }}>
      <div style={{ position: "relative", width: SCREEN_W, height: WIN_H, borderRadius: 60, overflow: "hidden", background: "#fff" }}>{children}</div>
    </div>
  );
};

// Potongan rekaman: absFrom = frame awal di komposisi (bukan frame lokal adegan).
export const Clip: React.FC<{ absFrom: number; dur: number; startSec: number; rate?: number; shift?: number }> = ({ absFrom, dur, startSec, rate = 1, shift = 0 }) => (
  <Sequence from={absFrom} durationInFrames={dur}>
    <div style={{ position: "absolute", left: 0, top: -(CROP_TOP + shift) * k, width: SCREEN_W, height: VH * k }}>
      <OffthreadVideo src={staticFile("rec.mp4")} startFrom={Math.round(startSec * 30)} playbackRate={rate} muted style={{ width: "100%", height: "100%" }} />
    </div>
  </Sequence>
);

// Screenshot 739x1600 (status bar atas 88 px, bar Safari dari 1435 px ke bawah dibuang).
export const Shot: React.FC<{ file: string }> = ({ file }) => {
  const f = useLocal();
  const s = SCREEN_W / 739;
  const zoom = 1 + Math.min(f, 120) * 0.0006;
  return <img src={staticFile(file)} style={{ position: "absolute", left: 0, top: -88 * s, width: SCREEN_W, transform: `scale(${zoom})`, transformOrigin: "50% 20%" }} />;
};

export const Caption: React.FC<{ text: string; a: number; b: number }> = ({ text, a, b }) => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  if (f < a || f > b) return null;
  const s = pop(f, a, fps, 15);
  const out = Math.max(0, Math.min(1, (b - f) / 6));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1488, display: "flex", justifyContent: "center", opacity: Math.min(1, s * 1.5) * out, transform: `translateY(${(1 - s) * 30}px)` }}>
      <div style={{ background: C.amber, color: "#2b1a00", fontFamily: FONT, fontWeight: 800, fontSize: 44, padding: "18px 40px", borderRadius: 99, boxShadow: "0 12px 30px rgba(0,0,0,.3)" }}>{text}</div>
    </div>
  );
};

export const Note: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 1598, textAlign: "center", fontFamily: FONT, fontSize: 24, color: "rgba(255,255,255,.55)" }}>
    Tampilan aplikasi (data demo, wajah ilustrasi)
  </div>
);

export const V4: React.FC = () => (
  <FontGate>
    <Background theme="dark" />

    {/* 1. Login PIN */}
    <Scene from={0} dur={116}>
      <Top headline="Absen karyawan? *Cukup buka link.*" />
      <PhoneFrame><Clip absFrom={0} dur={116} startSec={0} /></PhoneFrame>
      <Caption text="Ketik 4 angka PIN" a={8} b={52} />
      <Caption text="Langsung masuk" a={58} b={112} />
      <Note />
    </Scene>

    {/* 2. Peta */}
    <Scene from={108} dur={196}>
      <Top headline="Peta lokasi *terbaca otomatis.*" />
      <PhoneFrame><Clip absFrom={108} dur={196} startSec={5.0} /></PhoneFrame>
      <Caption text="Titik biru = posisi karyawan" a={14} b={188} />
      <Note />
    </Scene>

    {/* 3. Selfie */}
    <Scene from={296} dur={112}>
      <Top headline="Ambil selfie. *Langsung Check In.*" size={86} />
      <PhoneFrame>
        <SelfieClips absFrom={296} />
      </PhoneFrame>
      <Caption text="Selfie dari browser HP" a={10} b={104} />
      <Note />
    </Scene>

    {/* 4. Beranda (screenshot) */}
    <Scene from={400} dur={112}>
      <Top headline="Check In *tercatat.*" />
      <PhoneFrame><Shot file="shot-home.jpg" /></PhoneFrame>
      <Caption text="Jam masuk langsung tampil" a={14} b={106} />
      <Note />
    </Scene>

    {/* 5. Menu Lainnya (screenshot) */}
    <Scene from={504} dur={124}>
      <Top headline="Slip gaji, cuti, lembur. *Semua di HP.*" size={84} />
      <PhoneFrame><Shot file="shot-menu.jpg" /></PhoneFrame>
      <Caption text="Portal Karyawan" a={14} b={116} />
      <Note />
    </Scene>

    {/* 6. Penutup */}
    <Scene from={620} dur={100}>
      <EndCard line="Absen selfie + Portal Karyawan. Tanpa install." />
    </Scene>
  </FontGate>
);

// Karakter ilustrasi (pengganti wajah asli) untuk adegan selfie.
const Person: React.FC<{ width: number }> = ({ width }) => (
  <svg width={width} viewBox="0 0 300 340" style={{ display: "block" }}>
    <path d="M20 340 C20 250 80 218 150 218 C220 218 280 250 280 340 Z" fill="#1f4a73" />
    <path d="M120 216 L150 262 L180 216 Z" fill="#fff" />
    <rect x="128" y="176" width="44" height="50" rx="16" fill="#e8b48f" />
    <ellipse cx="150" cy="130" rx="74" ry="82" fill="#f2c4a0" />
    <ellipse cx="76" cy="136" rx="11" ry="18" fill="#f2c4a0" />
    <ellipse cx="224" cy="136" rx="11" ry="18" fill="#f2c4a0" />
    <path d="M72 120 C66 52 120 28 156 30 C214 30 236 74 228 122 C214 92 188 78 150 80 C116 80 90 94 72 120 Z" fill="#2a1d17" />
    <ellipse cx="120" cy="136" rx="9" ry="11" fill="#2a1d17" />
    <ellipse cx="180" cy="136" rx="9" ry="11" fill="#2a1d17" />
    <circle cx="123" cy="132" r="3" fill="#fff" /><circle cx="183" cy="132" r="3" fill="#fff" />
    <path d="M118 170 C134 188 166 188 182 170" stroke="#9c4b3a" strokeWidth="7" strokeLinecap="round" fill="none" />
    <ellipse cx="102" cy="162" rx="12" ry="7" fill="#f0a08a" opacity=".55" />
    <ellipse cx="198" cy="162" rx="12" ry="7" fill="#f0a08a" opacity=".55" />
  </svg>
);

const Corners: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => {
  const s = { position: "absolute" as const, width: 54, height: 54, borderColor: "#5cf2a0", borderStyle: "solid", borderWidth: 0 };
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
      <div style={{ ...s, left: 0, top: 0, borderLeftWidth: 7, borderTopWidth: 7, borderTopLeftRadius: 18 }} />
      <div style={{ ...s, right: 0, top: 0, borderRightWidth: 7, borderTopWidth: 7, borderTopRightRadius: 18 }} />
      <div style={{ ...s, left: 0, bottom: 0, borderLeftWidth: 7, borderBottomWidth: 7, borderBottomLeftRadius: 18 }} />
      <div style={{ ...s, right: 0, bottom: 0, borderRightWidth: 7, borderBottomWidth: 7, borderBottomRightRadius: 18 }} />
    </div>
  );
};

// Dua potongan selfie (kamera + hasil di halaman Check In) dengan karakter di dalamnya.
export const SelfieClips: React.FC<{ absFrom: number }> = ({ absFrom }) => {
  const f = useLocal();
  const bob = Math.sin(f / 9) * 6;
  return (
    <>
      <Clip absFrom={absFrom} dur={52} startSec={13.0} shift={16} />
      <Sequence from={absFrom} durationInFrames={52}>
        <div style={{ position: "absolute", left: 110, top: 190 + bob, width: 340 }}><Person width={340} /></div>
        <Corners x={90} y={150} w={380} h={440} />
      </Sequence>
      <Clip absFrom={absFrom + 52} dur={60} startSec={18.8} rate={0.5} />
      <Sequence from={absFrom + 52} durationInFrames={60}>
        <div style={{ position: "absolute", left: 21, top: 626, width: 234, height: 332, overflow: "hidden", borderRadius: 18, background: "linear-gradient(#cfe0f2,#e9f2fb)" }}>
          <div style={{ position: "absolute", left: 22, top: 70, width: 190 }}><Person width={190} /></div>
        </div>
      </Sequence>
    </>
  );
};
