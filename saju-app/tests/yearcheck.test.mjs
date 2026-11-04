// 한 해 조심할 점 · 참고할 점(2026-11-04)
import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { yearOf } from '../js/period.js';
import { yearChecks, pickChecks, samjaeOf, checkLine } from '../js/yearcheck.js';
import { toneProblems } from '../js/habit.js';

let pass = 0; const t = (n, fn) => { fn(); pass++; console.log('ok -', n); };
const people = [];
for (let y = 1950; y < 2014; y += 2) for (const m of [2, 5, 8, 11]) people.push(computeSaju({ year: y, month: m, day: 1 + (y * m) % 27, hour: (y + m * 3) % 24, minute: 0 }));

t('삼재: 띠 삼합 무리별 세 해(들·눌·날)', () => {
  // 亥卯未(돼지·토끼·양)띠 → 巳午未년. 2027 丁未 = 날삼재
  assert.equal(samjaeOf(3, 7), '날삼재'); assert.equal(samjaeOf(11, 5), '들삼재'); assert.equal(samjaeOf(7, 6), '눌삼재');
  assert.equal(samjaeOf(0, 7), null);
  // 申子辰 → 寅卯辰, 寅午戌 → 申酉戌, 巳酉丑 → 亥子丑
  assert.equal(samjaeOf(0, 2), '들삼재'); assert.equal(samjaeOf(6, 10), '날삼재'); assert.equal(samjaeOf(9, 11), '들삼재');
});

t('사람마다 다른 결과 · 모든 항목 = 제목 + 장면 + 대비 행동, 금지어·빈칸 없음', () => {
  const sigs = new Set(); let withWatch = 0;
  for (const s of people) {
    const list = pickChecks(yearChecks(yearOf(s, 2027, 'female'), s, { gender: 'female' }));
    sigs.add(list.map((c) => c.key).join(','));
    if (list.some((c) => c.kind === 'watch')) withWatch++;
    assert.ok(list.filter((c) => c.kind === 'watch').length <= 3, '조심할 점은 3개까지(겁주지 않게)');
    for (const c of list) {
      assert.ok(c.title && c.text.length > 30 && c.act.length > 8, JSON.stringify(c));
      const line = checkLine(c);
      assert.ok(!/undefined|NaN|null/.test(line), line);
      assert.deepEqual(toneProblems(line), [], line);
    }
  }
  assert.ok(sigs.size > people.length * 0.5, `같은 해라도 사람마다 달라야 함(${sigs.size}/${people.length})`);
  assert.ok(withWatch > people.length * 0.8, '대부분 사람에게 조심할 점이 하나 이상');
});

t('같은 입력이면 같은 결과', () => {
  const s = people[7]; const y = yearOf(s, 2027, 'male');
  assert.deepEqual(yearChecks(y, s, { gender: 'male' }), yearChecks(yearOf(s, 2027, 'male'), s, { gender: 'male' }));
});

console.log(`yearcheck: ${pass} passed`);
