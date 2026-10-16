import React, { useEffect, useState } from "react";
import {
  AbsoluteFill, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
  delayRender, continueRender,
} from "remotion";

export const C = {
  b50: "#f1f7fd", b100: "#e3effc", b200: "#c4d8ee", b600: "#3b6a97", b700: "#2b5a85", b800: "#1f4a73", b900: "#17436a",
  amber: "#f5a524", ink: "#10243a", ok: "#1f9d6b", neg: "#c2410c",
};
export const FONT = "Inter, sans-serif";

// Safe zone Reels/Story: atas ~190px dan bawah ~320px jangan diisi teks penting.
export const SAFE_TOP = 190;
export const SAFE_BOTTOM = 330;

export const FontGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [handle] = useState(() => delayRender("font"));
  useEffect(() => {
    Promise.all(
      [400, 600, 800].map((w) =>
        new FontFace("Inter", `url(${staticFile(`inter-latin-${w}-normal.woff2`)})`, { weight: String(w) })
          .load()
          .then((f) => (document.fonts.add(f), f)),
      ),
    ).then(() => continueRender(handle));
  }, [handle]);
  return <>{children}</>;
};

export const pop = (frame: number, start: number, fps: number, damping = 14) =>
  spring({ frame: frame - start, fps, config: { damping, stiffness: 140, mass: 0.8 } });

export const fade = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// Adegan: fade in 8 frame, fade out 8 frame, frame lokal mulai dari 0.
export const Scene: React.FC<{ from: number; dur: number; children: React.ReactNode }> = ({ from, dur, children }) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  if (local < -1 || local > dur + 1) return null;
  const o = interpolate(local, [0, 8, dur - 8, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <LocalFrame offset={from}>{children}</LocalFrame>
    </AbsoluteFill>
  );
};
const Ctx = React.createContext(0);
export const useLocal = () => useCurrentFrame() - React.useContext(Ctx);
const LocalFrame: React.FC<{ offset: number; children: React.ReactNode }> = ({ offset, children }) => (
  <Ctx.Provider value={offset}>{children}</Ctx.Provider>
);

export const Background: React.FC<{ theme?: "dark" | "light" | "amber" }> = ({ theme = "dark" }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 540], [0, 120]);
  const bg =
    theme === "dark"
      ? `radial-gradient(1100px 900px at ${95 - drift / 6}% -5%, #3b6a97 0%, transparent 60%), linear-gradient(160deg, ${C.b900}, #0f2f4d)`
      : theme === "light"
        ? `radial-gradient(1100px 900px at 100% -10%, #cfe3f6 0%, transparent 60%), linear-gradient(160deg, #fbfdff, #e3effc)`
        : `radial-gradient(900px 700px at 100% -10%, #ffd27a 0%, transparent 60%), linear-gradient(160deg, #f7b538, #f29a0c)`;
  return <AbsoluteFill style={{ background: bg }} />;
};

export const Logo: React.FC<{ dark?: boolean; size?: number }> = ({ dark = true, size = 1 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 * size, fontFamily: FONT, fontWeight: 800, fontSize: 38 * size, letterSpacing: -0.5, color: dark ? "#fff" : C.ink }}>
    <div style={{ width: 52 * size, height: 52 * size, borderRadius: 15 * size, background: dark ? "#fff" : C.b700, color: dark ? C.b700 : "#fff", display: "grid", placeItems: "center" }}>
      <Icon name="check" size={32 * size} />
    </div>
    HrCash
  </div>
);

export const Icon: React.FC<{ name: "check" | "x" | "user" | "cam" | "lock" | "doc" | "clock" | "wallet" | "cal" | "arrow"; size?: number; color?: string }> = ({ name, size = 32, color = "currentColor" }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 3.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "check": return <svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
    case "x": return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case "arrow": return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    case "user": return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><circle cx="12" cy="8" r="4.5" /><path d="M3.5 21c.6-4.6 4-7 8.5-7s7.9 2.4 8.5 7z" /></svg>;
    case "cam": return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M9 4l-1.5 2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-2.5L15 4H9zm3 4.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" /></svg>;
    case "lock": return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M6 10V8a6 6 0 1112 0v2h1a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V11a1 1 0 011-1h1zm2 0h8V8a4 4 0 10-8 0v2z" /></svg>;
    case "doc": return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M6 2h8l5 5v14a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1zm7 1.5V8h4.5L13 3.5zM8 12h8v1.8H8zm0 3.5h8v1.8H8z" /></svg>;
    case "clock": return <svg {...p} strokeWidth={2.6}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>;
    case "wallet": return <svg {...p} strokeWidth={2.4}><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M16 12.5h2.5M3 9.5h18" /></svg>;
    case "cal": return <svg {...p} strokeWidth={2.4}><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></svg>;
  }
};

