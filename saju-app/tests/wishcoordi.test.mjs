// v0.57 소원 부적 · 지신 데일리 코디 · 걱정 태우기
import assert from 'node:assert/strict';
import * as W from '../js/wish.js';
import * as C from '../js/coordi.js';
import * as B from '../js/burn.js';
import { josaProblems } from '../js/josa.js';
import { toneProblems } from '../js/habit.js';
import { offerValue } from '../js/charmcare.js';
let pass = 0; const t = (n, f) => { f(); pass++; console.log('ok -', n); };
const rec = (o = {}) => ({ type: 'exam', theme: 'classic', element: 2, rarity: 'rare', dateKey: '2026-11-5', ...o });

t('소원 부적: 붙이기 · 그날 묻기 · 이룸 → 벽 · 미루기', () => {
  const today = '2026-11-5';
  assert.equal(W.cleanWish('  자격증\n 합격 <b> '), '자격증 합격 b');
  assert.equal(W.cleanWish('가'.repeat(50)).length, W.WISH_MAX);
  assert.equal(W.dueFromInput('2026-12-20', today), '2026-12-20');
  assert.equal(W.dueFromInput('2026-11-01', today), null);
  assert.equal(W.dueFromInput('', today), '2026-12-5');
  assert.equal(W.inputOf('2026-12-5'), '2026-12-05');
  assert.equal(W.dueLabel('2026-12-20', today), '12월 20일');
  assert.equal(W.dueLabel('2027-1-5', today), '2027년 1월 5일');
  const r = W.attachWish(rec(), '자격증 합격', '2026-12-20', today);
  assert.equal(r.wish, '자격증 합격'); assert.equal(r.result, null);
  assert.equal(W.attachWish(rec(), '   ', '2026-12-20', today).wish, undefined);
  let col = [rec(), r, W.attachWish(rec({ type: 'love' }), '연락 오기', '2026-12-1', today)];
  assert.equal(W.dueWish(col, '2026-11-30'), null);
  assert.equal(W.dueWish(col, '2026-12-25').i, 2); // 가장 오래 기다린 것부터
  col = W.postpone(col, 2, '2026-12-25', 7);
  assert.equal(col[2].dueKey, '2027-1-1'); assert.equal(col[2].waited, 1);
  assert.equal(W.dueWish(col, '2026-12-25').i, 1);
  col = W.fulfill(col, 1, '2026-12-25');
  assert.equal(col[1].result, 'done'); assert.equal(col[1].doneKey, '2026-12-25');
  assert.deepEqual(W.wallOf(col).map((x) => x.wish), ['자격증 합격']);
  assert.deepEqual(W.waitingOf(col).map((x) => x.wish), ['연락 오기']);
  assert.equal(W.dueWish(col, '2026-12-26'), null);
  // 도감 줄이기: 소원 부적은 남김
  const big = [...Array.from({ length: 70 }, (_, i) => rec({ dateKey: `2026-1-${i}` })), r];
  const kept = W.trimCollection(big, 60);
  assert.equal(kept.length, 61); assert.ok(kept.some((x) => x.wish));
});

t('소원 문장: 조사 · 실망 낱말 없음 · 닭띠 존댓말', () => {
  const r = W.attachWish(rec(), '자격증 합격', '2026-12-20', '2026-11-5');
  const lines = [W.askLine(r, false), W.askLine(r, true), W.madeLine('자격증 합격', '12월 20일', false), W.madeLine('자격증 합격', '12월 20일', true)];
  for (let k = 0; k < 4; k++) { const x = { ...r, waited: k }; lines.push(W.doneLine(x, false), W.doneLine(x, true), W.laterLine(x, '12월 27일', false), W.laterLine(x, '12월 27일', true)); }
  for (const l of [...lines, ...W.ALL_LINES]) {
    assert.deepEqual(josaProblems(l), [], l); assert.deepEqual(toneProblems(l), [], l);
    assert.doesNotMatch(l, /실패|아쉽|안타깝|포기|실망|안 됐|못 이뤘/, l);
  }
  for (const l of [W.askLine(r, true), W.laterLine(r, '12월 27일', true)]) assert.match(l, /요[.?!]?$|요\./);
  assert.match(W.laterLine(r, '12월 27일', false), /조금 더 함께 기다릴게|함께 기다릴게|곁에 있을게/);
});

t('데일리 코디: 행운 오행 하트 · 1~5 · 추천은 5개 · 표정', () => {
  for (let lucky = 0; lucky < 5; lucky++) for (let today = 0; today < 5; today++) {
    const best = C.suggestOutfit(lucky);
    const h = C.coordiHearts(best, lucky, today);
    assert.equal(h.hearts, 5); assert.equal(h.title, '오늘의 찰떡 코디');
    assert.equal(C.coordiHearts({}, lucky, today).hearts, 1); // 빈 코디도 하트 하나
    for (const head of C.WARDROBE.head) for (const neck of C.WARDROBE.neck) {
      const r = C.coordiHearts({ head: head.id, neck: neck.id, hand: C.SEASON_HAND }, lucky, today, { season: true });
      assert.ok(r.hearts >= 1 && r.hearts <= 5);
    }
  }
  // 행운 오행 2 · 낳는 기운 1 · 오늘 기운 1 · 나머지 0
  const it = (el) => ({ el });
  assert.equal(C.itemHearts(it(3), 3, 0), 2);
  assert.equal(C.itemHearts(it(2), 3, 0), 1); // 토생금
  assert.equal(C.itemHearts(it(0), 3, 0), 1); // 오늘 기운
  assert.equal(C.itemHearts(it(1), 3, 0), 0);
  assert.equal(C.coordiHearts({ hand: C.SEASON_HAND }, 3, 0, { season: false }).sum, 0);
  assert.equal(C.MOOD_BY_HEARTS.length, 5);
  for (let n = 1; n <= 5; n++) for (const p of [false, true]) { const l = C.coordiLine(n, p); assert.deepEqual(josaProblems(l), [], l); assert.deepEqual(toneProblems(l), [], l); }
  for (const x of Object.values(C.WARDROBE).flat()) assert.ok(C.itemOf(x.id) === x);
  // 코디 하트는 숫자 점수가 아님
  for (const tt of C.TITLES) assert.doesNotMatch(tt, /점/);
});

