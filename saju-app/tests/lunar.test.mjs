import assert from 'node:assert/strict';
import { lunarToSolar, solarToLunar, leapMonthOf, lunarMonthDays, dateToJdn, jdnToDate } from '../js/lunar.js';
import { computeSaju, pillarLabel } from '../js/saju.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const ymd = (r) => `${r.year}-${r.month}-${r.day}`;

t('설날 (음력 1월 1일)', () => {
  const seol = { 1990: '1990-1-27', 2000: '2000-2-5', 2010: '2010-2-14', 2020: '2020-1-25', 2023: '2023-1-22', 2024: '2024-2-10', 2025: '2025-1-29', 2026: '2026-2-17' };
  for (const [y, e] of Object.entries(seol)) assert.equal(ymd(lunarToSolar(+y, 1, 1)), e, `${y}`);
});
t('추석 (음력 8월 15일)', () => {
  assert.equal(ymd(lunarToSolar(2023, 8, 15)), '2023-9-29');
  assert.equal(ymd(lunarToSolar(2024, 8, 15)), '2024-9-17');
  assert.equal(ymd(lunarToSolar(2025, 8, 15)), '2025-10-6');
});
t('윤달 (한국천문연구원 기준)', () => {
  const leaps = { 2012: [3, '2012-4-21'], 2014: [9, '2014-10-24'], 2017: [5, '2017-6-24'], 2020: [4, '2020-5-23'], 2023: [2, '2023-3-22'], 2025: [6, '2025-7-25'] };
  for (const [y, [m, d]] of Object.entries(leaps)) {
    assert.equal(leapMonthOf(+y), m, `${y} 윤달`);
    assert.equal(ymd(lunarToSolar(+y, m, 1, true)), d, `${y} 윤${m}월 1일`);
  }
  assert.equal(leapMonthOf(2024), 0);
});
t('없는 날짜는 오류', () => {
  assert.ok(lunarToSolar(2024, 4, 1, true).error);
  const m = lunarMonthDays(2024, 1);
  assert.ok(m === 29 || m === 30);
  if (m === 29) assert.ok(lunarToSolar(2024, 1, 30).error);
});
t('JDN 변환 왕복', () => {
  for (const d of [[1900, 1, 1], [2000, 2, 29], [2100, 12, 31]]) assert.deepEqual(Object.values(jdnToDate(dateToJdn(...d))).sort(), d.slice().sort());
});
t('1901~2099년 모든 날짜 양력→음력→양력 왕복, 달 길이와 윤달 빈도', () => {
  let leapYears = 0;
  for (let y = 1901; y <= 2099; y++) if (leapMonthOf(y)) leapYears++;
  // 19년에 7번 꼴: 199년이면 약 73회
  assert.ok(leapYears >= 70 && leapYears <= 76, `윤달 ${leapYears}회`);
  let jdn = dateToJdn(1901, 3, 1);
  const end = dateToJdn(2099, 10, 1);
  for (; jdn < end; jdn++) {
    const s = jdnToDate(jdn);
    const l = solarToLunar(s.year, s.month, s.day);
    assert.ok(l, ymd(s));
    const back = lunarToSolar(l.year, l.month, l.day, l.leap);
    assert.equal(ymd(back), ymd(s));
    const days = lunarMonthDays(l.year, l.month, l.leap);
    assert.ok(days === 29 || days === 30);
  }
});
t('음력 생일로 사주 계산', () => {
  const s = lunarToSolar(1992, 7, 19);
  assert.equal(ymd(s), '1992-8-17');
  const saju = computeSaju({ ...s, hour: 14, minute: 30 });
  assert.equal(pillarLabel(saju.pillars.day), '乙丑');
});
t('UTC+8:30 시기(1955년)에는 경도 보정 0분', () => {
  const a = computeSaju({ year: 1955, month: 3, day: 25, hour: 23, minute: 10 }) // 서머타임(5/5~) 전;
  assert.equal(a.utcOffset, 8.5);
  assert.equal(a.pillars.hour.branch, 0); // 23:10 그대로 子시
});
console.log(`\n${pass} passed`);
