// v0.57 지신 데일리 코디 — 오늘 행운 오행(용신)·오늘 기운(일진 오행)에 맞춰 지신에게 소품을 입힌다.
// 「코디 하트」(♥ 1~5개)는 정통 운세 점수와 다른 이름·모양. 운세 점수에는 아무 영향이 없다.
// 7일 연속 코디하면 꾸미기 조각 1개(tteok pieces).
import { shiftDay } from './omen.js';

export const SLOTS = [
  { key: 'head', label: '머리' },
  { key: 'neck', label: '목' },
  { key: 'hand', label: '손' },
];
/** 슬롯 × 오행(목·화·토·금·수) 기본 옷장 — 누구나 무료 */
export const WARDROBE = {
  head: [
    { id: 'h0', el: 0, icon: '🍃', name: '풀잎 머리띠' },
    { id: 'h1', el: 1, icon: '🌺', name: '꽃 머리핀' },
    { id: 'h2', el: 2, icon: '👒', name: '밀짚모자' },
    { id: 'h3', el: 3, icon: '👑', name: '은빛 작은 관' },
    { id: 'h4', el: 4, icon: '🎐', name: '물빛 두건' },
  ],
  neck: [
    { id: 'n0', el: 0, icon: '🌿', name: '초록 스카프' },
    { id: 'n1', el: 1, icon: '🧣', name: '빨간 목도리' },
    { id: 'n2', el: 2, icon: '🟤', name: '황토 구슬 목걸이' },
    { id: 'n3', el: 3, icon: '🔔', name: '은방울 목걸이' },
    { id: 'n4', el: 4, icon: '🐚', name: '조개 목걸이' },
  ],
  hand: [
    { id: 'a0', el: 0, icon: '🎋', name: '대나무 부채' },
    { id: 'a1', el: 1, icon: '🏮', name: '작은 등불' },
    { id: 'a2', el: 2, icon: '🍯', name: '꿀단지' },
    { id: 'a3', el: 3, icon: '🪙', name: '엽전 꾸러미' },
    { id: 'a4', el: 4, icon: '🫖', name: '푸른 찻주전자' },
  ],
};
export const SEASON_HAND = 'season'; // 계절 소품(가진 사람만)은 손 칸에 들 수 있음
export const STREAK_NEED = 7;
const ALL = Object.values(WARDROBE).flat();
export const itemOf = (id) => ALL.find((x) => x.id === id) || null;

const gen = (e) => (e + 4) % 5; // e를 낳는 기운(상생)

/** 소품 하나의 하트: 행운 오행 2 · 행운 오행을 낳는 기운 1 · 오늘 기운 1(겹치면 큰 쪽) */
export function itemHearts(item, luckyEl, todayEl) {
  if (!item) return 0;
  if (item.el === luckyEl) return 2;
  if (item.el === gen(luckyEl) || item.el === todayEl) return 1;
  return 0;
}

/**
 * 오늘 코디 하트 — outfit = {head, neck, hand}(소품 id, 손은 'season' 가능), opts.season = 지금 계절 소품을 가졌는지
 * 하트는 1~5(빈 코디도 하트 1개: 실망 문장·0점 없음)
 */
export function coordiHearts(outfit, luckyEl, todayEl, opts = {}) {
  let sum = 0; let parts = [];
  for (const s of SLOTS) {
    const id = outfit?.[s.key];
    if (id === SEASON_HAND && s.key === 'hand') { if (opts.season) { sum += 1; parts.push({ slot: s.key, n: 1, why: '계절 소품' }); } continue; }
    const it = itemOf(id); if (!it) continue;
    const n = itemHearts(it, luckyEl, todayEl); sum += n;
    parts.push({ slot: s.key, n, why: n === 2 ? '행운 기운' : n === 1 ? (it.el === todayEl ? '오늘 기운' : '행운을 돕는 기운') : '' });
  }
  const hearts = Math.max(1, Math.min(5, sum === 0 ? 1 : Math.ceil(sum * 5 / 6)));
  return { hearts, sum, parts, title: TITLES[hearts - 1] };
}
export const TITLES = ['편안한 코디', '산뜻한 코디', '잘 어울리는 코디', '빛나는 코디', '오늘의 찰떡 코디'];
/** 하트 → 지신 표정 */
export const MOOD_BY_HEARTS = ['calm', 'smile', 'smile', 'excited', 'wow'];

