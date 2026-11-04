import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { drawKiCard, todayKiCard, stageForDays, nextStage, lackElements, pickElement, pickRarity, kiCardText, LACK_RATE, DAY_STAGES } from '../js/dailycard.js';
let pass = 0; const t = (n, fn) => { fn(); pass++; console.log('ok -', n); };
const S = computeSaju({ year: 1990, month: 5, day: 20, hour: 9, minute: 30, timeKnown: true });
const key = (i) => { const d = new Date(Date.UTC(2026, 0, 1 + i)); return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`; };

t('하루 한 장, 같은 날 다시 뽑아도 같은 카드', () => {
  const a = drawKiCard(null, S, 'p', key(0)); assert.ok(a.isNew);
  const b = drawKiCard(a.store, S, 'p', key(0)); assert.ok(!b.isNew); assert.deepEqual(b.card, a.card);
  assert.equal(b.store.total, 1); assert.deepEqual(todayKiCard(b.store, key(0)), a.card);
  assert.deepEqual(drawKiCard(null, S, 'p', key(0)).card, a.card, '같은 사람·날짜는 결정적');
});
t('부족한 기운 약 80% · 다른 기운도 가끔(사용자 결정)', () => {
  const lack = new Set(lackElements(S).map((x) => x.element));
  assert.ok(lack.has(S.yongsin) && lack.has(S.weakest));
  let n = 0; let other = 0; const N = 3000;
  for (let i = 0; i < N; i++) { const c = drawKiCard(null, S, `u${i}`, key(i % 300)).card; if (lack.has(c.element)) n++; else other++; assert.equal(c.lack, lack.has(c.element)); }
  if (lack.size < 5) { assert.ok(Math.abs(n / N - LACK_RATE) < 0.04, `부족 비율 ${n / N}`); assert.ok(other > 0); }
  assert.equal(pickElement(S, 0.1, 0).element, S.yongsin, '첫 비중은 용신');
});
t('연속 3일부터 등급 한 단계, 7일마다 부적', () => {
  assert.equal(pickRarity(0, 0), 'common'); assert.equal(pickRarity(0, 3), 'rare'); assert.equal(pickRarity(0.999, 9), 'myth');
  let s = null; let c;
  for (let i = 0; i < 7; i++) ({ store: s, card: c } = drawKiCard(s, S, 'p', key(i)));
  assert.equal(s.streak.count, 7); assert.ok(c.charm); assert.equal(s.total, 7);
});
t('하루 놓치면 연속만 다시 시작, 누적은 그대로', () => {
  let s = null;
  for (let i = 0; i < 5; i++) s = drawKiCard(s, S, 'p', key(i)).store;
  s = drawKiCard(s, S, 'p', key(7)).store;
  assert.equal(s.streak.count, 1); assert.equal(s.streak.lost, 5); assert.equal(s.streak.best, 5); assert.equal(s.total, 6);
});
t('진화 = 누적 접속 일수', () => {
  assert.equal(stageForDays(0), 1); assert.equal(stageForDays(2), 1); assert.equal(stageForDays(3), 2);
  assert.equal(stageForDays(7), 3); assert.equal(stageForDays(30), 5); assert.equal(stageForDays(999), 14);
  assert.deepEqual(nextStage(5), { stage: 3, days: 7, left: 2 }); assert.equal(nextStage(200), null);
  assert.equal(nextStage(5, 4).stage, 5, '이미 더 진화했으면 그다음 단계');
  assert.ok(Object.values(DAY_STAGES).every((d, i, a) => !i || d > a[i - 1]));
});
t('카드 글: 이름·이유·행동', () => {
  const c = drawKiCard(null, S, 'p', key(0)).card; const x = kiCardText(c, S);
  assert.ok(x.name && x.why && x.message && x.action);
  assert.ok(!/나쁜 날|최악|불길/.test(x.why + x.message));
});
console.log(`dailycard: ${pass} passed`);
