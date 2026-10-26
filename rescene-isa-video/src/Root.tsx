import React from 'react';
import {Composition} from 'remotion';
import '@fontsource/noto-sans-kr/400.css';
import '@fontsource/noto-sans-kr/700.css';
import '@fontsource/noto-sans-kr/900.css';
import '@fontsource/noto-serif-kr/600.css';
import '@fontsource/noto-serif-kr/900.css';
import {Documentary} from './Documentary';
import {FPS, totalFrames} from './timeline';

export const Root: React.FC = () => (
  <Composition
    id="RescenIsa"
    component={Documentary}
    durationInFrames={totalFrames}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
