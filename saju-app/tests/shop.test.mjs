import assert from 'node:assert/strict';
import { emptyShop, owns, priceOf, grant, yearKey, compatKey, bundleKey, grantBundle, useCompatCredit, compatCredits } from '../js/shop.js';
import { PRODUCTS, bundleWorth } from '../js/premium.js';
import { gift, emptyTteok } from '../js/tteok.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
t('가격(v0.48): 단품 상세판 990 · 정통사주 2,900 · 궁합 990 · 올인원 4,900', () => {
  const s = emptyShop();
  assert.equal(priceOf(s, yearKey(2027)).price, 990);
  assert.equal(priceOf(s, 'life').price, 2900);
  assert.equal(priceOf(s, compatKey({ year: 1990, month: 1, day: 2 })).price, 990);
  assert.equal(priceOf(s, bundleKey(2027)).price, 4900);
  assert.equal(priceOf(s, 'nothing'), null);
});
t('상세판을 사도 정통사주는 2,900원 그대로(옛 1,000원 할인 없음) · 올인원은 따로 사는 값의 절반 아래', () => {
  const s = grant(emptyShop(), yearKey(2027), { paid: 990, at: 1 }).store;
  assert.deepEqual(priceOf(s, 'life'), { price: 2900, was: null, note: '' });
  assert.ok(bundleWorth() > PRODUCTS.bundle.price * 2, String(bundleWorth()));
});
t('올인원: 상세판·정통사주 열림 + 궁합 이용권 3장, 한 해에 한 번만, 이미 산 풀이 기록은 그대로', () => {
  let s = grant(emptyShop(), 'life', { paid: 2900, at: 3 }).store;
  const a = grantBundle(s, 2027, { paid: 4900, at: 7 }); s = a.store;
  assert.equal(a.already, false); assert.ok(owns(s, yearKey(2027)) && owns(s, 'life') && owns(s, bundleKey(2027)));
  assert.equal(s.owned.life.paid, 2900); assert.equal(compatCredits(s), 3);
  const b = grantBundle(s, 2027, { paid: 4900 }); assert.equal(b.already, true); assert.equal(compatCredits(b.store), 3);
  assert.ok(!owns(s, yearKey(2028)));
});
t('궁합 이용권: 남아 있으면 0원(이용권), 한 장씩 쓰고 다 쓰면 다시 990원 · 같은 친구는 두 번 안 씀', () => {
  let s = grantBundle(emptyShop(), 2027).store; const k = (d) => compatKey({ year: 1990, month: 1, day: d });
  const p = priceOf(s, k(1)); assert.equal(p.price, 0); assert.ok(p.credit);
  for (const d of [1, 2, 3]) { const r = useCompatCredit(s, k(d)); assert.ok(r.used); s = r.store; }
  assert.equal(compatCredits(s), 0); assert.ok(owns(s, k(3)));
  assert.equal(useCompatCredit(s, k(4)).used, false); assert.equal(priceOf(s, k(4)).price, 990);
  const s2 = grantBundle(emptyShop(), 2027).store; const once = useCompatCredit(s2, k(1)).store;
  assert.equal(useCompatCredit(once, k(1)).used, false); assert.equal(compatCredits(once), 2);
});
t('올인원 복떡 50개는 tteok.gift로 들어감', () => {
  const r = gift(emptyTteok(), '올인원 패키지', 50); assert.equal(r.store.balance, 50); assert.equal(r.gained, 50);
});
t('산 기록은 한 번만, 다시 사도 그대로', () => {
  let s = emptyShop();
  const a = grant(s, 'life', { paid: 2900, at: 5 }); s = a.store;
  assert.equal(a.already, false); assert.ok(owns(s, 'life'));
  const b = grant(s, 'life', { paid: 2900, at: 9 });
  assert.equal(b.already, true); assert.equal(b.store.owned.life.at, 5); assert.equal(b.store.log.length, 1);
  assert.ok(!owns(s, yearKey(2027)));
});
t('궁합 키는 친구 생일로(이름 없이) 정해짐', () => {
  assert.equal(compatKey({ name: '가', calendar: 'lunar', year: 1990, month: 3, day: 4 }), compatKey({ name: '나', calendar: 'lunar', year: 1990, month: 3, day: 4 }));
  assert.notEqual(compatKey({ year: 1990, month: 3, day: 4 }), compatKey({ calendar: 'lunar', year: 1990, month: 3, day: 4 }));
});
console.log(`shop: ${pass} passed`);
