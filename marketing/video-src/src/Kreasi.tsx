import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Background, C, EndCard, FONT, FontGate, Headline, Icon, Logo, Phone, SAFE_BOTTOM, SAFE_TOP, Scene, count, pop, useLocal } from "./kit";
import { Address, Bubble, Pill, Slip, Step, Tick } from "./Videos";
import { Versus } from "./Animasi";
import { Caption, Clip, Note, PhoneFrame, SelfieClips, Top as RecTop } from "./Rekaman";

export type Theme = "dark" | "amber" | "light";
export type End = "harga" | "bersih";
type Tile = { label: string; value: string; chip?: string };
type S =
  | { k: "chat"; head: string; msgs: { who?: string; text: string; time: string; out?: boolean }[] }
  | { k: "ticks"; head: string; items: [string, string][] }
  | { k: "cross"; head: string; bad: string[]; good: string }
  | { k: "big"; head: string; value?: number; text?: string; suffix?: string; label: string; sub?: string }
  | { k: "steps"; head: string; items: { icon: "user" | "cam" | "check"; label: string }[] }
  | { k: "phone"; head: string; tiles?: Tile[] }
  | { k: "slip"; head: string }
  | { k: "versus"; head: string; tagOld: string; old: [string, string]; tagNow: string; now: [string, string]; strike?: boolean }
  | { k: "chips"; head: string; items: string[]; note?: string }
  | { k: "cards"; head: string; items: [string, string][] }
  | { k: "link"; head: string; pill: string }
  | { k: "formula"; head: string; big: string; rows: [string, string][]; note?: string }
  | { k: "rec"; head: string; part: "pin" | "map" | "selfie"; cap: string };
export type Cfg = { id: string; theme: Theme; end: End; line: string; scenes: S[] };

const HOME: Tile[] = [{ label: "Sisa cuti", value: "8 hari" }, { label: "Slip gaji terbaru", value: "Oktober 2026", chip: "Siap dilihat" }, { label: "Sisa kasbon", value: "Rp300.000" }];
const dark = (t: Theme) => t === "dark";

const Head: React.FC<{ text: string; theme: Theme }> = ({ text, theme }) => (
  <AbsoluteFill style={{ padding: `${SAFE_TOP}px 72px 0` }}>
    <Logo dark={dark(theme)} />
    <div style={{ marginTop: 50 }}>
      <Headline text={text} size={text.length > 46 ? 76 : 86} color={dark(theme) ? "#fff" : C.ink} em={dark(theme) ? C.amber : C.b900} delay={2} />
    </div>
  </AbsoluteFill>
);
const Mid: React.FC<{ pt?: number; gap?: number; center?: boolean; children: React.ReactNode }> = ({ pt = 640, gap = 24, center, children }) => (
  <AbsoluteFill style={{ padding: `${pt}px 72px ${SAFE_BOTTOM - 40}px`, gap, justifyContent: center ? "center" : "flex-start" }}>{children}</AbsoluteFill>
);

