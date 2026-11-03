import assert from 'node:assert/strict';
import { computeSaju, BRANCH_MAIN_STEM } from '../js/saju.js';
import { HIDDEN_STEMS, twelveStage, gongmang, sinsalOf, expertTable, calcBasis, makeChart, addChart, removeChart, emptyCharts, CHART_LIMIT } from '../js/expert.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };

t('지장간: 정기(마지막)는 지지 본기와 같음', () => {
  HIDDEN_STEMS.forEach((h, b) => assert.equal(h[h.length - 1], BRANCH_MAIN_STEM[b], `branch ${b}`));
});

t('12운성: 대표 값 (甲 寅 건록·卯 제왕·亥 장생, 乙 午 장생·卯 건록, 丙 午 제왕, 庚 申 건록, 壬 子 제왕, 癸 子 건록, 辛 子 장생)', () => {
  assert.equal(twelveStage(0, 2), '건록'); assert.equal(twelveStage(0, 3), '제왕'); assert.equal(twelveStage(0, 11), '장생');
  assert.equal(twelveStage(0, 7), '묘'); assert.equal(twelveStage(1, 6), '장생'); assert.equal(twelveStage(1, 3), '건록');
  assert.equal(twelveStage(2, 6), '제왕'); assert.equal(twelveStage(6, 8), '건록'); assert.equal(twelveStage(8, 0), '제왕');
  assert.equal(twelveStage(9, 0), '건록'); assert.equal(twelveStage(7, 0), '장생');
});

t('공망: 甲子순 戌亥, 甲戌순 申酉, 甲寅순 子丑', () => {
  assert.deepEqual(gongmang(0, 0), [10, 11]); assert.deepEqual(gongmang(9, 9), [10, 11]);
  assert.deepEqual(gongmang(0, 10), [8, 9]); assert.deepEqual(gongmang(2, 0), [8, 9]);
  assert.deepEqual(gongmang(0, 2), [0, 1]);
});

t('신살: 직접 만든 원국에서 천을귀인·역마·도화·화개·문창·양인', () => {
  // 일간 甲(0), 연지 子(0), 월지 丑(1), 일지 寅(2), 시지 酉(9)
  const s = { dayMaster: 0, pillars: { year: { stem: 0, branch: 0 }, month: { stem: 1, branch: 1 }, day: { stem: 0, branch: 2 }, hour: { stem: 9, branch: 9 } } };
  const names = Object.fromEntries(sinsalOf(s).map((x) => [x.name, x.where]));
  assert.deepEqual(names.천을귀인, ['월지'], '甲 → 丑未');
  assert.deepEqual(names.도화살, ['시지'], '子(申子辰) → 酉');
  assert.deepEqual(names.역마살, ['일지'], '연지 子(申子辰) → 寅');
  assert.ok(!names.화개살, '子 → 辰, 寅 → 戌 없음');
  assert.ok(!names.문창귀인, '甲 → 巳 없음');
  assert.deepEqual(names.양인살 || [], [], '甲 → 卯 없음');
  const s2 = { ...s, pillars: { ...s.pillars, hour: { stem: 3, branch: 3 } } };
  assert.deepEqual(Object.fromEntries(sinsalOf(s2).map((x) => [x.name, x.where])).양인살, ['시지'], '甲 → 卯');
});

t('전문가 표: 기둥 4개, 시간 모름이면 시주 빈칸, 공망 표시', () => {
  const s = computeSaju({ year: 1990, month: 5, day: 15, hour: 9, minute: 30 });
  const tb = expertTable(s);
  assert.equal(tb.length, 4); assert.equal(tb[1].stemGod, '일간');
  assert.ok(tb.every((r) => r.hidden.length >= 2 && r.stage));
  const s2 = computeSaju({ year: 1990, month: 5, day: 15, timeKnown: false });
  assert.ok(expertTable(s2)[0].empty);
});

t('계산 기준: 표준시·경도 보정·자시·황경, 설정을 바꾸면 결과도 바뀜', () => {
  const a = computeSaju({ year: 1990, month: 5, day: 15, hour: 23, minute: 40 });
  const b = computeSaju({ year: 1990, month: 5, day: 15, hour: 23, minute: 40, zasiMode: 'late' });
  assert.notDeepEqual(a.pillars.day, b.pillars.day, '야자시면 일주가 바뀜');
  assert.ok(calcBasis(b).some((x) => x.v.includes('야자시')));
  const c = computeSaju({ year: 1990, month: 5, day: 15, hour: 9, minute: 10, longitudeCorrection: false });
  assert.ok(calcBasis(c).some((x) => x.v.includes('보정 안 함')));
  const summer = computeSaju({ year: 1988, month: 7, day: 1, hour: 12, minute: 0 });
  assert.ok(calcBasis(summer).some((x) => x.k === '서머타임'), '서머타임 해는 안내');
  assert.ok(!calcBasis(a).some((x) => x.k === '서머타임'));
});

t('명식 저장: 입력 검사, 20개 제한, 삭제하면 선택이 나로 돌아감', () => {
  assert.equal(makeChart({ name: '', year: 1990, month: 1, day: 1 }).ok, false);
  assert.equal(makeChart({ name: '엄마', year: 1850, month: 1, day: 1 }).ok, false);
  assert.equal(makeChart({ name: '엄마', year: 1990, month: 2, day: 30 }).ok, false);
  const m = makeChart({ name: '엄마', relation: '가족', year: 1962, month: 3, day: 4, time: '', gender: 'female' }, 1);
  assert.ok(m.ok); assert.equal(m.chart.timeUnknown, true);
  let st = addChart(emptyCharts(), m.chart).store;
  assert.equal(st.sel, m.chart.id);
  for (let i = 0; i < CHART_LIMIT + 3; i++) { const r = addChart(st, { ...m.chart, id: `x${i}` }); st = r.store; }
  assert.equal(st.list.length, CHART_LIMIT);
  st = removeChart(st, st.sel);
  assert.equal(st.sel, 'me');
});

console.log(`${pass} passed`);
