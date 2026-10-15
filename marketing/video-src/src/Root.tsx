import React from "react";
import { Composition } from "remotion";
import { V1, V2, V3 } from "./Videos";
import { K04, K05, K06, K07, K08, K09, K10 } from "./Animasi";
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
    <Composition id="K01-chat-tanggal-25-wa" component={V1 as React.FC<any>} {...base} durationInFrames={540} defaultProps={{ end: "wa" }} />
    <Composition id="K01-chat-tanggal-25-bersih" component={V1 as React.FC<any>} {...base} durationInFrames={540} defaultProps={{ end: "bersih" }} />
    <Composition id="K02-nol-aplikasi-wa" component={V2 as React.FC<any>} {...base} durationInFrames={540} defaultProps={{ end: "wa" }} />
    <Composition id="K02-nol-aplikasi-bersih" component={V2 as React.FC<any>} {...base} durationInFrames={540} defaultProps={{ end: "bersih" }} />
    <Composition id="K03-kalender-gajian-wa" component={V3 as React.FC<any>} {...base} durationInFrames={540} defaultProps={{ end: "wa" }} />
    <Composition id="K03-kalender-gajian-bersih" component={V3 as React.FC<any>} {...base} durationInFrames={540} defaultProps={{ end: "bersih" }} />
    <Composition id="K04-titip-absen-wa" component={K04 as React.FC<any>} {...base} durationInFrames={480} defaultProps={{ end: "wa" }} />
    <Composition id="K04-titip-absen-bersih" component={K04 as React.FC<any>} {...base} durationInFrames={480} defaultProps={{ end: "bersih" }} />
    <Composition id="K05-rekap-otomatis-wa" component={K05 as React.FC<any>} {...base} durationInFrames={480} defaultProps={{ end: "wa" }} />
    <Composition id="K05-rekap-otomatis-bersih" component={K05 as React.FC<any>} {...base} durationInFrames={480} defaultProps={{ end: "bersih" }} />
    <Composition id="K06-gaji-dikomplain-wa" component={K06 as React.FC<any>} {...base} durationInFrames={540} defaultProps={{ end: "wa" }} />
    <Composition id="K06-gaji-dikomplain-bersih" component={K06 as React.FC<any>} {...base} durationInFrames={540} defaultProps={{ end: "bersih" }} />
    <Composition id="K07-cuti-lembur-wa" component={K07 as React.FC<any>} {...base} durationInFrames={540} defaultProps={{ end: "wa" }} />
    <Composition id="K07-cuti-lembur-bersih" component={K07 as React.FC<any>} {...base} durationInFrames={540} defaultProps={{ end: "bersih" }} />
    <Composition id="K08-kasbon-wa" component={K08 as React.FC<any>} {...base} durationInFrames={540} defaultProps={{ end: "wa" }} />
    <Composition id="K08-kasbon-bersih" component={K08 as React.FC<any>} {...base} durationInFrames={540} defaultProps={{ end: "bersih" }} />
    <Composition id="K09-buku-absen-wa" component={K09 as React.FC<any>} {...base} durationInFrames={540} defaultProps={{ end: "wa" }} />
    <Composition id="K09-buku-absen-bersih" component={K09 as React.FC<any>} {...base} durationInFrames={540} defaultProps={{ end: "bersih" }} />
    <Composition id="K10-hitung-gaji-wa" component={K10 as React.FC<any>} {...base} durationInFrames={540} defaultProps={{ end: "wa" }} />
    <Composition id="K10-hitung-gaji-bersih" component={K10 as React.FC<any>} {...base} durationInFrames={540} defaultProps={{ end: "bersih" }} />
  </>
);
