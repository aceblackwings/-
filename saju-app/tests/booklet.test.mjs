import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { yearOf } from '../js/period.js';
import { analyzeGyeok } from '../js/gyeokguk.js';
import { buildBooklet, yearName, FIELD_ORDER } from '../js/booklet.js';
import { toneProblems } from '../js/habit.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const make = (inp, concern) => { const s = computeSaju(inp); return buildBooklet({ y: yearOf(s, 2027, 'female'), thisYear: yearOf(s, 2026, 'female'), saju: s, gyeok: analyzeGyeok(s), name: '은하', concern }); };

t('그해 이름: 丁未 → 붉은 양의 해', () => { assert.equal(yearName({ stem: 3, branch: 7 }), '丁未년 · 붉은 양의 해'); });

t('총운 7구역 + 분야 5개, 고민 분야가 맨 앞', () => {
  const b = make({ year: 1968, month: 4, day: 12, hour: 9, minute: 0 }, 'money');
  assert.deepEqual(b.general.map((x) => x.h), ['한 해의 기운', '내 사주와 만나는 방식', '10년 큰 흐름 속의 한 해', '타고난 그릇과 올해', '한 해의 모양', '잘 풀리는 점 · 챙길 점', '한 해의 열쇠']);
  assert.equal(b.fields.length, FIELD_ORDER.length); assert.equal(b.fields[0].key, 'wealth'); assert.ok(b.fields[0].focus);
  assert.ok(JSON.stringify(b.general).length > 1000, '총운은 자세히(1,000자 이상)');
});

t('여러 사람: 금지어 없음, 문장 끝 마침표, 빈 문단·undefined 없음, 같은 입력이면 같은 글', () => {
  for (let y = 1950; y < 2012; y += 7) for (const m of [1, 4, 7, 10]) {
    const inp = { year: y, month: m, day: 9 + (y % 13), hour: 6 + (m % 12), minute: 0 };
    const b = make(inp, 'love'); const txt = JSON.stringify(b);
    assert.deepEqual(toneProblems(txt), [], txt.slice(0, 200));
    assert.ok(!/undefined|NaN|null/.test(txt), txt);
    [...b.general.flatMap((x) => x.paras), ...b.fields.flatMap((f) => f.paras)].forEach((p) => { assert.ok(p.length > 10, p); assert.ok(/[.!?]$/.test(p), p); });
    assert.equal(JSON.stringify(make(inp, 'love')), txt);
  }
});

console.log(`\nbooklet: ${pass} passed`);
