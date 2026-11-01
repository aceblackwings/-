import assert from 'node:assert/strict';
import { computeSaju, pillarLabel } from '../js/saju.js';
import { computeDaewoon, daewoonAt, yearPillar, emptyLuck, addCharge, luckIndex, fiveYearForecast, rollYear, STAGE_LUCK_GATE } from '../js/luck.js';
let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const s = computeSaju({ year: 1990, month: 6, day: 15, hour: 10, minute: 0 });

t('대운: 양년생 남자는 순행 (1990 庚午년 6월 15일 → 소서까지 약 22일 → 7세, 癸未부터)', () => {
  const d = computeDaewoon(s, 'male');
  assert.equal(d.forward, true);
  assert.ok(Math.abs(d.days - 22) <= 1, `days ${d.days}`);
  assert.equal(d.startAge, 7);
  assert.equal(pillarLabel(d.pillars[0]), '癸未');
  assert.equal(pillarLabel(d.pillars[1]), '甲申');
});
t('대운: 양년생 여자는 역행 (망종까지 약 9일 → 3세, 辛巳부터)', () => {
  const d = computeDaewoon(s, 'female');
  assert.equal(d.forward, false);
  assert.equal(d.startAge, 3);
  assert.equal(pillarLabel(d.pillars[0]), '辛巳');
  assert.equal(pillarLabel(daewoonAt(d, 36)), '戊寅'); // 3세 辛巳, 13세 庚辰, 23세 己卯, 33~42세 戊寅
});
t('세운: 2026 병오, 2027 정미', () => {
  assert.equal(pillarLabel(yearPillar(2026)), '丙午');
  assert.equal(pillarLabel(yearPillar(2027)), '丁未');
});
t('오행 충전: 같은 출처는 하루 1번, 용신은 1.5배', () => {
  let l = emptyLuck(2026);
  let r = addCharge(l, s, { element: s.yongsin, amount: 10, source: 'daily', dateKey: '2026-11-1' }); l = r.luck;
  assert.equal(r.added, 15);
  assert.equal(addCharge(l, s, { element: s.yongsin, amount: 10, source: 'daily', dateKey: '2026-11-1' }).added, 0);
  assert.ok(luckIndex(l, s).index > 0);
});
t('개운 지수 100이면 모든 해가 기본보다 높고, 해마다 개선 폭이 커짐', () => {
  let l = emptyLuck(2026);
  for (let e = 0; e < 5; e++) l = addCharge(l, s, { element: e, amount: 100, source: 'test', dateKey: 'x' }).luck;
  assert.equal(luckIndex(l, s).index, 100);
  const f0 = fiveYearForecast(s, 'male', { year: 2026 }, 0, 1);
  const f = fiveYearForecast(s, 'male', { year: 2026 }, 100, 5);
  f.forEach((y, i) => { assert.equal(y.base, f0[i].base); assert.ok(y.improved > y.base); });
  assert.ok((f[4].improved - f[4].base) >= (f[1].improved - f[1].base));
  f0.forEach((y) => assert.equal(y.improved, y.base));
});
t('해가 바뀌면 30% 이월', () => {
  const l = rollYear({ year: 2026, charge: [10, 20, 0, 0, 30], log: {}, total: 60 }, 2027);
  assert.deepEqual(l.charge, [3, 6, 0, 0, 9]);
  assert.equal(STAGE_LUCK_GATE[5], 75);
});
console.log(`\n${pass} passed`);
