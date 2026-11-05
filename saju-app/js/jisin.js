// 지신 밥 주기·빠른 성장(v0.52, 2026-11-05 사용자 결정 「오늘 운세·타로처럼 자주 보는 것으로 지신이 매일 크는 게 보이게, 키우는 기간은 짧게」)
// - 하루 세 그릇: 아침밥 = 오늘의 운세 보기 · 간식 = 타로 한 번 · 저녁밥 = 좋은 습관 체크 또는 기운 카드
// - 하루 점수: 한 그릇 2 · 두 그릇 3 · 세 그릇 4(배부른 날). 놓친 날은 줄지 않음(벌 없음)
// - 진화는 누적 밥 점수로: 첫날 2단계 → 3일 3단계 → 7일 4단계 → 14일 5단계(완성 그림) → 승천 6~14는 단계마다 약 5일
//   (세 그릇을 다 채운 날 기준. 한 그릇씩만 채워도 5단계까지 약 26일)
// - 운세 점수와는 무관(설계 원칙 2·3): 결제로 성장 점수를 살 수 없음. 순수 로직만(테스트: tests/jisin.test.mjs)
import { BRANCH_ELEMENT } from './saju.js';

export const BOWLS = [
  { key: 'morning', icon: '🍚', label: '아침밥', how: '오늘의 운세 보기' },
  { key: 'snack', icon: '🍡', label: '간식', how: '타로 한 번 보기' },
  { key: 'dinner', icon: '🍲', label: '저녁밥', how: '좋은 습관 체크 또는 기운 카드' },
];
/** 그날 채운 그릇 수 → 그날 점수 */
export const DAY_POINTS = [0, 2, 3, 4];
/** 진화 단계별 필요한 누적 밥 점수(세 그릇 = 하루 4점) */
export const STAGE_POINTS = { 2: 1, 3: 10, 4: 26, 5: 52 };
for (let s = 6; s <= 14; s++) STAGE_POINTS[s] = 52 + (s - 5) * 20;
/** 진화 사이에 하나씩 붙는 작은 꾸밈(성장 막대 20%마다 하나) */
export const DECOR = [
  { icon: '🌸', label: '볼 터치' },
  { icon: '🎀', label: '리본' },
  { icon: '✨', label: '오행 빛 한 겹' },
  { icon: '🌟', label: '오행 빛 두 겹' },
];
/** 표정(이모티콘 8가지) 해금 순서: 밥을 준 날 3일마다 하나 */
export const EMO_ORDER = ['smile', 'love', 'thanks', 'excited', 'wow', 'calm', 'fighting', 'sleepy'];
export const EMO_KO = { smile: '방긋', love: '사랑', thanks: '고마워', excited: '신남', wow: '깜짝', calm: '차분', fighting: '힘내', sleepy: '졸림' };

export function emptyFood() { return { days: {}, points: 0, seeded: false }; }
const norm = (s) => ({ ...emptyFood(), ...(s || {}), days: { ...(s?.days || {}) } });
const dayPoints = (d) => DAY_POINTS[Math.min(3, BOWLS.filter((b) => d?.[b.key]).length)];

/**
 * 예전 사용자(기운 카드 누적 일수로 진화하던 사람)는 처음 한 번 누적 일수 × 4점을 넣어 줌 → 진화가 뒤로 가지 않음
 */
export function seedFood(store, legacyDays = 0) {
  const s = norm(store); if (s.seeded) return s;
  return { ...s, seeded: true, points: s.points + Math.max(0, legacyDays) * 4 };
}

/** 그릇 하나 채우기(같은 날 같은 그릇은 한 번만). 반환: {store, gained, bowls, full, already} */
export function feed(store, dateKey, key) {
  const s = norm(store); const d = { ...(s.days[dateKey] || {}) };
  if (!BOWLS.some((b) => b.key === key)) return { store: s, gained: 0, bowls: 0, full: false, already: true };
  if (d[key]) return { store: s, gained: 0, bowls: BOWLS.filter((b) => d[b.key]).length, full: false, already: true };
  const before = dayPoints(d); d[key] = true; const after = dayPoints(d);
  const days = { ...s.days, [dateKey]: d };
  const keep = Object.keys(days).sort((a, b) => toNum(b) - toNum(a)).slice(0, 60);
  const bowls = BOWLS.filter((b) => d[b.key]).length;
  return { store: { ...s, days: Object.fromEntries(keep.map((k) => [k, days[k]])), points: s.points + (after - before), totalFed: (s.totalFed || Object.keys(s.days).length) + (before === 0 ? 1 : 0) }, gained: after - before, bowls, full: bowls === 3, already: false };
}
const toNum = (k) => { const [y, m, d] = String(k).split('-').map(Number); return y * 10000 + m * 100 + d; };

