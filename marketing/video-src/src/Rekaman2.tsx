import React from "react";
import { Background, EndCard, FontGate, Scene } from "./kit";
import { Caption, Clip, Note, PhoneFrame, Shot, Top } from "./Rekaman";

// V5: "3 langkah" (15 dtk)
export const V5: React.FC = () => (
  <FontGate>
    <Background theme="dark" />
    <Scene from={0} dur={118}>
      <Top headline="Absen cuma *3 langkah.*" />
      <PhoneFrame><Clip absFrom={0} dur={118} startSec={0} /></PhoneFrame>
      <Caption text="1. Ketik PIN" a={8} b={110} />
      <Note />
    </Scene>
    <Scene from={110} dur={112}>
      <Top headline="Absen cuma *3 langkah.*" />
      <PhoneFrame><Clip absFrom={110} dur={112} startSec={5.0} /></PhoneFrame>
      <Caption text="2. Lokasi terbaca" a={8} b={104} />
      <Note />
    </Scene>
    <Scene from={214} dur={112}>
      <Top headline="Absen cuma *3 langkah.*" />
      <PhoneFrame>
        <Clip absFrom={214} dur={52} startSec={13.0} shift={16} />
        <Clip absFrom={266} dur={60} startSec={18.8} rate={0.75} />
      </PhoneFrame>
      <Caption text="3. Selfie, selesai" a={8} b={104} />
      <Note />
    </Scene>
    <Scene from={318} dur={132}>
      <EndCard line="3 langkah. Tanpa install aplikasi." />
    </Scene>
  </FontGate>
);

// V6: anti titip absen (15 dtk)
export const V6: React.FC = () => (
  <FontGate>
    <Background theme="dark" />
    <Scene from={0} dur={122}>
      <Top headline="Titip absen? *Susah.*" />
      <PhoneFrame><Clip absFrom={0} dur={122} startSec={5.0} /></PhoneFrame>
      <Caption text="Lokasi dicek otomatis" a={10} b={114} />
      <Note />
    </Scene>
    <Scene from={114} dur={112}>
      <Top headline="Wajib *selfie* di tempat." />
      <PhoneFrame>
        <Clip absFrom={114} dur={52} startSec={13.0} shift={16} />
        <Clip absFrom={166} dur={60} startSec={18.8} rate={0.75} />
      </PhoneFrame>
      <Caption text="Foto wajah tiap absen" a={10} b={104} />
      <Note />
    </Scene>
    <Scene from={218} dur={112}>
      <Top headline="Plus *PIN pribadi.*" />
      <PhoneFrame><Clip absFrom={218} dur={112} startSec={0} /></PhoneFrame>
      <Caption text="Lokasi + selfie + PIN" a={10} b={104} />
      <Note />
    </Scene>
    <Scene from={322} dur={128}>
      <EndCard line="Absen jujur, tanpa ribet." />
    </Scene>
  </FontGate>
);

// V7: bayar sekali (18 dtk)
export const V7: React.FC = () => (
  <FontGate>
    <Background theme="dark" />
    <Scene from={0} dur={130}>
      <Top headline="Aplikasi HR *tanpa langganan.*" size={86} />
      <PhoneFrame><Shot file="shot-menu.jpg" /></PhoneFrame>
      <Caption text="Slip gaji, cuti, lembur" a={14} b={122} />
      <Note />
    </Scene>
    <Scene from={122} dur={116}>
      <Top headline="Absen karyawan *tercatat.*" />
      <PhoneFrame><Shot file="shot-home.jpg" /></PhoneFrame>
      <Caption text="Jam masuk langsung tampil" a={10} b={108} />
      <Note />
    </Scene>
    <Scene from={230} dur={120}>
      <Top headline="Lokasi *terbaca otomatis.*" />
      <PhoneFrame><Clip absFrom={230} dur={120} startSec={5.0} /></PhoneFrame>
      <Caption text="Cukup buka link di HP" a={10} b={112} />
      <Note />
    </Scene>
    <Scene from={342} dur={198}>
      <EndCard line="Bayar sekali. Pakai selamanya." />
    </Scene>
  </FontGate>
);
