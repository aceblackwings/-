// v0.56 내 오행 · 모자란 기운 채우기
import assert from 'node:assert/strict';
import { ohengGuide, roleOf, defaultOheng } from '../js/oheng.js';
import { computeSaju } from '../js/saju.js';
import { josaProblems } from '../js/josa.js';
let pass = 0; const t = (n, f) => { f(); pass++; console.log('ok -', n); };
t('다섯 기운 모두 안내 · 가장 필요한 기운이 먼저 · 조사 검사', () => {
  for (const [y, m, d, h] of [[1990, 5, 14, 9], [1975, 11, 2, 22], [2001, 1, 30, 4], [1962, 8, 8, 13], [1988, 2, 19, 6]]) {
    const s = computeSaju({ calendar: 'solar', year: y, month: m, day: d, hour: h, minute: 0 });
    assert.equal(defaultOheng(s), s.yongsin); assert.equal(roleOf(s.yongsin, s), 'need');
    for (let e = 0; e < 5; e++) {
      const g = ohengGuide(e, s);
      assert.equal(g.bring.length, 4); assert.equal(g.chips.length, 6);
      assert.ok(g.chips.every(([, v]) => v && v.length));
      for (const line of [g.nature, g.status, ...g.bring]) assert.deepEqual(josaProblems(line), [], line);
      if (g.role === 'need' || g.role === 'weak') { assert.ok(g.fill); assert.match(g.status, /모자라면/); }
      if (g.role === 'much') assert.match(g.status, /넉넉/);
    }
  }
});
console.log(`oheng: ${pass} passed`);
