import assert from 'node:assert/strict';
import { computeSaju, dayPillarIndex, sunLongitude, julianDay, pillarLabel, tenGod, elementScores, analyzeStrength, analyzeJohu } from '../js/saju.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };

t('2000-01-01 일주 = 戊午', () => assert.equal(dayPillarIndex(2000, 1, 1), 54));
t('입춘 2024-02-04 17:27 KST 경계', () => {
  assert.ok(sunLongitude(julianDay(2024, 2, 4, 17 - 9)) < 315);
  assert.ok(sunLongitude(julianDay(2024, 2, 4, 18 - 9)) >= 315);
});
t('1984-02-02 → 癸亥년 (입춘 전)', () => {
  const s = computeSaju({ year: 1984, month: 2, day: 2, hour: 12, minute: 0 });
  assert.equal(pillarLabel(s.pillars.year), '癸亥');
});
t('1984-02-05 → 甲子년 丙寅월', () => {
  const s = computeSaju({ year: 1984, month: 2, day: 5, hour: 12, minute: 0 });
  assert.equal(pillarLabel(s.pillars.year), '甲子');
  assert.equal(pillarLabel(s.pillars.month), '丙寅');
});
t('1990-06-15 → 庚午년 壬午월', () => {
  const s = computeSaju({ year: 1990, month: 6, day: 15, hour: 10, minute: 0 });
  assert.equal(pillarLabel(s.pillars.year), '庚午');
  assert.equal(pillarLabel(s.pillars.month), '壬午');
});
t('대설 이후(12월 25일) = 子월, 소한 이후(1월 10일) = 丑월', () => {
  assert.equal(computeSaju({ year: 2023, month: 12, day: 25 }).pillars.month.branch, 0);
  assert.equal(computeSaju({ year: 2024, month: 1, day: 10 }).pillars.month.branch, 1);
});
t('시주: 甲일 子시 = 甲子시, 午시 = 庚午시', () => {
  // 2000-01-01 戊午일 → 다른 날 찾기: 甲일 = dayIdx%10==0
  let d = 1; while (dayPillarIndex(2000, 1, d) % 10 !== 0) d++;
  const zi = computeSaju({ year: 2000, month: 1, day: d, hour: 0, minute: 40 }); // 보정 후 00:10 → 子시
  assert.equal(pillarLabel(zi.pillars.hour), '甲子');
  const wu = computeSaju({ year: 2000, month: 1, day: d, hour: 12, minute: 30 }); // 보정 후 12:00 → 午시
  assert.equal(pillarLabel(wu.pillars.hour), '庚午');
});
t('23시대(보정 후) early 모드는 다음 날 일주', () => {
  const a = computeSaju({ year: 2000, month: 1, day: 1, hour: 23, minute: 50 });
  assert.equal(a.pillars.day.stem, dayPillarIndex(2000, 1, 2) % 10);
  const b = computeSaju({ year: 2000, month: 1, day: 1, hour: 23, minute: 50, zasiMode: 'late' });
  assert.equal(b.pillars.day.stem, dayPillarIndex(2000, 1, 1) % 10);
  assert.equal(a.pillars.hour.stem, b.pillars.hour.stem);
});
t('경도 보정으로 00:20 출생은 전날 23시대', () => {
  const s = computeSaju({ year: 2000, month: 1, day: 2, hour: 0, minute: 20 });
  assert.equal(s.pillars.hour.branch, 0);
});
t('시간 모름 → 시주 없음, 오행 합계 100', () => {
  const s = computeSaju({ year: 1995, month: 3, day: 3, timeKnown: false });
  assert.equal(s.pillars.hour, null);
  assert.equal(s.elements.reduce((a, b) => a + b), 100);
});
t('십신', () => {
  assert.equal(tenGod(0, 0), '비견');
  assert.equal(tenGod(0, 1), '겁재');
  assert.equal(tenGod(0, 2), '식신');
  assert.equal(tenGod(0, 5), '정재');
  assert.equal(tenGod(0, 6), '편관');
  assert.equal(tenGod(0, 9), '정인');
});
// ---- 조후 (v0.29) ----
// 오행 순서: 0 木 1 火 2 土 3 金 4 水 · 지지: 0 子 1 丑 … 6 午 7 未 … 11 亥
t('조후: 한여름(午월) 물 10% → 급함, 물이 필요', () => {
  const j = analyzeJohu(6, [20, 40, 20, 10, 10]);
  assert.equal(j.level, 'urgent'); assert.equal(j.need, 4); assert.equal(j.season, '한여름');
});
t('조후: 한겨울(子월) 불 20% → 약하게 필요, 불 25% 이상이면 없음', () => {
  assert.equal(analyzeJohu(0, [20, 20, 20, 15, 25]).level, 'mild');
  assert.equal(analyzeJohu(0, [20, 25, 20, 10, 25]).level, 'none');
});
t('조후: 봄·가을 한가운데(卯·酉월)는 조후 없음', () => {
  assert.equal(analyzeJohu(3, [40, 0, 20, 20, 20]).level, 'none');
  assert.equal(analyzeJohu(9, [20, 20, 20, 40, 0]).level, 'none');
});
t('용신: 조후가 급하면 조후 기운이 용신, 억부 용신은 희신', () => {
  // 甲(木) 일간, 午월, 木·火 많음 → 억부는 신강, 조후는 水
  const r = analyzeStrength(0, [35, 35, 15, 10, 5], 6);
  assert.equal(r.johu.level, 'urgent');
  assert.equal(r.yongsin, 4); assert.equal(r.yongsinBasis, '억부·조후 일치');
  // 庚(金) 일간, 午월, 土·金이 약함 → 억부는 신약(土), 조후 水가 우선
  const w = analyzeStrength(6, [25, 40, 10, 15, 10], 6);
  assert.equal(w.strength, '신약'); assert.equal(w.eokbuYongsin, 2);
  assert.equal(w.yongsin, 4); assert.equal(w.heesin, 2); assert.equal(w.yongsinBasis, '조후 우선');
  assert.equal(w.gisin, 2, '기신 = 용신(水)을 극하는 土');
});
t('용신: 조후가 약하게 필요하면 억부 그대로, 조후 기운은 희신', () => {
  const r = analyzeStrength(6, [25, 30, 10, 15, 20], 6);
  assert.equal(r.johu.level, 'mild'); assert.equal(r.yongsin, r.eokbuYongsin); assert.equal(r.heesin, 4);
  assert.equal(r.yongsinBasis, '억부 + 조후 보완');
});
t('용신: 월지를 안 넘기면 예전 억부 결과와 같음(하위 호환)', () => {
  const r = analyzeStrength(0, [35, 35, 15, 10, 5]);
  assert.equal(r.johu.level, 'none'); assert.equal(r.yongsin, r.eokbuYongsin); assert.equal(r.yongsinBasis, '억부');
});
t('computeSaju: 한여름 출생 결과에 조후 정보·근거 문장 포함', () => {
  const s = computeSaju({ year: 1990, month: 7, day: 15, hour: 13, minute: 0 });
  assert.equal(BRANCHES_OF(s), 7); // 未월
  assert.ok(['urgent', 'mild', 'none'].includes(s.johu.level));
  assert.ok(s.johu.text.length > 10);
  assert.ok(s.yongsinBasis);
});
function BRANCHES_OF(s) { return s.pillars.month.branch; }
console.log(`\n${pass} passed`);
