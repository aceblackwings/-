import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { computeFortune } from '../js/fortune.js';
import { fiveScores, FIVE } from '../js/todayfive.js';
import { toneProblems } from '../js/habit.js';
let pass = 0; const t = (n, fn) => { fn(); pass++; console.log('ok -', n); };
t('5분야 점수: 30점대~90점대로 폭넓게, 같은 날 같은 값, 금지어 없음', () => {
  const all = [];
  for (let i = 0; i < 200; i++) {
    const s = computeSaju({ year: 1950 + (i * 7) % 60, month: 1 + (i % 12), day: 1 + (i * 3) % 28, hour: (i * 5) % 24, minute: 0 });
    for (let d = 0; d < 10; d++) {
      const date = { year: 2026, month: 1 + (d % 12), day: 1 + (d * 7 + i) % 28 };
      const f = computeFortune(s, date, { gender: i % 2 ? 'male' : 'female' }); const v = fiveScores(f);
      assert.equal(v.list.length, FIVE.length); v.list.forEach((x) => { all.push(x.score); assert.deepEqual(toneProblems(x.line), []); });
      if (d === 0) assert.deepEqual(fiveScores(computeFortune(s, date, { gender: i % 2 ? 'male' : 'female' })), v);
    }
  }
  const n = all.length; const share = (f) => all.filter(f).length / n;
  assert.ok(share((x) => x < 40) > 0.02 && share((x) => x < 40) < 0.12, `30점대 ${share((x) => x < 40)}`);
  assert.ok(share((x) => x >= 90) > 0.02 && share((x) => x >= 90) < 0.15, `90점대 ${share((x) => x >= 90)}`);
  assert.ok(Math.min(...all) >= 30 && Math.max(...all) <= 96);
  const mean = all.reduce((a, b) => a + b, 0) / n; assert.ok(mean > 58 && mean < 70, String(mean));
});
console.log(`\ntodayfive: ${pass} passed`);
