import assert from 'node:assert/strict';
import { emptyShop, owns, priceOf, grant, yearKey, compatKey } from '../js/shop.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
t('가격: 상세판 990 · 평생 4,900 · 궁합 4,900', () => {
  const s = emptyShop();
  assert.equal(priceOf(s, yearKey(2027)).price, 990);
  assert.equal(priceOf(s, 'life').price, 4900);
  assert.equal(priceOf(s, compatKey({ year: 1990, month: 1, day: 2 })).price, 4900);
  assert.equal(priceOf(s, 'nothing'), null);
});
t('상세판을 산 사람은 평생 정통사주 1,000원 할인', () => {
  const s = grant(emptyShop(), yearKey(2027), { paid: 990, at: 1 }).store;
  const p = priceOf(s, 'life');
  assert.equal(p.price, 3900); assert.equal(p.was, 4900); assert.ok(p.note);
});
t('산 기록은 한 번만, 다시 사도 그대로', () => {
  let s = emptyShop();
  const a = grant(s, 'life', { paid: 4900, at: 5 }); s = a.store;
  assert.equal(a.already, false); assert.ok(owns(s, 'life'));
  const b = grant(s, 'life', { paid: 4900, at: 9 });
  assert.equal(b.already, true); assert.equal(b.store.owned.life.at, 5); assert.equal(b.store.log.length, 1);
  assert.ok(!owns(s, yearKey(2027)));
});
t('궁합 키는 친구 생일로(이름 없이) 정해짐', () => {
  assert.equal(compatKey({ name: '가', calendar: 'lunar', year: 1990, month: 3, day: 4 }), compatKey({ name: '나', calendar: 'lunar', year: 1990, month: 3, day: 4 }));
  assert.notEqual(compatKey({ year: 1990, month: 3, day: 4 }), compatKey({ calendar: 'lunar', year: 1990, month: 3, day: 4 }));
});
console.log(`shop: ${pass} passed`);
