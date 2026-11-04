// 오늘의 기운 카드(v0.43, 2026-11-04 사용자 결정): 매일 접속 → 카드 한 장 → 지신 성장
// - 하루 한 장. 내 사주에 부족한 기운(용신·가장 약한 오행·희신)이 약 80%, 다른 기운이 약 20%로 나온다
//   (사용자 결정: 「부족한 기운 위주 + 가끔 다른 기운」)
// - 같은 사람·같은 날이면 같은 카드(새로 고쳐도 바뀌지 않음, 원칙 4 확률 공개)
// - 진화 기준 = 누적 접속(카드 뽑은) 일수. 하루 놓쳐도 누적은 그대로이고 연속 기록만 다시 시작
// - 연속 3일부터 카드 등급 한 단계 올림, 연속 7일마다 부적 1장
// 순수 로직만 둔다(테스트: tests/dailycard.test.mjs). 저장은 app.js(`unmyeong2099.kicard`)
import { seededRandom } from './saju.js';
import { CARD_ZODIAC, CARD_ELEMENT } from './cards.js';

export const LACK_RATE = 0.8;
export const CARD_RARITY = [
  { key: 'common', label: '일반', weight: 55 },
  { key: 'rare', label: '희귀', weight: 28 },
  { key: 'epic', label: '영웅', weight: 12 },
  { key: 'legend', label: '전설', weight: 4 },
  { key: 'myth', label: '신화', weight: 1 },
];
export const STREAK_BOOST_FROM = 3;
export const STREAK_CHARM_EVERY = 7;
/** 진화 단계 → 필요한 누적 접속 일수 */
export const DAY_STAGES = { 2: 3, 3: 7, 4: 14, 5: 30, 6: 45, 7: 60, 8: 75, 9: 90, 10: 110, 11: 130, 12: 150, 13: 175, 14: 200 };
const KEEP_DAYS = 60;

const dayNum = (key) => { const [y, m, d] = key.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 86400000); };

export function emptyKiCards() { return { days: {}, total: 0, streak: { last: null, count: 0, best: 0 } }; }
const norm = (s) => ({ ...emptyKiCards(), ...(s || {}), streak: { ...emptyKiCards().streak, ...(s?.streak || {}) }, days: { ...(s?.days || {}) } });

/** 부족한 기운 목록과 비중: 용신 > 가장 약한 오행 > 희신 (겹치면 합침) */
export function lackElements(saju) {
  const raw = [[saju.yongsin, 5], [saju.weakest, 3], [saju.heesin, 2]].filter(([e]) => Number.isInteger(e) && e >= 0 && e < 5);
  const map = new Map();
  for (const [e, w] of raw) map.set(e, (map.get(e) || 0) + w);
  return [...map.entries()].map(([element, weight]) => ({ element, weight }));
}

/** r1으로 부족/다른 기운을, r2로 그 안의 오행을 고른다 */
export function pickElement(saju, r1, r2) {
  const lack = lackElements(saju);
  const others = [0, 1, 2, 3, 4].filter((e) => !lack.some((x) => x.element === e));
  if (r1 >= LACK_RATE && others.length) return { element: others[Math.min(others.length - 1, Math.floor(r2 * others.length))], lack: false };
  const sum = lack.reduce((a, x) => a + x.weight, 0);
  let t = r2 * sum;
  for (const x of lack) { if (t < x.weight) return { element: x.element, lack: true }; t -= x.weight; }
  return { element: lack[lack.length - 1].element, lack: true };
}

export function pickRarity(r, streak = 0) {
  let t = r * 100; let idx = CARD_RARITY.length - 1;
  for (let i = 0; i < CARD_RARITY.length; i++) { if (t < CARD_RARITY[i].weight) { idx = i; break; } t -= CARD_RARITY[i].weight; }
  if (streak >= STREAK_BOOST_FROM) idx = Math.min(CARD_RARITY.length - 1, idx + 1);
  return CARD_RARITY[idx].key;
}

export function stageForDays(total) {
  let st = 1;
  for (const [s, d] of Object.entries(DAY_STAGES)) if (total >= d) st = Math.max(st, Number(s));
  return st;
}

/** 다음 진화까지: {stage, days, left} 또는 null(최종) */
export function nextStage(total, current = stageForDays(total)) {
  const s = Object.entries(DAY_STAGES).map(([k, d]) => ({ stage: Number(k), days: d })).find((x) => x.stage > current && x.days > total);
  return s ? { ...s, left: s.days - total } : null;
}

export const todayKiCard = (store, dateKey) => norm(store).days[dateKey] || null;

/** 오늘 카드 뽑기(하루 한 번). 같은 사람·날짜면 같은 카드 */
export function drawKiCard(store, saju, person, dateKey) {
  const s = norm(store);
  if (s.days[dateKey]) return { store: s, card: s.days[dateKey], isNew: false };
  const last = s.streak.last;
  const gap = last ? dayNum(dateKey) - dayNum(last) : null;
  const count = gap === 1 ? s.streak.count + 1 : gap === 0 ? s.streak.count : 1;
  s.streak = { last: dateKey, count, best: Math.max(s.streak.best, count), lost: gap != null && gap > 1 ? s.streak.count : 0 };
  s.total += 1;
  const seed = `${person}|${dateKey}|kicard`;
  const { element, lack } = pickElement(saju, seededRandom(`${seed}|a`), seededRandom(`${seed}|b`));
  const zodiac = Math.min(11, Math.floor(seededRandom(`${seed}|z`) * 12));
  const rarity = pickRarity(seededRandom(`${seed}|r`), count);
  const card = { zodiac, element, lack, rarity, day: s.total, streak: count, charm: count % STREAK_CHARM_EVERY === 0 };
  s.days[dateKey] = card;
  const keys = Object.keys(s.days).sort();
  if (keys.length > KEEP_DAYS) keys.slice(0, keys.length - KEEP_DAYS).forEach((k) => delete s.days[k]);
  return { store: s, card, isNew: true };
}

/** 카드 글: 이름·키워드·메시지·오늘 할 한 가지 */
export function kiCardText(card, saju) {
  const Z = CARD_ZODIAC[card.zodiac]; const E = CARD_ELEMENT[card.element];
  const why = card.lack
    ? (card.element === saju.yongsin ? `내 사주에 가장 필요한 ${E.hanja}(${E.name}) 기운이에요.` : `내 사주에 부족한 ${E.hanja}(${E.name}) 기운을 채워 줘요.`)
    : `오늘은 반가운 손님처럼 ${E.hanja}(${E.name}) 기운이 찾아왔어요.`;
  return { name: `${E.prefix} ${Z.title}`, keyword: Z.keyword, why, message: `${Z.message} ${E.tone}`, action: Z.action };
}

export function rarityLabel(key) { return (CARD_RARITY.find((r) => r.key === key) || CARD_RARITY[0]).label; }