/** 지신 대사(닭띠 존댓말) */
const LINES = [
  ['이 옷 편하다. 오늘은 느긋하게 같이 있자.', '이 옷 편하네요. 오늘은 느긋하게 함께 있어요.'],
  ['산뜻하다! 기분까지 가벼워졌어.', '산뜻해요! 기분까지 가벼워졌어요.'],
  ['나한테 잘 어울리지? 오늘 기운이랑 잘 맞는 느낌이야.', '저한테 잘 어울리죠? 오늘 기운이랑 잘 맞는 느낌이에요.'],
  ['와, 반짝반짝해! 오늘 하루 자신 있게 다닐 수 있겠어.', '와, 반짝반짝해요! 오늘 하루 자신 있게 다닐 수 있겠어요.'],
  ['오늘 행운 색이랑 딱 맞아! 이건 찰떡 코디야.', '오늘 행운 색이랑 딱 맞아요! 이건 찰떡 코디예요.'],
];
export const coordiLine = (hearts, polite) => LINES[Math.max(1, Math.min(5, hearts)) - 1][polite ? 1 : 0];

/** 오늘의 추천 한 벌: 슬롯마다 행운 오행 소품 */
export function suggestOutfit(luckyEl) {
  return Object.fromEntries(SLOTS.map((s) => [s.key, WARDROBE[s.key].find((x) => x.el === luckyEl).id]));
}

// ---------- 저장: unmyeong2099.coordi = {days: {dateKey: {outfit, hearts}}, last, streak, claimed} ----------
export const emptyCoordi = () => ({ days: {}, last: null, streak: 0, claimed: null });
const keyNum = (k) => { const [y, m, d] = String(k).split('-').map(Number); return y * 10000 + m * 100 + d; };

/** 오늘 코디 저장(날짜 기록은 14일만, 연속 일수는 따로 셈) */
export function saveDay(store, dateKey, outfit, hearts) {
  const s = { ...emptyCoordi(), ...(store || {}) };
  const days = { ...s.days, [dateKey]: { ...(s.days[dateKey] || {}), outfit: { ...outfit }, hearts } };
  const keep = Object.keys(days).sort((a, b) => keyNum(b) - keyNum(a)).slice(0, 14);
  const streak = s.last === dateKey ? s.streak : s.last === shiftDay(dateKey, -1) ? (s.streak || 0) + 1 : 1;
  return { ...s, last: dateKey, streak, days: Object.fromEntries(keep.map((k) => [k, days[k]])) };
}
/** 오늘까지 이어진 연속 일수(어제 이후로 안 했으면 0) */
export function streakOf(store, todayKey) {
  if (!store?.last) return 0;
  return store.last === todayKey || store.last === shiftDay(todayKey, -1) ? store.streak || 0 : 0;
}
/** 연속 7·14·21…일째 날이면 조각 1개(그날 한 번) — {store, piece, streak} */
export function claimStreak(store, todayKey) {
  const s = { ...emptyCoordi(), ...(store || {}) };
  const n = s.last === todayKey ? s.streak : 0;
  if (n < STREAK_NEED || n % STREAK_NEED || s.claimed === todayKey) return { store: s, piece: false, streak: n };
  return { store: { ...s, claimed: todayKey }, piece: true, streak: n };
}

