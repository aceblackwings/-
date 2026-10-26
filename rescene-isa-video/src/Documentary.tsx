import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile} from 'remotion';
import {Fade} from './components/ui';
import {Subtitles} from './components/Subtitles';
import {VISUALS} from './scenes/Visuals';
import {hasAsset, NARRATION_LEAD, timeline, totalFrames, FPS} from './timeline';
import {C} from './theme';

const XFADE = 12;

// 같은 bgm 큐가 이어지는 구간을 하나의 트랙으로 묶는다
const bgmBlocks = timeline.reduce<{cue: string; from: number; to: number}[]>((acc, s) => {
  const last = acc[acc.length - 1];
  if (last && last.cue === s.bgm) last.to = s.from + s.duration;
  else acc.push({cue: s.bgm, from: s.from, to: s.from + s.duration});
  return acc;
}, []);

const findBgm = (cue: string) => ['mp3', 'wav'].map((e) => `bgm/${cue}.${e}`).find(hasAsset);
const findNarr = (id: string) => ['mp3', 'wav'].map((e) => `narration/${id}.${e}`).find(hasAsset);

export const Documentary: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    {timeline.map((s) => {
      const V = VISUALS[s.visual];
      const narr = findNarr(s.id);
      const span = s.narrationSec || Math.max(1, s.duration / FPS - 2);
      return (
        <Sequence key={s.id} from={s.from} durationInFrames={s.duration + XFADE} name={`${s.id} ${s.title}`}>
          <Fade dur={s.duration + XFADE} inF={XFADE} outF={XFADE}>
            <V dur={s.duration} />
          </Fade>
          <Sequence from={NARRATION_LEAD} layout="none">
            {narr && <Audio src={staticFile(narr)} volume={1} />}
            <Subtitles text={s.narration} spanSec={span} />
          </Sequence>
        </Sequence>
      );
    })}

    {bgmBlocks.map((b, i) => {
      const src = findBgm(b.cue);
      if (!src) return null;
      const len = b.to - b.from + 30;
      return (
        <Sequence key={i} from={Math.max(0, b.from - 15)} durationInFrames={len} name={`BGM ${b.cue}`}>
          <Audio
            src={staticFile(src)}
            loop
            volume={(f) => {
              const fade = interpolate(f, [0, 45, len - 60, len], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              // 나레이션 구간에서는 덕킹
              const abs = b.from - 15 + f;
              const s = timeline.find((x) => abs >= x.from && abs < x.from + x.duration);
              const talking = s && s.narration && abs > s.from + NARRATION_LEAD && abs < s.from + NARRATION_LEAD + (s.narrationSec || s.duration / FPS) * FPS;
              return fade * (talking ? 0.16 : 0.42);
            }}
          />
        </Sequence>
      );
    })}

    {/* 비네팅 + 필름 그레인 느낌 */}
    <AbsoluteFill style={{pointerEvents: 'none', boxShadow: 'inset 0 0 220px rgba(0,0,0,0.75)'}} />
  </AbsoluteFill>
);

export const DURATION = totalFrames;
