// 구매 기록(v0.46): 유료 상세 풀이를 산 기록을 기기에 저장(unmyeong2099.shop)
// - 상품 키: 'year:2027'(그해 상세판) · 'life'(평생 정통사주) · 'compat:<친구 키>'(궁합 상세) · 'bundle:2027'(올인원, v0.48)
// - 정식 결제는 아직 없음: 체험판은 결제 창에서 「체험판으로 열기」를 누르면 기록만 남김(PG·스토어 결제는 `pay` 자리에 붙임)
// - 원칙 3: 산 것은 「읽기」만 열림. 점수·부적·지신에는 영향 없음
// 순수 로직만(테스트: tests/shop.test.mjs)
import { PRODUCTS, BUNDLE_COMPAT } from './premium.js';

export const emptyShop = () => ({ owned: {}, log: [], compatCredits: 0 });
const norm = (s) => ({ ...emptyShop(), ...(s || {}), owned: { ...(s?.owned || {}) }, log: [...(s?.log || [])], compatCredits: s?.compatCredits || 0 });

export const yearKey = (y) => `year:${y}`;
export const bundleKey = (y) => `bundle:${y}`;
export const compatKey = (fr) => `compat:${fr.calendar || 'solar'}-${fr.year}-${fr.month}-${fr.day}`;
export const kindOf = (key) => String(key).split(':')[0];

export const owns = (store, key) => !!norm(store).owned[key];
export const compatCredits = (store) => norm(store).compatCredits;

/** 지금 이 사람에게 매길 값. 궁합 상세는 올인원 이용권이 남아 있으면 0원(이용권 1장) */
export function priceOf(store, key) {
  const P = PRODUCTS[kindOf(key)]; if (!P) return null;
  if (kindOf(key) === 'compat' && compatCredits(store) > 0) return { price: 0, was: P.price, note: `올인원 궁합 이용권 ${compatCredits(store)}장 남음`, credit: true };
  return { price: P.price, was: null, note: '' };
}

/** 산 기록 남기기(이미 있으면 그대로) */
export function grant(store, key, { paid = 0, at = Date.now(), via = 'trial' } = {}) {
  const s = norm(store);
  if (s.owned[key]) return { store: s, already: true };
  s.owned[key] = { at, paid, via };
  s.log = [{ key, at, paid, via }, ...s.log].slice(0, 50);
  return { store: s, already: false };
}

/**
 * 올인원 패키지(v0.48): 그해 상세판 + 평생 정통사주 열기 + 궁합 이용권 3장. 복떡 50개는 화면에서 tteok.gift로 넣음
 * 이미 가진 풀이는 그대로 두고(다시 기록하지 않음), 패키지는 한 해에 한 번만
 */
export function grantBundle(store, y, { paid = 0, at = Date.now(), via = 'trial' } = {}) {
  let s = norm(store); const key = bundleKey(y);
  if (s.owned[key]) return { store: s, already: true };
  s = grant(s, key, { paid, at, via }).store;
  s = grant(s, yearKey(y), { paid: 0, at, via: 'bundle' }).store;
  s = grant(s, 'life', { paid: 0, at, via: 'bundle' }).store;
  s.compatCredits = (s.compatCredits || 0) + BUNDLE_COMPAT;
  return { store: s, already: false };
}

/** 궁합 이용권 1장으로 궁합 상세 열기(이용권이 없거나 이미 가졌으면 그대로) */
export function useCompatCredit(store, key, { at = Date.now() } = {}) {
  const s = norm(store);
  if (s.owned[key] || s.compatCredits <= 0) return { store: s, used: false };
  const r = grant(s, key, { paid: 0, at, via: 'credit' }).store;
  r.compatCredits = s.compatCredits - 1;
  return { store: r, used: true };
}
