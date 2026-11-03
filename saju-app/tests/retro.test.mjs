import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { computeDaewoon } from '../js/luck.js';
import { retroQuestions, retroSummary } from '../js/retro.js';
import { toneProblems } from '../js/habit.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };

t('물어볼 해: 2~3개, 최근 12년·12세 이후, 2년 이상 간격, 질문 문장', () => {
  let any = 0;
  for (let y = 1960; y < 2010; y += 3) {
    const s = computeSaju({ year: y, month: 4, day: 10, hour: 9, minute: 0 });
    const qs = retroQuestions(s, computeDaewoon(s, 'female'), 2026);
    if (qs.length) any++;
    assert.ok(qs.length <= 3);
    qs.forEach((q, i) => { assert.ok(q.year < 2026 && q.year >= 2014 && q.age >= 12); assert.ok(q.q.includes(`${q.year}년`)); if (i) assert.ok(qs[i - 1].year - q.year >= 2); });
    assert.deepEqual(toneProblems(JSON.stringify(qs)), []);
  }
  assert.ok(any >= 12, '대부분 사람에게 질문이 있음');
});

t('요약: 다 답하면 맞은 수, 덜 답하면 안내, 적게 맞아도 다독이는 문장', () => {
  const qs = [{ year: 2020 }, { year: 2017 }, { year: 2014 }];
  assert.equal(retroSummary(qs, {}), null);
  assert.ok(retroSummary(qs, { 2020: 'yes' }).text.includes('1개 답해'));
  assert.ok(retroSummary(qs, { 2020: 'yes', 2017: 'yes', 2014: 'some' }).text.includes('2개가 맞았고 1개가 비슷'));
  assert.ok(retroSummary(qs, { 2020: 'no', 2017: 'no', 2014: 'no' }).text.includes('흐름이'));
});

console.log(`\nretro: ${pass} passed`);