t('데일리 코디: 연속 7일마다 조각 1개(같은 날 두 번 안 줌), 끊기면 다시', () => {
  let s = C.emptyCoordi(); const days = ['2026-11-1', '2026-11-2', '2026-11-3', '2026-11-4', '2026-11-5', '2026-11-6', '2026-11-7'];
  let got = 0;
  for (const d of days) { s = C.saveDay(s, d, { head: 'h0' }, 3); const c = C.claimStreak(s, d); s = c.store; if (c.piece) got++; }
  assert.equal(got, 1); assert.equal(C.streakOf(s, '2026-11-7'), 7);
  s = C.saveDay(s, '2026-11-7', { head: 'h1' }, 4); // 같은 날 바꿔 입기
  assert.equal(C.claimStreak(s, '2026-11-7').piece, false); assert.equal(s.streak, 7);
  assert.equal(C.streakOf(s, '2026-11-8'), 7); assert.equal(C.streakOf(s, '2026-11-9'), 0);
  s = C.saveDay(s, '2026-11-10', {}, 1); assert.equal(s.streak, 1);
  assert.ok(Object.keys(s.days).length <= 14);
  // 14일 연속이면 두 번째 조각
  let s2 = C.emptyCoordi(); got = 0;
  for (let i = 1; i <= 14; i++) { const d = `2026-12-${i}`; s2 = C.saveDay(s2, d, {}, 1); const c = C.claimStreak(s2, d); s2 = c.store; if (c.piece) got++; }
  assert.equal(got, 2);
});

t('코디(v0.59): 부위마다 하루 한 번 · 세 부위 다 고르면 별 3=1·4=2·5=3 떡(하루 한 번)', () => {
  const lucky = 1; const today = 3; const D = '2026-11-6';
  const pick = (el) => C.WARDROBE.head.find((x) => x.el === el).id;
  let r = C.pickSlot(null, D, 'head', pick(lucky), lucky, today); assert.equal(r.locked, false); assert.equal(r.done, false);
  assert.equal(C.pickSlot(r.store, D, 'head', pick(0), lucky, today).locked, true, '같은 부위 두 번 안 됨');
  assert.equal(C.claimStars(r.store, D).gained, 0);
  r = C.pickSlot(r.store, D, 'neck', C.WARDROBE.neck.find((x) => x.el === lucky).id, lucky, today);
  r = C.pickSlot(r.store, D, 'hand', C.WARDROBE.hand.find((x) => x.el === lucky).id, lucky, today); assert.ok(r.done);
  const c = C.claimStars(r.store, D); assert.equal(c.stars, 5); assert.equal(c.gained, 3);
  assert.equal(C.claimStars(c.store, D).gained, 0, '하루 한 번');
  assert.deepEqual([1, 2, 3, 4, 5].map((n) => C.STAR_REWARD[n] || 0), [0, 0, 1, 2, 3]);
  assert.ok(C.lockedOn(c.store, '2026-11-7').head === undefined, '다음 날은 다시');
});
t('걱정 태우기: 걱정은 결과에 없음 · 부적 기운 = 바치기 값 · 소원·장착 부적 제외 · 109', () => {
  const col = [rec({ rarity: 'common' }), rec({ rarity: 'epic', dateKey: '2026-11-4' }), { ...rec({ dateKey: '2026-11-3' }), wish: '합격', dueKey: '2026-12-1' }];
  const list = B.burnable(col, [col[0]]);
  assert.deepEqual(list.map((x) => x.i), [1]);
  const res = B.burnResult(col, 1, 2);
  assert.equal(res.collection.length, 2); assert.equal(res.exp, offerValue(col[1], 2));
  assert.ok(!JSON.stringify(res).includes('발표'));
  assert.equal(B.burnResult(col, -1).exp, 0);
  assert.equal(B.cleanWorry('  발표가\n\n 걱정  '), '발표가 걱정');
  assert.equal(B.cleanWorry('가'.repeat(80)).length, B.WORRY_MAX);
  assert.equal(B.needsCare('요즘 죽고 싶다'), true); assert.equal(B.needsCare('발표가 걱정'), false);
  assert.ok(B.CARE_LINES.join(' ').includes('109'));
  for (let k = 0; k < 3; k++) for (const p of [false, true]) { const l = B.takeLine(k, p); assert.match(l, /이 걱정은 (내|제)가 가져갈게/); assert.deepEqual(josaProblems(l), [], l); }
});

t('걱정 태우기: 저장소를 쓰지 않음 · 불길은 끝까지 번짐', async () => {
  const fs = await import('node:fs');
  const src = fs.readFileSync(new URL('../js/burn.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|fetch\(/);
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (const [x, y] of [[20, 50], [0, 0], [39, 51]]) {
    const g = B.makeGrid(40, 52); B.ignite(g, x, y, 1);
    let n = 0;
    while (B.burntShare(g) < B.BURN_DONE && n < 2000) { B.stepFire(g, rnd); if (!B.isBurning(g)) B.rekindle(g); n++; }
    assert.ok(B.burntShare(g) >= B.BURN_DONE, `불길 ${x},${y}`); assert.ok(n < 2000);
  }
});
console.log(`wishcoordi: ${pass} 통과`);
