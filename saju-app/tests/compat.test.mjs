import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { characterInfo } from '../js/character.js';
import { branchRelation, stemRelation, computeCompat, renderCompatSVG, GRADES, dayBranchRelation, todayPair } from '../js/compat.js';
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
t('v0.39 궁합: 날짜가 바뀌어도 점수는 같음, 오늘의 둘만 바뀜, 근거 합 = 점수', () => {
  const a = computeSaju({ year: 1990, month: 3, day: 5, hour: 9, minute: 0 }); const b = computeSaju({ year: 1992, month: 8, day: 17, hour: 14, minute: 0 });
  const lines = new Set();
  for (let d = 1; d <= 28; d++) {
    const c = computeCompat(a, b, { year: 2026, month: 11, day: d });
    assert.equal(c.score, computeCompat(a, b, { year: 2026, month: 1, day: 1 }).score);
    assert.equal(c.todayBonus, 0); lines.add(c.todayLine);
    const sum = 47 + c.parts.stem + c.parts.day + c.parts.yong + c.parts.ddi;
    assert.equal(c.score, Math.max(10, Math.min(99, sum)));
  }
  assert.ok(lines.size >= 2, '오늘의 둘은 날마다 바뀜');
});
t('일지 관계: 子丑 육합 +, 子午 충 −, 같은 일지 +', () => {
  assert.ok(dayBranchRelation(0, 1).score > 10); assert.ok(dayBranchRelation(0, 6).score < 0); assert.equal(dayBranchRelation(3, 3).score, 4);
  assert.equal(dayBranchRelation(0, 4).score, 9, '子辰 반합');
});
t('공유 카드 친구(일지 없음)도 궁합 계산', () => {
  const me = computeSaju({ year: 1990, month: 3, day: 5, hour: 9, minute: 0 });
  const card = { fromCard: true, pillars: { year: { branch: 4 } }, dayMaster: 3, elements: [20, 20, 20, 20, 20], weakest: 0, yongsin: 1 };
  const c = computeCompat(me, card, { year: 2026, month: 11, day: 3 });
  assert.ok(c.score >= 10 && c.score <= 99); assert.ok(c.day.unknown); assert.equal(c.parts.day, 0);
});
console.log(`\n${pass} passed`);
