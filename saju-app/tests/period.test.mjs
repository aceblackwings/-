import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { computeFortune } from '../js/fortune.js';
import { scoreParts, computeDaewoon, daewoonAt, SCORE_BASE } from '../js/luck.js';
import { layersAt, datePillars, monthPeriod, weekOf, yearOf, sajuYearOf, monthDays, TEN_GOD_MOD, LAYER_WEIGHT, NEG_MOD_WEIGHT, dayScores } from '../js/period.js';
let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const s = computeSaju({ year: 1998, month: 5, day: 20, hour: 9, minute: 30 });
const D = { year: 2026, month: 11, day: 2 };
const births = [];
for (let y = 1955; y <= 2008; y += 6) for (let m = 1; m <= 12; m += 4) births.push(computeSaju({ year: y, month: m, day: (y + m) % 27 + 1, hour: (y * m) % 24, minute: 10 }));

t('같은 사람·같은 날짜는 언제 봐도 같은 점수 (무작위 몫 없음)', () => {
  for (const b of births) {
    const a = computeFortune(b, D, { gender: 'male' }); const c = computeFortune(b, D, { gender: 'male' });
    assert.deepEqual(a.scores, c.scores); assert.equal(a.why, c.why);
  }
});
t('위 층이 아래 층에 스며듦: 올해=세운70%+대운30%, 이달=월운60%+올해40%, 오늘=일진70%+이달30%', () => {
  for (const b of births) for (const g of ['male', 'female', undefined]) {
    const L = layersAt(b, D, g);
    if (L.daewoon) assert.equal(L.year.score, Math.round((7 * L.year.base + 3 * L.daewoon.score) / 10));
    else assert.equal(L.year.score, L.year.base);
    assert.equal(L.month.score, Math.round((6 * L.month.base + 4 * L.year.score) / 10));
    assert.equal(L.day.score, Math.round((7 * L.day.base + 3 * L.month.score) / 10));
  }
});
t('오늘 총운 = 오늘 층 + 십신 보정 + 합·충 (근거와 점수가 같은 계산)', () => {
  for (const b of births) {
    const f = computeFortune(b, D, { gender: 'female' });
    const rel = f.relations.reduce((a, r) => a + (r.type === 'combine' ? 4 : -3) * (r.pillar === 'day' ? 1.5 : 1), 0);
    const mod = TEN_GOD_MOD[f.tenGod][0]; const m = mod < 0 ? mod * NEG_MOD_WEIGHT : mod;
    const want = Math.round(Math.max(5, Math.min(98, f.layers.day.score + m + rel)));
    assert.equal(f.scores.total, want);
  }
});
t('점수 근거(parts)의 합 = 기본 점수 (범위 안일 때)', () => {
  for (const b of births) {
    const p = datePillars(D).day; const sp = scoreParts(b, p);
    const raw = Math.round(SCORE_BASE + sp.parts.reduce((a, x) => a + x.delta, 0));
    if (raw > 30 && raw < 95) assert.equal(sp.score, raw);
  }
});
t('대운은 luck.js 대운표와 같은 값', () => {
  const dw = daewoonAt(computeDaewoon(s, 'female'), D.year - s.input.year);
  const L = layersAt(s, D, 'female');
  assert.equal(L.daewoon.score, dw.score); assert.equal(L.daewoon.startAge, dw.startAge);
});
t('절기월: 2026 입동(11/7) 전은 한로월, 입동부터 12/6까지 해월', () => {
  assert.equal(monthPeriod({ year: 2026, month: 11, day: 6 }).term, '한로');
  const p = monthPeriod({ year: 2026, month: 11, day: 7 });
  assert.equal(p.term, '입동'); assert.deepEqual([p.start.month, p.start.day, p.end.month, p.end.day], [11, 7, 12, 6]);
  assert.equal(datePillars({ year: 2026, month: 11, day: 7 }).month.branch, 11); // 亥
  assert.equal(monthPeriod({ year: 2027, month: 1, day: 2 }).term, '대설'); // 소한 전
});
t('2020~2030년 모든 절입일(132개): 그날부터 새 월주, monthPeriod 시작일과 일치', () => {
  const add = (d, n) => { const x = new Date(Date.UTC(d.year, d.month - 1, d.day + n)); return { year: x.getUTCFullYear(), month: x.getUTCMonth() + 1, day: x.getUTCDate() }; };
  let n = 0;
  for (let y = 2020; y <= 2030; y++) for (let m = 1; m <= 12; m++) {
    const start = monthPeriod({ year: y, month: m, day: 20 }).start;
    const prev = add(start, -1);
    assert.notDeepEqual(datePillars(start).month, datePillars(prev).month, `${y}-${m}`);
    assert.deepEqual(monthPeriod(start).start, start); assert.notDeepEqual(monthPeriod(prev).start, start);
    n++;
  }
  assert.equal(n, 132);
});
t('입춘 기준 해: 2026 입춘(2/4) 전날은 을사년, 입춘부터 병오년', () => {
  const before = datePillars({ year: 2026, month: 2, day: 3 }).year; const after = datePillars({ year: 2026, month: 2, day: 4 }).year;
  assert.deepEqual([before.stem, before.branch], [1, 5]); assert.deepEqual([after.stem, after.branch], [2, 6]);
  assert.equal(sajuYearOf({ year: 2026, month: 2, day: 3 }), 2025); assert.equal(sajuYearOf({ year: 2026, month: 2, day: 4 }), 2026);
});
t('이번 주는 월~일 7일, 각 날 점수 = 그날 오늘 운세 총운', () => {
  const w = weekOf(s, D, 'female');
  assert.equal(w.days.length, 7); assert.deepEqual([w.days[0].date.month, w.days[0].date.day], [11, 2]); // 2026-11-02 월요일
  const today = w.days.find((d) => d.isToday);
  assert.equal(today.score, computeFortune(s, D, { gender: 'female' }).scores.total);
  for (const d of w.days) assert.equal(d.score, computeFortune(s, d.date, { gender: 'female' }).scores.total);
  assert.ok(w.best.score >= w.avg && w.worst.score <= w.avg);
});
t('올해 12절기월: 입춘부터 시작하고 각 달 점수 = 그 달 중순의 이달 층', () => {
  const y = yearOf(s, 2026, 'female');
  assert.equal(y.months.length, 12); assert.equal(y.months[0].term, '입춘'); assert.equal(y.months[11].term, '소한');
  const m = y.months[9]; // 입동월
  assert.equal(m.term, '입동');
  assert.equal(m.score, layersAt(s, { year: 2026, month: 11, day: 17 }, 'female').month.score);
  assert.equal(y.best.length, 3);
});
t('점수 분포(v0.22 눈금): 평균 60점 이상, 80점 이상 < 18%, 50점 미만은 가끔(0~6%), 매일 변화가 있음', () => {
  const all = [];
  for (const b of births) for (let d = 0; d < 365; d += 5) {
    const dt = new Date(Date.UTC(2026, 0, 1 + d));
    all.push(computeFortune(b, { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() }, { gender: 'male' }).scores.total);
  }
  const n = all.length; const mu = all.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(all.reduce((a, b) => a + (b - mu) ** 2, 0) / n);
  assert.ok(sd >= 8 && sd <= 16, `sd ${sd}`);
  assert.ok(mu >= 60, `mean ${mu}`);
  assert.ok(all.filter((x) => x >= 80).length / n < 0.18);
  const low = all.filter((x) => x < 50).length / n;
  assert.ok(low > 0 && low <= 0.06, `under 50 ${low}`);
});
console.log(`\n${pass} passed`);
import { fiveYearForecast } from '../js/luck.js';
t('5년 흐름의 올해 기본값 = 층 엔진의 올해 점수 (화면 사이 일관성)', () => {
  for (const b of births) for (const g of ['male', 'female']) {
    const fc = fiveYearForecast(b, g, { year: 2026, month: 11, day: 2 }, 0, 1);
    for (const row of fc) assert.equal(row.base, layersAt(b, { year: row.year, month: 7, day: 1 }, g).year.score, `${row.year}`);
  }
});
t('이달의 날짜: 절기월 전체(입동월 30일), 좋은 날·조심할 날은 그날 총운', () => {
  const m = monthDays(s, { year: 2026, month: 11, day: 10 }, 'female');
  assert.equal(m.period.term, '입동'); assert.equal(m.days.length, 30);
  for (const d of [...m.best, ...m.caution]) assert.equal(d.score, computeFortune(s, d.date, { gender: 'female' }).scores.total);
  assert.ok(m.best[0].score >= m.best[2].score && m.caution[0].score <= m.caution[1].score);
});
t('점수 눈금(v0.22): 평균 60점 이상, 50점 밑은 드물게', () => {
  const day = []; const yr = [];
  // v0.37 지장간 반영 뒤 50점 미만이 약 0.7%라 표본을 넓혀 셈(1950~2009년생 240명 × 30일)
  const wide = [];
  for (let y = 1950; y < 2010; y += 3) for (let m = 1; m <= 12; m += 1) wide.push(computeSaju({ year: y, month: m, day: 10, hour: 9, minute: 0 }));
  for (const b of wide) for (let k = 0; k < 30; k++) {
    const d = { year: 2026, month: 1 + (k % 12), day: 1 + ((k * 7) % 28) };
    const { L, scores } = dayScores(b, d, 'female');
    day.push(scores.total); yr.push(L.year.score);
  }
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const low = (a) => a.filter((x) => x < 50).length / a.length;
  assert.ok(mean(day) >= 60, `오늘 평균 ${mean(day)}`);
  assert.ok(mean(yr) >= 60, `올해 평균 ${mean(yr)}`);
  assert.ok(low(day) > 0.002 && low(day) <= 0.06, `오늘 50점 미만 비율 ${low(day)}`);
  assert.ok(low(yr) <= 0.08, `올해 50점 미만 비율 ${low(yr)}`);
});
console.log(`${pass} passed (with 5-year check)`);