/** 오늘 그릇 상태: [{...bowl, done}] */
export const todayBowls = (store, dateKey) => { const d = norm(store).days[dateKey] || {}; return BOWLS.map((b) => ({ ...b, done: !!d[b.key] })); };
/** 밥을 준 날 수(표정 해금용) */
export const fedDays = (store) => { const s = norm(store); return Math.max(s.totalFed || 0, Object.values(s.days).filter((d) => dayPoints(d) > 0).length); };

export function stageForPoints(p) {
  let st = 1; for (const [s, need] of Object.entries(STAGE_POINTS)) if (p >= need) st = Math.max(st, Number(s));
  return st;
}
/** 지금 단계 안에서 얼마나 컸는지: {stage, next, need, left, ratio(0~1)} · 최종이면 next null */
export function growthOf(p, current = stageForPoints(p)) {
  const stage = Math.max(current, stageForPoints(p));
  const next = stage >= 14 ? null : stage + 1;
  if (!next) return { stage, next: null, need: 0, left: 0, ratio: 1 };
  const from = stage === 1 ? 0 : STAGE_POINTS[stage] ?? 0; const to = STAGE_POINTS[next];
  const ratio = Math.max(0, Math.min(1, (p - from) / Math.max(1, to - from)));
  return { stage, next, need: to, left: Math.max(0, to - p), ratio };
}
/** 남은 점수 → 「세 그릇 기준 며칠」 */
export const daysLeft = (left) => Math.ceil(left / DAY_POINTS[3]);
/** 키(cm): 밥 점수만큼 매일 자람(보이는 숫자용) */
export const heightCm = (p) => Math.round((12 + p * 0.35) * 10) / 10;
/** 지금 붙어 있는 꾸밈 수(0~4): 단계 안 성장 막대 20%마다 하나 */
export const decorCount = (ratio) => Math.min(DECOR.length, Math.floor(ratio * 5));
/** 열린 표정 수(1~8) */
export const emotesUnlocked = (days) => Math.min(EMO_ORDER.length, 1 + Math.floor(days / 3));
/** 오늘 운세 점수 → 지신 컨디션(점수 대신 표정으로) */
export function conditionOf(total) {
  if (total >= 80) return { mood: 'excited', label: '신남', line: '오늘 기운이 좋아서 지신이 신났어요' };
  if (total >= 64) return { mood: 'smile', label: '방긋', line: '오늘은 무난한 날이라 지신이 방긋 웃고 있어요' };
  if (total >= 46) return { mood: 'calm', label: '차분', line: '오늘은 서두르지 말자며 지신이 차분해졌어요' };
  return { mood: 'sleepy', label: '졸림', line: '오늘은 쉬어 가는 날이라 지신도 꾸벅꾸벅 졸아요' };
}
/** 밥 준 직후 지신 한마디 */
export function feedLine(key, bowls) {
  if (bowls === 3) return '세 그릇 다 먹었다! 오늘은 배불러서 쑥 자랐어.';
  return { morning: '아침밥 고마워! 오늘 운세 같이 봤지?', snack: '간식 냠냠, 카드 고르는 거 재밌었어.', dinner: '저녁밥까지! 오늘 하루도 잘 해냈네.' }[key] || '고마워!';
}