// Judul besar dengan bagian <em> berwarna: pakai tanda *kata* untuk menyorot.
export const Headline: React.FC<{ text: string; size?: number; color?: string; em?: string; delay?: number; center?: boolean }> = ({ text, size = 96, color = "#fff", em = C.amber, delay = 0, center }) => {
  const frame = useLocal();
  const { fps } = useVideoConfig();
  const parts = text.split("*");
  const words: { w: string; hi: boolean }[] = [];
  parts.forEach((seg, i) => seg.split(" ").filter(Boolean).forEach((w) => words.push({ w, hi: i % 2 === 1 })));
  return (
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.04, letterSpacing: -size / 45, color, textAlign: center ? "center" : "left", display: "flex", flexWrap: "wrap", gap: `0 ${size * 0.24}px`, justifyContent: center ? "center" : "flex-start" }}>
      {words.map((x, i) => {
        const s = pop(frame, delay + i * 3, fps, 18);
        return (
          <span key={i} style={{ display: "inline-block", color: x.hi ? em : color, opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 40}px)` }}>
            {x.w}
          </span>
        );
      })}
    </div>
  );
};

export const Phone: React.FC<{ tiles: { label: string; value: string; chip?: string }[]; start?: number; scale?: number }> = ({ tiles, start = 0, scale = 1 }) => {
  const frame = useLocal();
  const { fps } = useVideoConfig();
  const enter = pop(frame, start, fps, 16);
  return (
    <div style={{ width: 560 * scale, background: "#fff", borderRadius: 66 * scale, border: `${12 * scale}px solid #0b1f33`, padding: `${40 * scale}px ${34 * scale}px ${44 * scale}px`, boxShadow: "0 40px 90px rgba(0,0,0,.4)", transform: `translateY(${(1 - enter) * 900}px) rotate(${-3 + (1 - enter) * 8}deg)`, fontFamily: FONT, color: C.ink }}>
      <div style={{ padding: `4px 6px ${16 * scale}px` }}>
        <div style={{ color: "#5f7690", fontSize: 28 * scale }}>Portal Karyawan</div>
        <div style={{ fontWeight: 800, fontSize: 42 * scale, letterSpacing: -0.5 }}>Halo, Sari</div>
      </div>
      {tiles.map((t, i) => {
        const s = pop(frame, start + 14 + i * 14, fps, 16);
        return (
          <div key={i} style={{ background: C.b50, borderRadius: 28 * scale, padding: `${22 * scale}px ${28 * scale}px`, marginTop: 14 * scale, opacity: Math.min(1, s * 1.5), transform: `scale(${0.86 + s * 0.14})` }}>
            <div style={{ color: "#5f7690", fontSize: 26 * scale }}>{t.label}</div>
            <div style={{ fontWeight: 800, fontSize: 44 * scale, letterSpacing: -1, color: C.b700 }}>{t.value}</div>
            {t.chip && <div style={{ display: "inline-block", marginTop: 10, background: "#dcf5ea", color: C.ok, fontWeight: 600, fontSize: 22 * scale, padding: "5px 16px", borderRadius: 99 }}>{t.chip}</div>}
          </div>
        );
      })}
    </div>
  );
};

export const Chip: React.FC<{ text: string; start: number; x: number; y: number }> = ({ text, start, x, y }) => {
  const frame = useLocal();
  const { fps } = useVideoConfig();
  const s = pop(frame, start, fps, 12);
  const bob = Math.sin((frame + x) / 14) * 6;
  return (
    <div style={{ position: "absolute", left: x, top: y + bob, display: "flex", alignItems: "center", gap: 12, background: C.b800, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 36, padding: "18px 30px", borderRadius: 99, boxShadow: "0 16px 36px rgba(0,0,0,.35)", opacity: Math.min(1, s * 1.5), transform: `scale(${0.6 + s * 0.4})` }}>
      <span style={{ width: 38, height: 38, borderRadius: "50%", background: C.amber, color: "#2b1a00", display: "grid", placeItems: "center" }}><Icon name="check" size={20} /></span>
      {text}
    </div>
  );
};

export const EndCard: React.FC<{ line: string; sub?: string; solid?: boolean; noPrice?: boolean; plain?: boolean; cta?: string; price?: string }> = ({ line, solid = false, price = "Rp289.000", noPrice = false, plain = false, cta = "Hubungi kami di", sub = "Tanpa langganan bulanan. Tanpa biaya per karyawan." }) => {
  const frame = useLocal();
  const { fps } = useVideoConfig();
  const a = pop(frame, 4, fps), b = pop(frame, 16, fps), c = pop(frame, 30, fps);
  const pulse = 1 + Math.sin(frame / 6) * 0.025;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: SAFE_TOP, paddingBottom: SAFE_BOTTOM, fontFamily: FONT }}>
      {solid && <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.b900}, ${C.b700})` }} />}
      <div style={{ transform: `scale(${0.7 + a * 0.3})`, opacity: a }}><Logo size={1.5} /></div>
      <div style={{ marginTop: 50, textAlign: "center", color: "#fff", fontWeight: 800, fontSize: 70, lineHeight: 1.08, letterSpacing: -2, padding: "0 90px", opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}>{line}</div>
      {!noPrice && (      <div style={{ marginTop: 56, background: C.amber, color: "#2b1a00", borderRadius: 36, padding: "30px 60px", textAlign: "center", opacity: c, transform: `scale(${(0.8 + c * 0.2) * pulse})` }}>
        <div style={{ fontWeight: 800, fontSize: 112, letterSpacing: -4, lineHeight: 1 }}>{price}</div>
        <div style={{ fontWeight: 600, fontSize: 40, marginTop: 8 }}>sekali bayar</div>
      </div>)}
      {sub !== "" && <div style={{ marginTop: noPrice ? 40 : 34, position: "relative", zIndex: 1, color: C.b200, fontSize: 36, textAlign: "center", padding: "0 100px", opacity: fade(frame, 30, 44), fontWeight: 600 }}>{sub}</div>}
      {!plain && <div style={{ marginTop: 44, position: "relative", zIndex: 1, background: "#fff", color: C.b800, borderRadius: 34, padding: "26px 56px", textAlign: "center", opacity: fade(frame, 44, 58), transform: `scale(${pulse})` }}>
        <div style={{ fontWeight: 600, fontSize: 38 }}>{cta}</div>
        <div style={{ fontWeight: 800, fontSize: 76, letterSpacing: -1, lineHeight: 1.1, marginTop: 4 }}>081234556757</div>
      </div>}
    </AbsoluteFill>
  );
};

export const count = (frame: number, a: number, b: number, to: number) =>
  Math.round(interpolate(frame, [a, b], [0, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
export const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");
