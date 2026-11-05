// v0.57 걱정 태우기(전통 소지 燒紙) — 걱정 한 줄을 다 쓴 부적에 붙여 손가락으로 불을 붙이면 타들어 가며 재가 날아간다.
// 약속: 적은 걱정은 어디에도 저장하지 않는다(이 모듈은 저장소를 쓰지 않고, 화면도 다 타면 글을 지운다).
// 부적 기운은 지신에게 — 바치기와 같은 값(charmcare offerValue).
import { offerValue, offerable } from './charmcare.js';
import { isCrisis } from './chat.js';

export const WORRY_MAX = 40;
export const BURN_DONE = 0.92; // 이만큼 타면 다 탄 것으로

/** 화면에만 쓰는 걱정 글(저장하지 않음): 줄바꿈 정리 · 40자 */
export const cleanWorry = (text) => String(text || '').replace(/\s+/g, ' ').trim().slice(0, WORRY_MAX);

/** 태울 수 있는 부적: 장착하지 않았고 소원이 걸리지 않은 부적 */
export function burnable(collection, equipped) {
  return offerable(collection, equipped).filter(({ r }) => !r.wish);
}

/** 위기 낱말이면 109 안내를 함께 */
export const needsCare = (worry) => isCrisis(String(worry || ''));
export const CARE_LINES = [
  '혼자 견디기 어려운 마음이라면, 지금 바로 사람과 이야기해 주세요.',
  '자살예방 상담전화 ☎ 109 (24시간) · 정신건강 위기상담 ☎ 1577-0199',
];

/**
 * 다 탄 뒤: 부적을 도감에서 빼고 기운(성장 점수)을 돌려줌. 걱정 글은 받지도 돌려주지도 않는다.
 * idx = 도감 칸 번호(빈 종이면 -1)
 */
export function burnResult(collection, idx, fill = 0) {
  const r = idx >= 0 ? (collection || [])[idx] : null;
  if (!r) return { collection: collection || [], exp: 0, charm: null };
  return { collection: collection.filter((_, i) => i !== idx), exp: offerValue(r, fill), charm: r };
}

/** 지신의 말(닭띠 존댓말) */
const TAKE = [
  ['이 걱정은 내가 가져갈게. 이제 조금 가벼워졌으면 좋겠어.', '이 걱정은 제가 가져갈게요. 이제 조금 가벼워지셨으면 좋겠어요.'],
  ['다 탔어. 이 걱정은 내가 가져갈게, 너는 오늘 할 일만 하면 돼.', '다 탔어요. 이 걱정은 제가 가져갈게요, 오늘 할 일만 하시면 돼요.'],
  ['재는 바람에 실려 갔어. 이 걱정은 내가 가져갈게.', '재는 바람에 실려 갔어요. 이 걱정은 제가 가져갈게요.'],
];
export const takeLine = (seed, polite) => TAKE[Math.abs(seed) % TAKE.length][polite ? 1 : 0];
export const ALL_LINES = TAKE.flat();

// ---------- 불길 번지기(격자) — 0 종이 · 1 타는 중 · 2 다 탐 ----------
export function makeGrid(w, h) { return { w, h, cell: new Uint8Array(w * h), age: new Uint8Array(w * h) }; }
/** (x, y) 칸 둘레에 불 붙이기 */
export function ignite(g, x, y, r = 1) {
  let n = 0;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const cx = Math.round(x) + dx; const cy = Math.round(y) + dy;
    if (cx < 0 || cy < 0 || cx >= g.w || cy >= g.h) continue;
    const i = cy * g.w + cx; if (g.cell[i] === 0) { g.cell[i] = 1; g.age[i] = 0; n++; }
  }
  return n;
}
/** 한 걸음: 타는 칸은 이웃에 옮겨 붙고(위로 더 잘 번짐) 몇 걸음 뒤 재가 됨. 새로 재가 된 칸 번호를 돌려줌 */
export function stepFire(g, rnd = Math.random, life = 5) {
  const { w, h, cell, age } = g; const next = []; const ash = [];
  for (let i = 0; i < cell.length; i++) {
    if (cell[i] !== 1) continue;
    const x = i % w; const y = (i / w) | 0;
    for (const [dx, dy, p] of [[0, -1, 0.75], [-1, 0, 0.45], [1, 0, 0.45], [0, 1, 0.3], [-1, -1, 0.4], [1, -1, 0.4]]) {
      const nx = x + dx; const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const j = ny * w + nx; if (cell[j] === 0 && rnd() < p) next.push(j);
    }
    age[i]++; if (age[i] >= life) { cell[i] = 2; ash.push(i); }
  }
  for (const j of next) if (cell[j] === 0) { cell[j] = 1; age[j] = 0; }
  return ash;
}
export function burntShare(g) {
  let n = 0; for (let i = 0; i < g.cell.length; i++) if (g.cell[i] === 2) n++;
  return n / g.cell.length;
}
export const isBurning = (g) => g.cell.some((c) => c === 1);
/** 불길이 멎었는데 종이가 남았으면, 재와 맞닿은 종이 칸 하나에 다시 불을 붙임 */
export function rekindle(g) {
  const { w, cell } = g;
  for (let i = 0; i < cell.length; i++) {
    if (cell[i] !== 0) continue;
    const x = i % w;
    const near = [i - w, i + w, x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1].some((j) => j >= 0 && j < cell.length && cell[j] === 2);
    if (near) { cell[i] = 1; g.age[i] = 0; return true; }
  }
  return false;
}
