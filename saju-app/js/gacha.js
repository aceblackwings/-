// 운명 뽑기 (가챠): 한 번 뽑으면 부적·스티커·이모티콘 3종 묶음
// - 매일 무료 1회, 추가 3회는 "추가 뽑기권(오늘)" 또는 "수호 구독(매일)"
// - 확률 공개 + 천장: 전설 이상이 30회 안 나오면 30번째에 전설 확정
// - 공정성: 유료 뽑기에서 나온 부적은 오행 충전량 50%
import { STICKERS } from './stickers.js';

export const RATES = [
  { key: 'common', label: '일반', rate: 55 },
  { key: 'rare', label: '희귀', rate: 28 },
  { key: 'epic', label: '영웅', rate: 12 },
  { key: 'legend', label: '전설', rate: 4.5 },
  { key: 'myth', label: '신화', rate: 0.5 },
];
export const PITY = 30;
export const FREE_PER_DAY = 1;
export const EXTRA_PER_DAY = 3;
export const PRICES = { extra: 1100, subscription: 4900 };
const ORDER = RATES.map((r) => r.key);
const STICKER_W = { common: 58, rare: 27, epic: 11, legend: 3.5, myth: 0.5 };

export function rollRarity(r, { minRare = false } = {}) {
  const pool = minRare ? RATES.slice(1) : RATES;
  const total = pool.reduce((s, x) => s + x.rate, 0);
  let acc = 0;
  for (const x of pool) { acc += x.rate; if (r * total < acc) return x.key; }
  return pool[pool.length - 1].key;
}

export const rarityRank = (k) => ORDER.indexOf(k);

/**
 * 한 번 뽑기
 * @param rng () => 0~1
 * @param ctx {pity, minRare, emoteKeys, types, elements}
 */
export function drawPack(rng, ctx) {
  let charmRarity = rollRarity(rng(), { minRare: ctx.minRare });
  let pity = (ctx.pity || 0) + 1;
  let pityHit = false;
  if (rarityRank(charmRarity) >= 3) pity = 0;
  else if (pity >= PITY) { charmRarity = rng() < 0.1 ? 'myth' : 'legend'; pity = 0; pityHit = true; }

  const total = STICKERS.reduce((s, x) => s + STICKER_W[x.rarity], 0);
  let acc = 0; const rs = rng() * total;
  const sticker = STICKERS.find((x) => { acc += STICKER_W[x.rarity]; return rs < acc; }) || STICKERS[0];

  const emoteKey = ctx.emoteKeys[Math.floor(rng() * ctx.emoteKeys.length)];
  const emoteRarity = rollRarity(rng());
  const type = ctx.types[Math.floor(rng() * ctx.types.length)];
  const element = ctx.elements[Math.floor(rng() * ctx.elements.length)];
  const theme = rng() < 0.5 ? 'classic' : 'neon';
  const best = [charmRarity, sticker.rarity, emoteRarity].reduce((a, b) => (rarityRank(b) > rarityRank(a) ? b : a));
  return { charm: { rarity: charmRarity, type, element, theme }, sticker, emote: { key: emoteKey, rarity: emoteRarity }, pity, pityHit, best };
}

export function emptyGacha() {
  return { date: null, freeUsed: 0, extraUsed: 0, extraBought: false, subUntil: null, pity: 0, history: [] };
}

/** 날짜가 바뀌면 하루 사용량 초기화 */
export function todayGacha(g, dateKey) {
  if (g.date === dateKey) return g;
  return { ...g, date: dateKey, freeUsed: 0, extraUsed: 0, extraBought: false };
}

export function isSubscribed(g, dateKey) {
  if (!g.subUntil) return false;
  const n = (k) => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  return n(dateKey) <= n(g.subUntil);
}

/** @param bonusFree 7일 연속 출석·축제 등으로 늘어난 무료 횟수 */
export function drawsLeft(g, dateKey, bonusFree = 0) {
  const t = todayGacha(g, dateKey);
  const extraAllowed = (isSubscribed(t, dateKey) || t.extraBought) ? EXTRA_PER_DAY : 0;
  const freeAllowed = FREE_PER_DAY + bonusFree;
  return { free: Math.max(0, freeAllowed - t.freeUsed), freeAllowed, extra: Math.max(0, extraAllowed - t.extraUsed), extraAllowed };
}
