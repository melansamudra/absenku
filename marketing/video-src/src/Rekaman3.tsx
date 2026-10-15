import React from "react";
import { Background, EndCard, FontGate, Scene } from "./kit";
import { Caption, Clip, Note, PhoneFrame, Shot, Top } from "./Rekaman";

const SUB = "Coba dulu lewat demo, tanpa komitmen.";

// V8: hook pertanyaan, absen kertas
export const V8: React.FC = () => (
  <FontGate>
    <Background theme="dark" />
    <Scene from={0} dur={122}>
      <Top headline="Masih absen *pakai kertas?*" />
      <PhoneFrame><Clip absFrom={0} dur={122} startSec={5.0} /></PhoneFrame>
      <Caption text="Ganti dengan absen digital" a={10} b={114} />
      <Note />
    </Scene>
    <Scene from={114} dur={112}>
      <Top headline="Selfie + lokasi, *otomatis rapi.*" size={84} />
      <PhoneFrame>
        <Clip absFrom={114} dur={52} startSec={13.0} shift={16} />
        <Clip absFrom={166} dur={60} startSec={18.8} rate={0.75} />
      </PhoneFrame>
      <Caption text="Tak ada lagi data hilang" a={10} b={104} />
      <Note />
    </Scene>
    <Scene from={218} dur={112}>
      <Top headline="Jam masuk *langsung tercatat.*" size={86} />
      <PhoneFrame><Shot file="shot-home.jpg" /></PhoneFrame>
      <Caption text="Rekap kehadiran siap pakai" a={10} b={104} />
      <Note />
    </Scene>
    <Scene from={322} dur={128}>
      <EndCard noPrice solid line="Absen digital. Rapi dan jujur." sub={SUB} cta="Lihat demo" />
    </Scene>
  </FontGate>
);

// V9: slip gaji / portal karyawan
export const V9: React.FC = () => (
  <FontGate>
    <Background theme="dark" />
    <Scene from={0} dur={130}>
      <Top headline="Karyawan tanya slip gaji *terus?*" size={82} />
      <PhoneFrame><Shot file="shot-menu.jpg" /></PhoneFrame>
      <Caption text="Slip gaji dicek sendiri" a={14} b={122} />
      <Note />
    </Scene>
    <Scene from={122} dur={116}>
      <Top headline="Cuti & lembur *ajukan dari HP.*" size={84} />
      <PhoneFrame><Shot file="shot-menu.jpg" /></PhoneFrame>
      <Caption text="Portal Karyawan" a={10} b={108} />
      <Note />
    </Scene>
    <Scene from={230} dur={120}>
      <Top headline="Masuk cukup *4 angka PIN.*" size={86} />
      <PhoneFrame><Clip absFrom={230} dur={120} startSec={0} /></PhoneFrame>
      <Caption text="Tanpa install aplikasi" a={10} b={112} />
      <Note />
    </Scene>
    <Scene from={342} dur={138}>
      <EndCard noPrice solid line="HRD lebih tenang. Karyawan mandiri." sub={SUB} cta="Lihat demo" />
    </Scene>
  </FontGate>
);

// V10: tanpa install
export const V10: React.FC = () => (
  <FontGate>
    <Background theme="dark" />
    <Scene from={0} dur={120}>
      <Top headline="Absen *tanpa install* apa-apa." size={88} />
      <PhoneFrame><Clip absFrom={0} dur={120} startSec={0} /></PhoneFrame>
      <Caption text="1. Buka link" a={8} b={112} />
      <Note />
    </Scene>
    <Scene from={112} dur={112}>
      <Top headline="Absen *tanpa install* apa-apa." size={88} />
      <PhoneFrame><Clip absFrom={112} dur={112} startSec={5.0} /></PhoneFrame>
      <Caption text="2. Lokasi terbaca" a={8} b={104} />
      <Note />
    </Scene>
    <Scene from={216} dur={112}>
      <Top headline="Absen *tanpa install* apa-apa." size={88} />
      <PhoneFrame>
        <Clip absFrom={216} dur={52} startSec={13.0} shift={16} />
        <Clip absFrom={268} dur={60} startSec={18.8} rate={0.75} />
      </PhoneFrame>
      <Caption text="3. Selfie, selesai" a={8} b={104} />
      <Note />
    </Scene>
    <Scene from={320} dur={130}>
      <EndCard noPrice solid line="Buka link. Absen. Selesai." sub="Jalan di semua HP, tanpa Play Store." cta="Lihat demo" />
    </Scene>
  </FontGate>
);
