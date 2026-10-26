import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, sans} from '../theme';

/** 나레이션을 문장 단위로 쪼개 글자 수 비율대로 배분 */
export const Subtitles: React.FC<{text: string; spanSec: number}> = ({text, spanSec}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!text) return null;
  const parts = text.match(/[^.?!]+[.?!]?/g)!.map((s) => s.trim()).filter(Boolean);
  const total = parts.reduce((a, s) => a + s.length, 0);
  const span = spanSec * fps;
  let acc = 0;
  const cues = parts.map((s) => {
    const start = (acc / total) * span;
    acc += s.length;
    return {s, start, end: (acc / total) * span};
  });
  const cue = cues.find((c) => f >= c.start && f < c.end);
  if (!cue) return null;
  const o = interpolate(f, [cue.start, cue.start + 6, cue.end - 4, cue.end], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', bottom: 70, width: '100%', display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{maxWidth: 1500, textAlign: 'center', fontFamily: sans, fontWeight: 700, fontSize: 44, lineHeight: 1.45, color: C.ink, background: 'rgba(8,6,14,0.55)', padding: '12px 32px', borderRadius: 14, wordBreak: 'keep-all'}}>
        {cue.s}
      </div>
    </div>
  );
};