// ---------- v0.59(2026-11-06 사용자 결정): 추천 없음 · 별 3개 = 떡 1 · 4개 = 2 · 5개 = 3 ----------
// v0.77(2026-11-22 사용자 「아이템 선택을 3번까지 하게 해서 복떡 받을 확률을 높여 줘」): 부위마다 하루 3번까지 바꿔 입기,
// 「이 코디로 완성하기」를 누르거나 세 부위 기회를 다 쓰면 완성 → 그때 별 수만큼 떡
// v0.90(2026-11-26 사용자 「별 1~2개도 복떡 1개, 별 3개면 2개, 별 5개면 3개」): 4개는 2개
export const STAR_REWARD = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3 };
export const PICKS_PER_SLOT = 3;
export const lockedOn = (store, dateKey) => {
  const day = (store?.days || {})[dateKey] || {};
  const lk = { ...(day.locked || {}) };
  if (day.done) SLOTS.forEach((x) => { lk[x.key] = true; });
  return lk;
};
/** 부위마다 오늘 남은 기회(예전 기록은 잠긴 부위 = 0) */
export function triesLeft(store, dateKey) {
  const day = (store?.days || {})[dateKey] || {}; const lk = lockedOn(store, dateKey);
  return Object.fromEntries(SLOTS.map((x) => [x.key, lk[x.key] ? 0 : Math.max(0, PICKS_PER_SLOT - (day.tries?.[x.key] || 0))]));
}
/** 오늘 코디를 마쳤는지(완성 버튼 또는 기회 모두 사용) */
export const isDone = (store, dateKey) => { const lk = lockedOn(store, dateKey); return SLOTS.every((x) => lk[x.key]); };
/** 세 부위 모두 입었는지(완성 버튼을 누를 수 있는지) */
export const canFinish = (store, dateKey) => { const day = (store?.days || {})[dateKey]; return !!day && !isDone(store, dateKey) && SLOTS.every((x) => day.outfit?.[x.key]); };
/** 한 부위 고르기 → {store, locked:true}면 그 부위는 오늘 더 못 바꿈, same:true면 이미 입은 소품(기회 안 씀) */
export function pickSlot(store, dateKey, slot, id, luckyEl, todayEl, opts = {}) {
  const s = { ...emptyCoordi(), ...(store || {}) }; const day = s.days[dateKey] || {};
  if (lockedOn(s, dateKey)[slot]) return { store: s, locked: true };
  if (id && day.outfit?.[slot] === id) return { store: s, locked: false, same: true, res: coordiHearts(day.outfit, luckyEl, todayEl, opts), left: triesLeft(s, dateKey)[slot], done: false };
  const outfit = { ...(day.outfit || {}), [slot]: id || null };
  const res = coordiHearts(outfit, luckyEl, todayEl, opts);
  const next = saveDay(s, dateKey, outfit, res.hearts);
  const tries = { ...(day.tries || {}), [slot]: (day.tries?.[slot] || 0) + 1 };
  const locked = { ...(day.locked || {}) }; if (tries[slot] >= PICKS_PER_SLOT) locked[slot] = true;
  const done = SLOTS.every((x) => locked[x.key]);
  next.days[dateKey] = { ...next.days[dateKey], tries, locked, ...(done ? { done: true } : {}) };
  return { store: next, locked: false, res, left: PICKS_PER_SLOT - tries[slot], done };
}
/** 「이 코디로 완성하기」: 세 부위를 다 입었을 때만 */
export function finishDay(store, dateKey) {
  const s = { ...emptyCoordi(), ...(store || {}) };
  if (!canFinish(s, dateKey)) return { store: s, ok: false };
  return { store: { ...s, days: { ...s.days, [dateKey]: { ...s.days[dateKey], done: true } } }, ok: true };
}
/** 완성한 날 한 번: 별 수만큼 떡 */
export function claimStars(store, dateKey) {
  const s = { ...emptyCoordi(), ...(store || {}) }; const day = s.days[dateKey];
  if (!day || day.paid || !isDone(s, dateKey)) return { store: s, gained: 0, done: false };
  const gained = STAR_REWARD[day.hearts] || 0;
  return { store: { ...s, days: { ...s.days, [dateKey]: { ...day, paid: true } } }, gained, done: true, stars: day.hearts };
}

// ---------- v0.89(2026-11-26 사용자 「오늘의 코디를 누르면 3개 아이템이 자동으로 장착, 기회는 2번까지, 바로 복떡 획득 · 아래 내용은 만들지 말고」) ----------
// 누를 때마다 머리·목·손을 무작위로 한 벌 입히고 바로 완성. 하루 2번까지, 복떡은 그날 가장 좋은 별 기준으로(두 번째가 더 좋으면 차이만큼 더 받음)
export const ROLLS_PER_DAY = 2;
export const rollsLeft = (store, dateKey) => Math.max(0, ROLLS_PER_DAY - (((store?.days || {})[dateKey] || {}).rolls || 0));
/**
 * 자동 코디 한 번 → { store, ok, res, gained(이번에 받을 복떡), best(오늘 가장 좋은 별), left(남은 기회) }
 * rng는 0~1 함수(테스트에서 고정)
 */
export function autoRoll(store, dateKey, luckyEl, todayEl, opts = {}, rng = Math.random) {
  const s = { ...emptyCoordi(), ...(store || {}) }; const day = s.days[dateKey] || {};
  if (rollsLeft(s, dateKey) <= 0) return { store: s, ok: false, left: 0 };
  const outfit = Object.fromEntries(SLOTS.map((x) => { const list = WARDROBE[x.key]; return [x.key, list[Math.floor(rng() * list.length) % list.length].id]; }));
  const res = coordiHearts(outfit, luckyEl, todayEl, opts);
  const next = saveDay(s, dateKey, outfit, res.hearts);
  const best = Math.max(day.best || 0, res.hearts);
  const owed = STAR_REWARD[best] || 0; const paidN = day.paidN || 0; const gained = Math.max(0, owed - paidN);
  const rolls = (day.rolls || 0) + 1;
  next.days[dateKey] = { ...next.days[dateKey], rolls, best, paidN: paidN + gained, paid: true, done: true };
  return { store: next, ok: true, res, gained, best, left: ROLLS_PER_DAY - rolls };
}
