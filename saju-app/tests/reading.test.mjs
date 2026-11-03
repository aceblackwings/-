import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { layersAt } from '../js/period.js';
import { GOD_READING, buildReading, partsStory, toneLine, STAGE_PERIOD, stageLine, crossLine, turnLine } from '../js/reading.js';
let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
t('십신 10가지 모두 풀이 재료를 갖춤 (핵심·좋은 점·조심할 점·5분야·팁)', () => {
  assert.equal(Object.keys(GOD_READING).length, 10);
  for (const [g, r] of Object.entries(GOD_READING)) {
    assert.ok(r.keyword && r.core.length > 30, g);
    assert.ok(r.good.length >= 2 && r.watch.length >= 2 && r.tips.length >= 2, g);
    for (const k of ['wealth', 'love', 'career', 'health', 'social']) assert.ok(r.fields[k].length > 15, `${g}.${k}`);
  }
});
t('대운·올해·이달 풀이: 같은 엔진의 점수와 근거를 그대로 씀', () => {
  for (let y = 1960; y <= 2008; y += 6) {
    const s = computeSaju({ year: y, month: (y % 12) + 1, day: 10, hour: 9, minute: 0 });
    const L = layersAt(s, { year: 2026, month: 11, day: 2 }, 'female');
    for (const [kind, layer] of [['daewoon', L.daewoon], ['year', L.year], ['month', L.month]]) {
      if (!layer) continue;
      const r = buildReading(kind, layer, { saju: s, concern: 'job' });
      assert.equal(r.score, layer.score); assert.equal(r.god, layer.god);
      assert.ok(r.intro.join('').includes(`${layer.score}점`));
      assert.ok(r.why.length >= 1 && r.focusLine === r.fields.career);
      assert.ok(!/undefined|NaN/.test(JSON.stringify(r)), kind);
    }
  }
});
t('점수에 따라 전체 흐름 문장과 조심할 점 분량이 달라짐', () => {
  assert.notEqual(toneLine(70), toneLine(40));
  const s = computeSaju({ year: 1998, month: 5, day: 20, hour: 9, minute: 30 });
  const lo = buildReading('year', { pillar: { stem: 2, branch: 6 }, base: 30, score: 35, parts: [], god: '편관' }, { saju: s });
  const hi = buildReading('year', { pillar: { stem: 2, branch: 6 }, base: 80, score: 75, parts: [], god: '편관' }, { saju: s });
  assert.ok(lo.watch.length > hi.watch.length && hi.good.length >= lo.good.length);
});
t('근거 해설: 용신·기신·합·충을 쉬운 말로', () => {
  const s = computeSaju({ year: 1998, month: 5, day: 20, hour: 9, minute: 30 });
  const txt = partsStory([{ kind: 'stem', element: 3, delta: 14 }, { kind: 'branch', element: 1, delta: -9.6 }, { kind: 'combine', delta: 6 }, { kind: 'clash', delta: -7 }], s).join(' ');
  ['용신', '기신', '합(合)', '충(沖)'].forEach((w) => assert.ok(txt.includes(w), w));
});
console.log(`\n${pass} passed`);
import { closingLine } from '../js/reading.js';
t('같은 오행 천간·지지는 한 문장, 맺음말은 기간에 맞춤', () => {
  const s = computeSaju({ year: 1998, month: 5, day: 20, hour: 9, minute: 30 });
  const txt = partsStory([{ kind: 'stem', element: 1, delta: -12 }, { kind: 'branch', element: 1, delta: -9.6 }], s);
  assert.equal(txt.length, 1); assert.ok(txt[0].includes('겉과 바탕 모두'));
  assert.ok(closingLine('year', 37).startsWith('올해') && !closingLine('year', 37).includes('오늘'));
  assert.ok(closingLine('month', 70, true).endsWith('예요.'));
});
t('12운성 × 십신 문장(v0.37): 12자리 모두, 받침 조사, 금지어 없음', () => {
  assert.equal(Object.keys(STAGE_PERIOD).length, 12);
  // 甲 일간이 亥(장생)·卯(제왕)·午(사)
  assert.equal(stageLine(0, 11, '정재', '올해는').stage, '장생');
  assert.equal(stageLine(0, 3, '정재').stage, '제왕');
  assert.ok(stageLine(0, 6, '식신').text.includes('「재능 발휘와 여유」는'), stageLine(0, 6, '식신').text);
  for (let d = 0; d < 10; d++) for (let b = 0; b < 12; b++) for (const g of Object.keys(GOD_READING)) {
    const x = stageLine(d, b, g, '이달은').text;
    assert.ok(!/(나쁜 날|최악|불길)/.test(x), x);
  }
});

t('⑨⑩ 교운기·대운×올해 교차(v0.39)', () => {
  assert.ok(crossLine('정재', '편재').includes('같은 방향'));
  assert.ok(crossLine('식신', '정재').includes('결실'));
  assert.ok(crossLine('정재', '식신').includes('거름'));
  assert.ok(crossLine('편인', '정재').includes('다른 방향'));
  assert.ok(turnLine(32, { startAge: 32 }, null).includes('교운기'));
  assert.ok(turnLine(31, { startAge: 22 }, { startAge: 32 }).includes('다음 해'));
  assert.equal(turnLine(25, { startAge: 22 }, { startAge: 32 }), '');
});

console.log(`${pass} passed (with merge)`);
