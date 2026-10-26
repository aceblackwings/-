import scenes from './scenes.json';
import timing from './timing.json';
import assets from './assets.json';

export const FPS = 30;
// 나레이션 실제 길이(초). scripts/measure-narration.mjs 가 채운다.
const narr = timing as Record<string, number>;
const files = new Set(assets as string[]);
export const hasAsset = (p: string) => files.has(p);

export type Scene = (typeof scenes)[number] & {
  from: number;
  duration: number;
  narrationSec: number;
};

const LEAD_IN = 0.6; // 장면 시작 후 나레이션이 들어오기까지
const TAIL = 1.4;

let cursor = 0;
export const timeline: Scene[] = scenes.map((s) => {
  const n = narr[s.id] ?? 0;
  const sec = Math.max(s.base, n ? n + LEAD_IN + TAIL : 0);
  const duration = Math.round(sec * FPS);
  const scene = {...s, from: cursor, duration, narrationSec: n};
  cursor += duration;
  return scene;
});
export const totalFrames = cursor;
export const NARRATION_LEAD = Math.round(LEAD_IN * FPS);
