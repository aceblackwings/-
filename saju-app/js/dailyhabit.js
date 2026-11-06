// 나만의 매일 습관 2가지(v0.59, 2026-11-06 사용자 결정)
// · 하고 싶은 습관 2개를 직접 적거나 추천에서 고름
// · 체크는 다음 날: 오늘 아침에 「어제 했나요?」를 체크(첫날만 오늘 바로 2개 모두 체크 가능 → 떡 4개)
// · 체크 하나 = 🍡 복떡 2개
// 저장 unmyeong2099.dhabit = { list: [a, b], start: dateKey, checks: { dateKey: [bool, bool] } } (40일)
// 순수 로직만(테스트: tests/cookie.test.mjs)
import { shiftDay } from './omen.js';

export const DHABIT_KEY = 'unmyeong2099.dhabit';
export const HABIT_MAX = 24;
export const HABIT_REWARD = 2;
export const HABIT_COUNT = 2;
const toNum = (k) => { const [y, m, d] = String(k).split('-').map(Number); return y * 10000 + m * 100 + d; };

/** 추천 습관: 오행마다 3개(그 기운을 채우는 생활) */
export const RECOMMEND = [
  ['책 다섯 쪽 읽기', '새 단어 세 개 외우기', '화분에 물 주고 잎 닦기'],
  ['아침 햇볕 5분 쬐기', '하루 한 번 칭찬하기', '저녁에 10분 걷기'],
  ['같은 시간에 일어나기', '오늘 쓴 돈 적기', '세 끼 거르지 않기'],
  ['책상 5분 정리하기', '내일 할 일 세 개 적기', '깊은 숨 열 번 쉬기'],
  ['물 여덟 잔 마시기', '감사한 일 한 줄 쓰기', '잠들기 30분 전 휴대폰 내려놓기'],
];
export const ALL_RECOMMEND = RECOMMEND.flat();

export const emptyHabits = () => ({ list: ['', ''], start: null, checks: {} });
const norm = (s) => ({ ...emptyHabits(), ...(s || {}), list: [...(s?.list || ['', ''])], checks: { ...(s?.checks || {}) } });
export const cleanHabit = (t) => String(t || '').replace(/\s+/g, ' ').trim().slice(0, HABIT_MAX);
export const isSet = (store) => norm(store).list.filter(Boolean).length === HABIT_COUNT;

/** 추천 6개: 가장 필요한 기운 2 · 가장 적은 기운 2 · 나머지 기운에서 2 (날마다 조금씩 바뀜) */
export function recommendHabits(saju, dateKey = '') {
  const day = toNum(dateKey || '2026-1-1');
  const order = [saju.yongsin, saju.weakest, ...[0, 1, 2, 3, 4].filter((e) => e !== saju.yongsin && e !== saju.weakest)];
  const out = [];
  order.forEach((el, i) => {
    const take = i < 2 ? 2 : (i === 2 + (day % 3) ? 2 : 0);
    for (let k = 0; k < take; k++) { const h = RECOMMEND[el][(day + k) % 3]; if (!out.includes(h)) out.push(h); }
  });
  return out.slice(0, 6);
}

/** 습관 정하기(처음 정한 날이 첫날) */
export function setHabits(store, list, todayKey) {
  const s = norm(store); const next = list.map(cleanHabit).slice(0, HABIT_COUNT);
  while (next.length < HABIT_COUNT) next.push('');
  return { ...s, list: next, start: s.start || (next.every(Boolean) ? todayKey : null) };
}

/** 오늘 체크할 날: 첫날이면 오늘, 그다음부터는 어제 */
export function checkTarget(store, todayKey) {
  const s = norm(store); if (!s.start) return null;
  return s.start === todayKey ? todayKey : shiftDay(todayKey, -1);
}
export const checksOn = (store, dateKey) => [...(norm(store).checks[dateKey] || [false, false])];

/** 체크 하나 → 복떡 2개(같은 칸은 한 번만) */
export function checkHabit(store, todayKey, i) {
  const s = norm(store); const target = checkTarget(s, todayKey);
  if (!target || !s.list[i]) return { store: s, gained: 0, already: false };
  const row = checksOn(s, target);
  if (row[i]) return { store: s, gained: 0, already: true };
  row[i] = true;
  const checks = { ...s.checks, [target]: row };
  const keep = Object.keys(checks).sort((a, b) => toNum(b) - toNum(a)).slice(0, 40);
  return { store: { ...s, checks: Object.fromEntries(keep.map((k) => [k, checks[k]])) }, gained: HABIT_REWARD, target, all: row.every(Boolean) };
}

/** 최근 7일(체크 대상 날 기준) 칸: [{ dateKey, n }] n = 그날 체크한 수 */
export function recentChecks(store, todayKey, days = 7) {
  const s = norm(store); const end = checkTarget(s, todayKey) || todayKey; const out = [];
  for (let i = days - 1; i >= 0; i--) { const k = shiftDay(end, -i); out.push({ dateKey: k, n: (s.checks[k] || []).filter(Boolean).length }); }
  return out;
}
