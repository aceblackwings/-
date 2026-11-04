// 구매 기록(v0.46): 유료 상세 풀이를 산 기록을 기기에 저장(unmyeong2099.shop)
// - 상품 키: 'year:2027'(그해 상세판) · 'life'(평생 정통사주) · 'compat:<친구 키>'(궁합 상세)
// - 정식 결제는 아직 없음: 체험판은 결제 창에서 「체험판으로 열기」를 누르면 기록만 남김(PG·스토어 결제는 `pay` 자리에 붙임)
// - 원칙 3: 산 것은 「읽기」만 열림. 점수·부적·지신에는 영향 없음
// 순수 로직만(테스트: tests/shop.test.mjs)
import { PRODUCTS, LIFE_DISCOUNT } from './premium.js';

export const emptyShop = () => ({ owned: {}, log: [] });
const norm = (s) => ({ ...emptyShop(), ...(s || {}), owned: { ...(s?.owned || {}) }, log: [...(s?.log || [])] });

export const yearKey = (y) => `year:${y}`;
export const compatKey = (fr) => `compat:${fr.calendar || 'solar'}-${fr.year}-${fr.month}-${fr.day}`;
export const kindOf = (key) => String(key).split(':')[0];

export const owns = (store, key) => !!norm(store).owned[key];
const ownsAnyYear = (store) => Object.keys(norm(store).owned).some((k) => kindOf(k) === 'year');

/** 지금 이 사람에게 매길 값: 평생 정통사주는 상세판을 산 적 있으면 1,000원 할인 */
export function priceOf(store, key) {
  const P = PRODUCTS[kindOf(key)]; if (!P) return null;
  if (kindOf(key) === 'life' && ownsAnyYear(store)) return { price: P.price - LIFE_DISCOUNT, was: P.price, note: '상세판 구매 감사 할인' };
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
