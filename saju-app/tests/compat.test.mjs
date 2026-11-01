import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { characterInfo } from '../js/character.js';
import { branchRelation, stemRelation, computeCompat, renderCompatSVG, GRADES } from '../js/compat.js';
let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
t('띠 관계', () => {
  assert.equal(branchRelation(0, 8).type, 'samhap'); // 子申
  assert.equal(branchRelation(0, 1).type, 'yukhap'); // 子丑
  assert.equal(branchRelation(0, 6).type, 'chung'); // 子午
  assert.equal(branchRelation(0, 7).type, 'wonjin'); // 子未
  assert.equal(branchRelation(3, 3).type, 'same');
});
t('일간 관계', () => {
  assert.equal(stemRelation(0, 5).type, 'hap'); // 甲己
  assert.equal(stemRelation(0, 2).type, 'give'); // 甲木→丙火
  assert.equal(stemRelation(2, 0).type, 'take');
  assert.equal(stemRelation(0, 6).type, 'clash'); // 甲 vs 庚
});
t('궁합 점수 범위·등급 분포·카드 렌더링', () => {
  const me = computeSaju({ year: 1992, month: 8, day: 17, timeKnown: false });
  const mi = characterInfo(me, { gender: 'female', concern: 'love' });
  const seen = new Set();
  for (let y = 1960; y <= 2010; y += 1) for (let m = 1; m <= 12; m += 4) {
    const fr = computeSaju({ year: y, month: m, day: 10, timeKnown: false });
    const c = computeCompat(me, fr, { year: 2026, month: 11, day: 1 });
    assert.ok(c.score >= 10 && c.score <= 99);
    for (const v of Object.values(c.sub)) assert.ok(v >= 10 && v <= 99);
    seen.add(c.grade.key);
    if (y % 10 === 0) {
      const svg = renderCompatSVG(mi, characterInfo(fr, { gender: 'male', concern: 'people' }), c, { myStage: 3 });
      assert.ok(svg.startsWith('<svg') && !svg.includes('undefined') && !svg.includes('NaN'));
    }
  }
  assert.ok(seen.size >= 4, [...seen].join(','));
});
console.log(`\n${pass} passed`);