const XRow: React.FC<{ text: string; start: number; good?: boolean }> = ({ text, start, good }) => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps, 15);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26, background: good ? C.ink : "#fff", color: good ? "#fff" : C.ink, borderRadius: 34, padding: "28px 34px", boxShadow: "0 20px 44px rgba(0,0,0,.28)", fontFamily: FONT, fontWeight: 800, fontSize: 46, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 220}px)` }}>
      <div style={{ width: 70, height: 70, borderRadius: "50%", background: good ? C.amber : "#fde7df", color: good ? "#2b1a00" : C.neg, display: "grid", placeItems: "center", flex: "none" }}><Icon name={good ? "check" : "x"} size={40} /></div>
      {text}
    </div>
  );
};
const CardRow: React.FC<{ tag: string; text: string; start: number }> = ({ tag, text, start }) => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps, 15);
  return (
    <div style={{ background: "#fff", color: C.ink, borderRadius: 34, padding: "26px 36px", boxShadow: "0 20px 44px rgba(0,0,0,.28)", fontFamily: FONT, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 90}px)` }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.b600, letterSpacing: 2, textTransform: "uppercase" }}>{tag}</div>
      <div style={{ fontSize: 50, fontWeight: 800, letterSpacing: -1, lineHeight: 1.12, marginTop: 4 }}>{text}</div>
    </div>
  );
};
const Big: React.FC<{ value?: number; text?: string; suffix?: string; label: string; sub?: string; theme: Theme }> = ({ value, text, suffix, label, sub, theme }) => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const s = pop(f, 10, fps, 12);
  const fg = dark(theme) ? "#fff" : C.ink;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 560, opacity: Math.min(1, s * 1.5), transform: `scale(${0.7 + s * 0.3})`, fontFamily: FONT, color: fg, textAlign: "center" }}>
      <div style={{ fontWeight: 800, fontSize: (text ?? "").length > 5 ? 250 : 340, letterSpacing: -10, lineHeight: 0.95, whiteSpace: "nowrap", color: dark(theme) ? C.amber : C.b900 }}>{text ?? count(f, 12, 70, value ?? 0)}{suffix && <span style={{ fontSize: 120, letterSpacing: -3 }}>{suffix}</span>}</div>
      <div style={{ fontWeight: 800, fontSize: 64, marginTop: 20, padding: "0 90px", lineHeight: 1.1 }}>{label}</div>
      {sub && <div style={{ fontWeight: 600, fontSize: 40, marginTop: 24, padding: "0 110px", opacity: 0.8, lineHeight: 1.25 }}>{sub}</div>}
    </AbsoluteFill>
  );
};
const ChipRow: React.FC<{ items: string[]; note?: string }> = ({ items, note }) => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ padding: `600px 72px ${SAFE_BOTTOM}px`, justifyContent: "center" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 22, justifyContent: "center" }}>
        {items.map((t, i) => {
          const s = pop(f, 16 + i * 10, fps, 14);
          return <div key={i} style={{ background: "#fff", color: C.ink, fontFamily: FONT, fontWeight: 800, fontSize: 54, padding: "22px 44px", borderRadius: 99, boxShadow: "0 16px 36px rgba(0,0,0,.25)", opacity: Math.min(1, s * 1.5), transform: `scale(${0.6 + s * 0.4})` }}>{t}</div>;
        })}
      </div>
      {note && <div style={{ marginTop: 50, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 42, opacity: 0.85 }}>{note}</div>}
    </AbsoluteFill>
  );
};

const dur = (s: S) => (s.k === "rec" ? (s.part === "pin" ? 118 : s.part === "map" ? 120 : 112) : s.k === "ticks" || s.k === "chat" || s.k === "cross" ? 150 : 140);

