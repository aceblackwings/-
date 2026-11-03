import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { weekOf } from '../js/period.js';
import { weekWealth, luckyNumbers, ageOn, SAFETY_LINES, BANNED_WORDS, MIN_AGE } from '../js/wealthweek.js';
import { makeBackup, parseBackup, backupText, backupFileName, PREFIX } from '../js/backup.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const s = computeSaju({ year: 1990, month: 5, day: 15, hour: 9, minute: 0 });
const today = { year: 2026, month: 11, day: 4 };
const week = weekOf(s, today, 'female');
const ctx = { birth: { year: 1990, month: 5, day: 15 }, today, yongsin: s.yongsin, seed: 'p1' };

t('재물 흐름 = 이번 주 재물 점수와 같은 값, 가장 좋은 날', () => {
  const w = weekWealth(week, ctx);
  assert.deepEqual(w.days.map((d) => d.score), week.days.map((d) => d.scores.wealth));
  assert.equal(w.best.score, Math.max(...w.days.map((d) => d.score)));
  assert.ok(w.tip.length > 10);
});

t('행운 숫자: 1~45 서로 다른 6개, 오름차순, 다시 계산해도 같음, 용신 수 2개 이상', () => {
  const a = weekWealth(week, ctx).numbers; const b = weekWealth(week, ctx).numbers;
  assert.deepEqual(a, b);
  assert.equal(new Set(a).size, 6);
  assert.ok(a.every((n) => n >= 1 && n <= 45));
  assert.deepEqual(a, [...a].sort((x, y) => x - y));
  for (let el = 0; el < 5; el++) {
    const n = luckyNumbers(`x${el}`, el); const digits = [[3, 8], [2, 7], [5, 0], [4, 9], [1, 6]][el];
    assert.ok(n.filter((v) => digits.includes(v % 10)).length >= 2, `오행 ${el}`);
  }
  assert.notDeepEqual(luckyNumbers('p1|a', 0), luckyNumbers('p2|a', 0), '사람마다 다름');
});

t('만 19세 미만이면 숫자를 숨김 (생일 전후 구분)', () => {
  assert.equal(ageOn({ year: 2007, month: 12, day: 1 }, today), 18);
  assert.equal(ageOn({ year: 2007, month: 11, day: 4 }, today), 19);
  const young = weekWealth(week, { ...ctx, birth: { year: 2010, month: 1, day: 1 } });
  assert.equal(young.eligible, false); assert.equal(young.numbers, null);
  assert.equal(MIN_AGE, 19);
});

t('안전 문구: 무작위 추첨 안내와 1336, 금지 표현 없음', () => {
  const all = SAFETY_LINES.join(' ') + weekWealth(week, ctx).tip;
  assert.ok(all.includes('무작위 추첨')); assert.ok(all.includes('1336'));
  for (const w of BANNED_WORDS) assert.ok(!all.includes(w), w);
});

t('백업: 앱 키만 담고, 다시 읽으면 같은 값으로 복원', () => {
  const store = { [`${PREFIX}profile`]: JSON.stringify({ year: 1990 }), [`${PREFIX}records`]: JSON.stringify({ days: { '2026-11-2': { score: 70 } }, items: [] }), [`${PREFIX}raw`]: 'not-json', other: 'x' };
  const b = makeBackup(store, new Date('2026-11-02T10:00:00Z'));
  assert.equal(b.count, 3); assert.ok(!('other' in b.data));
  assert.equal(backupFileName(b), 'zodiac12-backup-2026-11-02.json');
  const r = parseBackup(backupText(b));
  assert.ok(r.ok); assert.equal(r.count, 3); assert.ok(r.hasProfile);
  assert.deepEqual(JSON.parse(r.entries[`${PREFIX}records`]), JSON.parse(store[`${PREFIX}records`]));
  assert.equal(r.entries[`${PREFIX}raw`], 'not-json');
});

t('백업: 잘못된 내용은 이유와 함께 거절, 수상한 키는 버림', () => {
  assert.equal(parseBackup('').ok, false);
  assert.equal(parseBackup('{oops').ok, false);
  assert.equal(parseBackup(JSON.stringify({ app: 'other', data: {} })).ok, false);
  assert.equal(parseBackup(JSON.stringify({ app: '12지신강림', version: 99, data: { [`${PREFIX}a`]: 1 } })).ok, false);
  const r = parseBackup(JSON.stringify({ app: '12지신강림', version: 1, data: { [`${PREFIX}ok`]: 1, [`${PREFIX}bad key<`]: 1, evil: 1 } }));
  assert.ok(r.ok); assert.deepEqual(Object.keys(r.entries), [`${PREFIX}ok`]); assert.equal(r.hasProfile, false);
});

console.log(`${pass} passed`);
