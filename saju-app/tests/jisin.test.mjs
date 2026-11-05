// v0.52 지신 밥 주기·빠른 성장
import assert from 'node:assert/strict';
import { feed, seedFood, emptyFood, stageForPoints, growthOf, todayBowls, fedDays, emotesUnlocked, decorCount, conditionOf, STAGE_POINTS, DAY_POINTS, daysLeft } from '../js/jisin.js';
let pass = 0; const t = (n, f) => { f(); pass++; console.log('ok -', n); };
const dk = (i) => { const d = new Date(2026, 10, 1 + i); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const run = (days, bowls) => { let s = emptyFood(); const keys = ['morning', 'snack', 'dinner'].slice(0, bowls); for (let i = 0; i < days; i++) for (const k of keys) s = feed(s, dk(i), k).store; return s; };
t('하루 점수: 한 그릇 2 · 두 그릇 3 · 세 그릇 4, 같은 그릇은 한 번만', () => {
  let s = emptyFood(); let r = feed(s, '2026-11-5', 'morning'); assert.equal(r.gained, 2); s = r.store;
  r = feed(s, '2026-11-5', 'morning'); assert.ok(r.already); assert.equal(r.store.points, 2);
  s = feed(s, '2026-11-5', 'snack').store; r = feed(s, '2026-11-5', 'dinner'); assert.ok(r.full); assert.equal(r.store.points, 4);
  assert.deepEqual(todayBowls(r.store, '2026-11-5').map((b) => b.done), [true, true, true]);
});
t('세 그릇씩: 첫날 2단계 · 3일 3단계 · 7일 4단계 · 14일 안에 5단계 · 약 60일에 14단계', () => {
  assert.equal(stageForPoints(run(1, 3).points), 2);
  assert.equal(stageForPoints(run(3, 3).points), 3);
  assert.equal(stageForPoints(run(7, 3).points), 4);
  assert.equal(stageForPoints(run(14, 3).points), 5);
  assert.equal(stageForPoints(run(13, 3).points), 5);
  assert.equal(stageForPoints(run(60, 3).points), 14);
});
t('한 그릇씩만 와도 5단계까지 약 26일', () => {
  assert.ok(stageForPoints(run(25, 1).points) < 5); assert.equal(stageForPoints(run(26, 1).points), 5);
});
t('예전 사용자: 기운 카드 누적 일수 × 4점(한 번만) → 진화가 뒤로 가지 않음', () => {
  const s = seedFood(null, 10); assert.equal(s.points, 40); assert.equal(seedFood(s, 10).points, 40);
  assert.ok(stageForPoints(40) >= 4);
});
t('성장 막대·꾸밈·표정·컨디션', () => {
  const g = growthOf(31); assert.equal(g.stage, 4); assert.equal(g.next, 5); assert.equal(g.left, STAGE_POINTS[5] - 31); assert.ok(g.ratio > 0 && g.ratio < 1);
  assert.equal(daysLeft(21), 6); assert.equal(decorCount(0), 0); assert.equal(decorCount(0.99), 4);
  assert.equal(growthOf(9999).next, null);
  assert.equal(emotesUnlocked(0), 1); assert.equal(emotesUnlocked(3), 2); assert.equal(emotesUnlocked(100), 8);
  assert.equal(fedDays(run(5, 1)), 5);
  assert.equal(conditionOf(85).mood, 'excited'); assert.equal(conditionOf(30).mood, 'sleepy');
  assert.deepEqual(DAY_POINTS, [0, 2, 3, 4]);
});
console.log(`jisin: ${pass} passed`);