const Body: React.FC<{ s: S; theme: Theme; from: number }> = ({ s, theme, from }) => {
  switch (s.k) {
    case "chat":
      return <Mid pt={600} gap={26}>{s.msgs.map((m, i) => <Bubble key={i} who={m.who} text={m.text} time={m.time} out={m.out} start={30 + i * 32} />)}</Mid>;
    case "ticks":
      return <Mid pt={620} gap={22}>{s.items.map(([a, b], i) => <Tick key={i} title={a} sub={b} start={26 + i * 24} />)}</Mid>;
    case "cross":
      return <Mid pt={620} gap={24}>{s.bad.map((t, i) => <XRow key={i} text={t} start={24 + i * 22} />)}<XRow good text={s.good} start={24 + s.bad.length * 22 + 14} /></Mid>;
    case "cards":
      return <Mid pt={620} gap={24}>{s.items.map(([a, b], i) => <CardRow key={i} tag={a} text={b} start={26 + i * 26} />)}</Mid>;
    case "steps":
      return <Mid pt={640} gap={26}>{s.items.map((it, i) => <Step key={i} n={i + 1} icon={it.icon} label={it.label} start={26 + i * 30} />)}</Mid>;
    case "phone":
      return <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 640 }}><Phone start={4} scale={0.85} tiles={s.tiles ?? HOME} /></AbsoluteFill>;
    case "slip":
      return <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 640 }}><Slip /></AbsoluteFill>;
    case "versus":
      return <Mid pt={620}><Versus old={s.old[0]} olds={s.old[1]} now={s.now[0]} nows={s.now[1]} tagOld={s.tagOld} tagNow={s.tagNow} strike={s.strike ?? false} /></Mid>;
    case "chips":
      return <ChipRow items={s.items} note={s.note} />;
    case "big":
      return <Big value={s.value} text={s.text} suffix={s.suffix} label={s.label} sub={s.sub} theme={theme} />;
    case "formula":
      return (
        <AbsoluteFill style={{ padding: `620px 72px ${SAFE_BOTTOM - 40}px`, justifyContent: "flex-start" }}>
          <div style={{ background: "#fff", color: C.ink, borderRadius: 44, padding: "40px 46px", boxShadow: "0 24px 54px rgba(0,0,0,.3)", fontFamily: FONT }}>
            <div style={{ fontWeight: 800, fontSize: s.big.length > 6 ? 118 : 150, letterSpacing: -5, lineHeight: 1, color: C.b900 }}>{s.big}</div>
            {s.rows.map(([a, b], i) => (
              <div key={i} style={{ borderTop: "3px solid #e6eef6", marginTop: 24, paddingTop: 24 }}>
                <div style={{ fontWeight: 800, fontSize: 44 }}>{a}</div>
                <div style={{ fontWeight: 600, fontSize: 40, color: "#4a6580", marginTop: 4 }}>{b}</div>
              </div>
            ))}
          </div>
          {s.note && <div style={{ marginTop: 34, fontFamily: FONT, fontWeight: 600, fontSize: 34, lineHeight: 1.3, color: dark(theme) ? C.b200 : "#4a6580" }}>{s.note}</div>}
        </AbsoluteFill>
      );
    case "link":
      return (<><Mid pt={640}><Address /></Mid><AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: SAFE_BOTTOM + 150 }}><Pill text={s.pill} start={40} /></AbsoluteFill></>);
    default:
      return null;
  }
};

const RecScene: React.FC<{ s: Extract<S, { k: "rec" }>; from: number; d: number }> = ({ s, from, d }) => (
  <>
    <RecTop headline={s.head} size={s.head.length > 34 ? 82 : 90} />
    <PhoneFrame>
      {s.part === "pin" && <Clip absFrom={from} dur={d} startSec={0} />}
      {s.part === "map" && <Clip absFrom={from} dur={d} startSec={5.0} />}
      {s.part === "selfie" && <SelfieClips absFrom={from} />}
    </PhoneFrame>
    <Caption text={s.cap} a={10} b={d - 8} />
    <Note />
  </>
);

export const makeVideo = (cfg: Cfg, minFrames = 0): { C: React.FC; frames: number } => {
  const OV = 6;
  const starts: number[] = [];
  let t = 0;
  cfg.scenes.forEach((s) => { starts.push(t); t += dur(s) - OV; });
  const endFrom = t;
  const endD = Math.max(cfg.end === "harga" ? 150 : 110, minFrames - endFrom);
  const frames = endFrom + endD;
  const Comp: React.FC = () => (
    <FontGate>
      <Background theme={cfg.theme} />
      {cfg.scenes.map((s, i) => {
        const d = dur(s);
        return (
          <Scene key={i} from={starts[i]} dur={d}>
            {s.k === "rec" ? <RecScene s={s} from={starts[i]} d={d} /> : (<><Head text={s.head} theme={cfg.theme} /><Body s={s} theme={cfg.theme} from={starts[i]} /></>)}
          </Scene>
        );
      })}
      <Scene from={endFrom} dur={endD}>
        {cfg.end === "harga" ? <EndCard price="Rp349.000" solid={cfg.theme !== "dark"} line={cfg.line} /> : <EndCard noPrice plain solid={cfg.theme !== "dark"} sub="" line={cfg.line} />}
      </Scene>
    </FontGate>
  );
  return { C: Comp, frames };
};
