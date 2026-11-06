// v0.57 소원 부적 — 부적에 소원 한 줄 + 날짜를 적고, 그날 지신이 「소원, 이루어졌나요?」를 묻는다.
// 원칙: 점수와는 무관(경험과 기록뿐), 아직이면 「조금 더 함께 기다릴게」로 날짜만 미룸(실망 문장 금지).
// 기록은 기존 부적 도감(COLLECTION_KEY) 칸에 wish·dueKey·result·doneKey·waited를 덧붙인다.
import { shiftDay } from './omen.js';

export const WISH_MAX = 30;          // 소원 한 줄 글자 수
export const WISH_DAYS_DEFAULT = 30; // 날짜를 고르지 않으면 한 달 뒤
export const WISH_LATER = [7, 30];   // 미루기: 일주일 · 한 달

const keyNum = (k) => { const [y, m, d] = String(k).split('-').map(Number); return y * 10000 + m * 100 + d; };
export const isDue = (r, todayKey) => !!(r && r.wish && !r.result && r.dueKey && keyNum(r.dueKey) <= keyNum(todayKey));

/** 소원 글: 앞뒤 빈칸·줄바꿈 정리, 꺾쇠 빼기, 30자 */
export function cleanWish(text) {
  return String(text || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, WISH_MAX);
}