// ---------- v0.53 두 번째 지신(2026-11-05 사용자 결정) ----------
// - 첫 지신이 5단계(완성 모습)가 되면 다른 띠 지신 하나를 더 데려옴(추천: 육합 짝꿍·삼합 한 팀·부족한 기운의 띠, 가족·연인 띠도 자유)
// - 따로 할 일은 없음: 같은 세 그릇을 나눠 먹고, 큰 지신이 가르쳐 줘서 1.5배 빨리 자람(데려온 뒤 쌓인 밥 점수 기준)
// - 운세 점수와는 무관(게임 요소). 저장은 app.js `unmyeong2099.jisin2` = {branch, element, name, at, base}
export const SECOND_UNLOCK = 5;
export const SECOND_RATE = 1.5;
export const NAME_MAX = 6;
const YUKHAP = [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
const SAMHAP = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]];
/** 띠(지지) 오행 = saju.js BRANCH_ELEMENT */
export const BRANCH_EL = BRANCH_ELEMENT;
const EL_KO = ['나무', '불', '흙', '쇠', '물'];

export const secondUnlocked = (stage) => stage >= SECOND_UNLOCK;

/** 추천 띠: [{branch, tags:[...], why}] · 내 띠 제외 · 육합 → 삼합 → 부족한 기운 순 */
export function recommendSecond(myBranch, yongsin) {
  const out = new Map();
  const add = (b, tag, why) => {
    if (b === myBranch) return;
    const cur = out.get(b) || { branch: b, tags: [], whys: [] };
    if (!cur.tags.includes(tag)) { cur.tags.push(tag); cur.whys.push(why); }
    out.set(b, cur);
  };
  add(YUKHAP[myBranch], '찰떡 짝꿍', '내 띠와 짝을 이루는 띠(육합)라 잘 어울려요');
  for (const b of SAMHAP.find((g) => g.includes(myBranch))) add(b, '한 팀', '내 띠와 한 팀을 이루는 띠(삼합)라 힘을 모아 줘요');
  BRANCH_EL.forEach((e, b) => { if (e === yongsin) add(b, `${EL_KO[yongsin]} 기운`, `나에게 가장 필요한 ${EL_KO[yongsin]} 기운의 띠예요`); });
  return [...out.values()].map((r) => ({ branch: r.branch, tags: r.tags, why: r.whys.join(' · ') })).slice(0, 5);
}

/** 이름(부르는 말) 다듬기: 한글·영문·숫자·공백, 6자 */
export const cleanName = (s) => String(s || '').replace(/[^0-9A-Za-z가-힣ㄱ-ㅎ ]/g, '').trim().slice(0, NAME_MAX);

/** 데려오기 */
export function adoptSecond({ branch, name = '', dateKey, totalPoints = 0 }) {
  if (!Number.isInteger(branch) || branch < 0 || branch > 11) throw new Error('branch');
  return { branch, element: BRANCH_EL[branch], name: cleanName(name), at: dateKey, base: Math.max(0, totalPoints) };
}
/** 두 번째 지신의 밥 점수(데려온 뒤 쌓인 점수 × 1.5) */
export const secondPoints = (sec, totalPoints) => (sec ? Math.floor(Math.max(0, totalPoints - (sec.base || 0)) * SECOND_RATE) : 0);
export const secondStage = (sec, totalPoints) => stageForPoints(secondPoints(sec, totalPoints));

/** 두 지신의 오늘 한 장면(날마다 바뀜, 세 그릇 다 먹은 날은 낮잠) */
export const DUO_SCENES = [
  '큰 지신이 작은 지신에게 오늘 운세를 읽어 주고 있어요.',
  '작은 지신이 타로 카드 한 장을 몰래 뒤집어 보고 있어요.',
  '두 지신이 밥그릇을 나란히 놓고 기다리고 있어요.',
  '작은 지신이 큰 지신 뒤를 졸졸 따라다녀요.',
  '두 지신이 오늘 좋은 습관을 누가 먼저 하나 내기했어요.',
  '큰 지신이 작은 지신 키를 재 주고 있어요.',
  '작은 지신이 기운 카드 그림을 따라 그리고 있어요.',
];
export const DUO_FULL = '오늘 세 그릇을 다 먹고 두 지신이 나란히 낮잠을 자요.';
export function duoScene(dateKey, bowls) {
  if (bowls >= 3) return DUO_FULL;
  const n = String(dateKey).split('-').reduce((a, x) => a * 31 + Number(x || 0), 7);
  return DUO_SCENES[Math.abs(n) % DUO_SCENES.length];
}
