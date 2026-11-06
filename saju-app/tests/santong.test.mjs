// v0.59 새해 산통 점괘
import assert from 'node:assert/strict';
import { GRADES, ITEMS, pickGrade, drawYear, openYear, santongCard, ALL_LINES } from '../js/santong.js';
import { josaProblems } from '../js/josa.js';

let n = 0; const t = (name, fn) => { fn(); n++; console.log(`ok - ${name}`); };

t('9단계 · 비율 합 100 · 대길 10 … 대흉 4', () => {
  assert.equal(GRADES.length, 9);
  assert.equal(GRADES.reduce((a, g) => a + g.weight, 0), 100);
  assert.deepEqual(GRADES.map((g) => g.weight), [10, 15, 15, 20, 12, 10, 8, 6, 4]);
  assert.equal(pickGrade(0), 'daegil'); assert.equal(pickGrade(0.999), 'daehyung'); assert.equal(pickGrade(0.5), 'gil');
});

t('뽑기 분포가 비율과 비슷함', () => {
  let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const cnt = {}; for (let i = 0; i < 20000; i++) { const k = pickGrade(rnd()); cnt[k] = (cnt[k] || 0) + 1; }
  for (const g of GRADES) assert.ok(Math.abs(cnt[g.key] / 200 - g.weight) < 1.5, `${g.label} ${cnt[g.key] / 200}%`);
});

t('그해에는 한 번만(다시 뽑아도 같음) · 다음 해는 새로', () => {
  let r = drawYear({}, 2027, 0.95); assert.ok(r.fresh); const g = r.grade;
  r = drawYear(r.store, 2027, 0.01); assert.equal(r.grade, g); assert.equal(r.fresh, false); assert.equal(r.opened, false);
  const s = openYear(r.store, 2027); assert.equal(drawYear(s, 2027).opened, true);
  assert.ok(drawYear(s, 2028, 0.01).fresh);
});

t('점괘 한 장: 항목 10줄 · 흉은 오를 일·할 일로 맺음 · 조사·금지 낱말', () => {
  for (const g of GRADES) {
    const c = santongCard(g.key); assert.equal(c.items.length, ITEMS.length);
    assert.ok(c.act.length > 5);
    if (c.low) assert.ok(/조심|다지|다져|오를|올라|피하|확인/.test(c.head + c.body + c.act));
  }
  for (const l of ALL_LINES) { assert.deepEqual(josaProblems(l), [], l); assert.ok(!/최악|불길|저주|죽/.test(l), l); }
});

console.log(`santong: ${n} 통과`);