/** 'YYYY-MM-DD'(입력 칸) → 'Y-M-D'(앱 날짜 키). 오늘보다 앞이면 null */
export function dueFromInput(value, todayKey) {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(value || '').trim());
  if (!m) return shiftDay(todayKey, WISH_DAYS_DEFAULT);
  const k = `${Number(m[1])}-${Number(m[2])}-${Number(m[3])}`;
  return keyNum(k) < keyNum(todayKey) ? null : k;
}
/** 'Y-M-D' → 입력 칸 'YYYY-MM-DD' */
export const inputOf = (k) => { const [y, m, d] = String(k).split('-').map(Number); return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`; };
/** 「12월 20일」 (해가 다르면 「2027년 1월 5일」) */
export function dueLabel(k, todayKey) {
  const [y, m, d] = String(k).split('-').map(Number);
  const ty = Number(String(todayKey || k).split('-')[0]);
  return `${y !== ty ? `${y}년 ` : ''}${m}월 ${d}일`;
}

/** 부적 기록에 소원 붙이기 */
export function attachWish(rec, wish, dueKey, todayKey) {
  const w = cleanWish(wish);
  if (!w || !dueKey) return rec;
  return { ...rec, wish: w, dueKey, madeKey: todayKey, result: null, waited: 0 };
}

/** 오늘 물어볼 소원(가장 오래 기다린 것 하나) — {r, i} 또는 null */
export function dueWish(collection, todayKey) {
  const list = (collection || []).map((r, i) => ({ r, i })).filter(({ r }) => isDue(r, todayKey));
  list.sort((a, b) => keyNum(a.r.dueKey) - keyNum(b.r.dueKey));
  return list[0] || null;
}

/** 이루어졌어요 → 금빛 부적, 이룬 소원 벽으로 */
export function fulfill(collection, i, todayKey) {
  return (collection || []).map((r, j) => (j === i && r?.wish ? { ...r, result: 'done', doneKey: todayKey } : r));
}
/** 조금 더 기다릴게 → 날짜만 미룸 */
export function postpone(collection, i, todayKey, days = WISH_LATER[0]) {
  return (collection || []).map((r, j) => (j === i && r?.wish ? { ...r, dueKey: shiftDay(todayKey, days), waited: (r.waited || 0) + 1 } : r));
}

export const wallOf = (collection) => (collection || []).filter((r) => r?.wish && r.result === 'done').sort((a, b) => keyNum(b.doneKey) - keyNum(a.doneKey));
export const waitingOf = (collection) => (collection || []).filter((r) => r?.wish && !r.result).sort((a, b) => keyNum(a.dueKey) - keyNum(b.dueKey));

/** 도감을 줄일 때 소원 부적은 지우지 않음(앞에서 n장 + 소원 부적 모두) */
export function trimCollection(list, n) {
  return (list || []).filter((r, i) => i < n || r?.wish);
}
/** 바치기·태우기에서 빼야 하는 부적(소원이 걸린 부적) */
export const hasWish = (r) => !!r?.wish;

/** 지신의 말 — 닭띠는 존댓말. 실망·꾸짖음 낱말 없음 */
const ASK = [
  ['오늘이 그날이야. 「{w}」, 이루어졌어?', '오늘이 그날이에요. 「{w}」, 이루어졌나요?'],
];
const DONE = [
  ['정말 잘됐다! 이 부적은 금빛으로 바꿔서 벽에 걸어 둘게. 오늘을 오래 기억하자.', '정말 잘됐어요! 이 부적은 금빛으로 바꿔서 벽에 걸어 둘게요. 오늘을 오래 기억해요.'],
  ['해냈구나! 그동안 애쓴 거, 내가 다 봤어. 금빛 액자에 걸어 둘게.', '해내셨군요! 그동안 애쓰신 거, 제가 다 봤어요. 금빛 액자에 걸어 둘게요.'],
];
const LATER = [
  ['조금 더 함께 기다릴게. {d}에 다시 물어볼게.', '조금 더 함께 기다릴게요. {d}에 다시 여쭤볼게요.'],
  ['소원은 저마다 걸음이 달라. 조금 더 함께 기다릴게, {d}에 또 보자.', '소원은 저마다 걸음이 달라요. 조금 더 함께 기다릴게요, {d}에 또 봬요.'],
  ['괜찮아, 이 부적은 계속 네 곁에 있을게. {d}에 다시 이야기하자.', '괜찮아요, 이 부적은 계속 곁에 있을게요. {d}에 다시 이야기해요.'],
];
const MADE = [
  ['「{w}」, 잘 받았어. {d}에 내가 먼저 물어볼게.', '「{w}」, 잘 받았어요. {d}에 제가 먼저 여쭤볼게요.'],
];
const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];
const fill = (s, w, d) => s.replace('{w}', w || '').replace('{d}', d || '');
export const askLine = (r, polite) => fill(ASK[0][polite ? 1 : 0], r.wish);
export const doneLine = (r, polite) => fill(pick(DONE, (r.waited || 0))[polite ? 1 : 0], r.wish);
export const laterLine = (r, dLabel, polite) => fill(pick(LATER, (r.waited || 0))[polite ? 1 : 0], r.wish, dLabel);
export const madeLine = (wish, dLabel, polite) => fill(MADE[0][polite ? 1 : 0], wish, dLabel);
export const ALL_LINES = [...ASK, ...DONE, ...LATER, ...MADE].flat();

// ---------- v0.60 기다리는 동안: 중간쯤 「소원 부적 빛이 조금 진해졌어」 (한 번) ----------
export const MID_MIN_SPAN = 4; // 만든 날과 그날 사이가 4일 이상일 때만
const dNum = (k) => { const [y, m, d] = String(k).split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
/** 오늘 알려 줄 소원(중간을 지났고 그날 전, 아직 안 알림) — {r, i} 또는 null */
export function midWish(collection, todayKey) {
  const t = dNum(todayKey);
  const list = (collection || []).map((r, i) => ({ r, i })).filter(({ r }) => {
    if (!r?.wish || r.result || r.mid || !r.dueKey) return false;
    const a = dNum(r.madeKey || r.dateKey); const b = dNum(r.dueKey);
    return b - a >= MID_MIN_SPAN && t >= a + Math.ceil((b - a) / 2) && t < b;
  });
  return list[0] || null;
}
export function markMid(collection, i) {
  return (collection || []).map((r, j) => (j === i && r?.wish ? { ...r, mid: true } : r));
}
