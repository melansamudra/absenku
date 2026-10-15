import React from "react";
import { Composition } from "remotion";
import { V1, V2, V3 } from "./Videos";
import { V4 } from "./Rekaman";
import { V5, V6, V7 } from "./Rekaman2";
import { V8, V9, V10 } from "./Rekaman3";

const base = { fps: 30, width: 1080, height: 1920, durationInFrames: 540 };
export const Root: React.FC = () => (
  <>
    <Composition id="V1-chat-tanggal-25" component={V1} {...base} />
    <Composition id="V2-nol-aplikasi" component={V2} {...base} />
    <Composition id="V3-kalender-gajian" component={V3} {...base} />
    <Composition id="V4-rekaman-absen" component={V4} {...base} durationInFrames={720} />
    <Composition id="V5-tiga-langkah" component={V5} {...base} durationInFrames={450} />
    <Composition id="V6-anti-titip" component={V6} {...base} durationInFrames={450} />
    <Composition id="V7-bayar-sekali" component={V7} {...base} durationInFrames={540} />
    <Composition id="V8-absen-kertas" component={V8} {...base} durationInFrames={450} />
    <Composition id="V9-slip-gaji-mandiri" component={V9} {...base} durationInFrames={480} />
    <Composition id="V10-tanpa-install" component={V10} {...base} durationInFrames={450} />
  </>
);
