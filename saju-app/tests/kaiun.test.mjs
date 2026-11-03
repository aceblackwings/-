import assert from 'node:assert/strict';
import { kaiunPower, kaiunFor, kaiunLine, fieldKaiunSentence, withKaiun, PERIOD_CAP } from '../js/kaiun.js';
import { toneProblems } from '../js/habit.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const R = (type, rarity = 'common', element = 0) => ({ type, rarity, element, theme: 'classic', dateKey: 'x' });

t('아무것도 없으면 0, 안내 문장', () => {
  const p = kaiunPower([], 1, 0);
  assert.equal(kaiunFor(p, 'year').total, 0); assert.ok(kaiunLine(p, 'year').empty);
});

t('재물부는 재물에, 행운부는 전체에 작게, 용신 오행이면 더, 지신이 자라면 전체에', () => {
  const w = kaiunPower([R('wealth', 'epic')], 1, 3);
  assert.ok(w.fields.wealth > 0 && w.fields.love === 0);
  const wy = kaiunPower([R('wealth', 'epic', 3)], 1, 3);
  assert.ok(wy.fields.wealth > w.fields.wealth, '용신 오행 부적이 더 셈');
  const l = kaiunPower([R('luck')], 1, 0); assert.ok(l.fields.love > 0 && l.fields.wealth > 0);
  const g = kaiunPower([], 6, 0); assert.ok(g.total > 0 && g.sources[0].label === '지신 6단계');
});

t('올해는 천천히(비율 0.5·한도 5), 이달은 조금 더(0.8·한도 8), 정통 점수는 그대로', () => {
  const p = kaiunPower([R('wealth', 'myth', 2), R('wealth', 'legend', 2)], 14, 2, { pair: 'wealth', five: true });
  const y = kaiunFor(p, 'year'); const m = kaiunFor(p, 'month');
  assert.ok(y.fields.wealth <= PERIOD_CAP.year && m.fields.wealth <= PERIOD_CAP.month);
  assert.ok(m.fields.wealth >= y.fields.wealth);
  assert.equal(withKaiun(97, 5), 98, '98점 위로는 안 올림');
  const base = 64; assert.equal(withKaiun(base, y.total), base + y.total);
});

t('문장: 출처 이름·분야, 게임 요소 표시, 금지어 없음', () => {
  const p = kaiunPower([R('wealth', 'legend'), R('love')], 4, 0, { pair: null });
  const L = kaiunLine(p, 'month'); assert.ok(L.text.includes('재물부') && L.text.includes('이달'));
  const f = fieldKaiunSentence(p, 'wealth'); assert.ok(f.includes('재물부가') && f.includes('게임 요소'));
  assert.equal(fieldKaiunSentence(kaiunPower([], 1, 0), 'wealth'), '');
  assert.deepEqual(toneProblems(L.text + f), []);
});

console.log(`\nkaiun: ${pass} passed`);
