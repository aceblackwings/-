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
import { retroCalib as RC, kindsOfYear as KY } from '../js/retro.js';
import { computeSaju as CS2 } from '../js/saju.js';
import { computeDaewoon as CD2 } from '../js/luck.js';
{
  const s = CS2({ year: 1985, month: 6, day: 15, hour: 10, minute: 0 }); const dw = CD2(s, 'female');
  const flagged = []; for (let y = 2000; y < 2026; y++) { const k = KY(s, dw, y); if (k.length) flagged.push([y, k]); }
  const clashYears = flagged.filter(([, k]) => k.includes('clash')).map(([y]) => y);
  const yes = Object.fromEntries(clashYears.map((y) => [y, 'yes'])); const no = Object.fromEntries(clashYears.map((y) => [y, 'no']));
  const a = RC(s, dw, yes); const b = RC(s, dw, no);
  if (!(a.weights.clash > 1 && b.weights.clash < 1)) throw new Error(`보정 방향 ${a.weights.clash} ${b.weights.clash}`);
  if (!(a.rate === 1 && b.rate === 0)) throw new Error('비율');
  if (RC(s, dw, {}).n !== 0) throw new Error('답 없음');
  if (!(a.weights.clash <= 1.4 && b.weights.clash >= 0.6)) throw new Error('범위');
  console.log('ok - 지난 일 답 → 개인 보정(맞은 신호는 앞으로, 안 맞은 신호는 뒤로, 0.6~1.4)');
}
