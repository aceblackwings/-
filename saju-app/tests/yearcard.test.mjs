import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { yearOf } from '../js/period.js';
import { YEAR_HEADLINE, yearCard, stars, seasonsOf, keyMonths, friendlyZodiac, monthRange, savePledge, pledgeReviewDue, reviewPledge, PLEDGE_MAX } from '../js/yearcard.js';
import { GOD_READING } from '../js/reading.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const s = computeSaju({ year: 1990, month: 5, day: 15, hour: 9, minute: 30 });
const y = yearOf(s, 2027, 'female'); const now = yearOf(s, 2026, 'female');
const c = yearCard(y, now, s);

t('십신 10가지 모두 그해 이름과 키워드 3개', () => {
  for (const g of Object.keys(GOD_READING)) { assert.ok(YEAR_HEADLINE[g].title.endsWith('해'), g); assert.equal(YEAR_HEADLINE[g].tags.length, 3); }
});

t('한 줄 총평·키워드·점수는 yearOf 값 그대로', () => {
  assert.equal(c.year, 2027); assert.equal(c.score, y.year.score); assert.equal(c.god, y.year.god);
  assert.ok(c.summary.startsWith('2027년은 「'));
  assert.equal(c.diff, y.year.score - now.year.score);
});

t('분야별 연간운 5칸: 별은 점수 구간과 일치', () => {
  assert.equal(c.fields.length, 5);
  for (const f of c.fields) { assert.equal(f.stars, stars(f.score)); assert.ok(f.line.length > 5); }
  assert.deepEqual([stars(75), stars(65), stars(55), stars(45), stars(44)], [5, 4, 3, 2, 1]);
  assert.ok(keyMonths(y)[2].line.includes('. 큰 지출'), '문장 사이 마침표');
});

t('사계절 4칸: 12달을 3달씩, 가장 좋은 계절은 하나', () => {
  const ss = seasonsOf(y.months);
  assert.deepEqual(ss.map((x) => x.months), [[2, 3, 4], [5, 6, 7], [8, 9, 10], [11, 12, 1]]);
  assert.equal(ss.filter((x) => x.tone === 'best').length, 1);
  const best = ss.find((x) => x.tone === 'best'); assert.equal(best.score, Math.max(...ss.map((x) => x.score)));
});

t('꼭 기억할 달 3개: 좋은 달 2 + 조심할 달 1, 기간 표기', () => {
  const k = keyMonths(y);
  assert.deepEqual(k.map((x) => x.kind), ['good', 'good', 'caution']);
  assert.equal(k[0].month, y.best[0].solarMonth);
  assert.match(monthRange(y.months, 0), /^2\/\d+~3\/\d+$/);
  assert.match(monthRange(y.months, 11), /^1\/\d+~$/);
});

t('힘이 되는 띠: 육합 + 삼합 (쥐 → 소·원숭이, 말 → 양·호랑이)', () => {
  assert.deepEqual(friendlyZodiac(0), ['소', '원숭이']);
  assert.deepEqual(friendlyZodiac(6), ['양', '호랑이']);
  assert.equal(c.luck.zodiac.length, 2); assert.equal(c.luck.numbers.length, 2);
});

t('다짐: 저장·길이 제한, 12월에만 돌아보기, 한 번 답하면 끝', () => {
  let p = savePledge({}, 2027, '  매일 30분 걷기  ').store;
  assert.equal(p[2027].text, '매일 30분 걷기');
  assert.equal(savePledge(p, 2027, '   ').ok, false);
  assert.equal(savePledge({}, 2027, 'x'.repeat(100)).store[2027].text.length, PLEDGE_MAX);
  assert.equal(pledgeReviewDue(p, { year: 2027, month: 11, day: 30 }), null);
  assert.deepEqual(pledgeReviewDue(p, { year: 2027, month: 12, day: 1 }), { year: 2027, text: '매일 30분 걷기' });
  p = reviewPledge(p, 2027, 'half');
  assert.equal(pledgeReviewDue(p, { year: 2027, month: 12, day: 2 }), null);
});

console.log(`${pass} passed`);
