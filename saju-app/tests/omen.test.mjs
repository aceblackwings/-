// v0.54 오늘의 작은 예언 · 내일 맛보기
import assert from 'node:assert/strict';
import { omenOf, checkable, markOmen, markShown, omenStats, markPeek, peekedFor, tomorrowTeaser, shiftDay, CHECK_HOUR } from '../js/omen.js';
import { josaProblems } from '../js/josa.js';
import { computeSaju } from '../js/saju.js';
import { computeFortune } from '../js/fortune.js';
let pass = 0; const t = (n, f) => { f(); pass++; console.log('ok -', n); };
const BANNED = /나쁜|최악|불길|흉|재앙|사고|조심하지 않으면/;

t('날짜 앞뒤', () => {
  assert.equal(shiftDay('2026-12-31', 1), '2027-1-1');
  assert.equal(shiftDay('2026-3-1', -1), '2026-2-28');
});
t('예언: 같은 사람·같은 날은 같은 문장 · 네 종류 고루 · 조사·금지어 없음', () => {
  const kinds = new Set();
  for (const [y, m, d] of [[1990, 5, 14], [1975, 11, 2], [2001, 1, 30], [1962, 8, 8]]) {
    const s = computeSaju({ calendar: 'solar', year: y, month: m, day: d, hour: 9, minute: 30 });
    for (let i = 0; i < 60; i++) {
      const dt = new Date(Date.UTC(2026, 10, 1 + i));
      const f = computeFortune(s, { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() });
      const o = omenOf(f, `k${y}`); kinds.add(o.kind);
      assert.deepEqual(omenOf(f, `k${y}`), o);
      assert.deepEqual(josaProblems(o.text), [], o.text);
      assert.ok(!BANNED.test(o.text), o.text);
      assert.ok(/좋은 신호예요\. .+요\.$/.test(o.text), o.text);
      assert.ok(!/색색|\(/.test(o.text), o.text);
    }
  }
  assert.equal(kinds.size, 4);
});
t('확인: 17시 전엔 기다림 · 17시부터 오늘 · 본 적 있는 어제 예언은 다음 날 묻기', () => {
  let st = markShown({}, '2026-11-5');
  let c = checkable(st, '2026-11-5', CHECK_HOUR - 1); assert.ok(c.todayWait && !c.today);
  c = checkable(st, '2026-11-5', CHECK_HOUR); assert.ok(c.today);
  c = checkable(st, '2026-11-6', 8); assert.equal(c.yesterday, '2026-11-5');
  assert.equal(checkable({}, '2026-11-6', 8).yesterday, null); // 보지 않은 예언은 묻지 않음
  const r = markOmen(st, '2026-11-5', 'yes'); assert.equal(r.reward, 1); st = r.store;
  assert.ok(markOmen(st, '2026-11-5', 'no').already);
  assert.equal(markOmen(st, '2026-11-6', 'no').reward, 0);
  assert.equal(checkable(st, '2026-11-6', 8).yesterday, null);
  assert.equal(checkable(st, '2026-11-5', 20).answered, 'yes');
});
t('예언 도장: 월~일 7칸 · 이번 주 맞은 수', () => {
  let st = {}; for (const [k, v] of [['2026-11-2', 'yes'], ['2026-11-3', 'no'], ['2026-11-5', 'yes'], ['2026-10-30', 'yes']]) st = markOmen(st, k, v).store;
  const s = omenStats(st, '2026-11-5'); // 목요일
  assert.equal(s.week.length, 7); assert.equal(s.week[0].key, '2026-11-2'); assert.equal(s.week[6].key, '2026-11-8');
  assert.equal(s.weekHits, 2); assert.equal(s.hits, 3); assert.equal(s.answered, 4);
});
t('내일 맛보기: 봤다고 기록하면 다음 날 「열렸어요」 · 힌트는 오늘과 비교', () => {
  const st = markPeek({}, '2026-11-6');
  assert.ok(peekedFor(st, '2026-11-6')); assert.ok(!peekedFor(st, '2026-11-5'));
  assert.equal(markPeek(st, '2026-11-6'), st);
  assert.match(tomorrowTeaser('제목', 80, 60).hint, /올라와요/);
  assert.match(tomorrowTeaser('제목', 50, 70).hint, /천천히/);
  assert.match(tomorrowTeaser('제목', 66, 64).hint, /비슷한/);
});
console.log(`omen: ${pass} passed`);

// v0.62 행운의 색·숫자 예언은 긁기 전까지 값 숨김
{
  const { omenOf: om } = await import('../js/omen.js');
  const f0 = { dateKey: '2026-11-6', tenGod: '정재', luck: { color: '검정·남색', number: 1, time: '오전 9시~11시' } };
  let seen = 0;
  for (let i = 0; i < 80; i++) {
    const o = om(f0, `p${i}`);
    if (o.kind === 'color' || o.kind === 'number') {
      seen++; assert.ok(o.hidden && !o.hidden.includes('검정') && !/숫자 1/.test(o.hidden), o.hidden);
      assert.deepEqual(josaProblems(o.hidden), []);
    } else assert.equal(o.hidden, null);
  }
  assert.ok(seen > 10);
  console.log('ok - 행운의 색·숫자 예언은 긁기 전 값 숨김');
}
