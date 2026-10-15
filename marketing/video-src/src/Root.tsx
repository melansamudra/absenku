import React from "react";
import { Composition } from "remotion";
import { V1, V2, V3 } from "./Videos";

const base = { fps: 30, width: 1080, height: 1920, durationInFrames: 540 };
export const Root: React.FC = () => (
  <>
    <Composition id="V1-chat-tanggal-25" component={V1} {...base} />
    <Composition id="V2-nol-aplikasi" component={V2} {...base} />
    <Composition id="V3-kalender-gajian" component={V3} {...base} />
  </>
);
