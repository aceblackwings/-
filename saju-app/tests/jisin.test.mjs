// v0.52 지신 밥 주기·빠른 성장
import assert from 'node:assert/strict';
import { secondUnlocked, recommendSecond, adoptSecond, secondPoints, secondStage, duoScene, DUO_SCENES, DUO_FULL, cleanName, SECOND_UNLOCK, BRANCH_EL } from '../js/jisin.js';
import { josaProblems } from '../js/josa.js';
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
t('두 번째 지신: 5단계에 열림 · 데려온 뒤 밥 점수 × 1.5 · 바로 2단계부터', () => {
  assert.equal(SECOND_UNLOCK, 5); assert.ok(!secondUnlocked(4)); assert.ok(secondUnlocked(5)); assert.ok(secondUnlocked(14));
  const sec = adoptSecond({ branch: 1, name: '엄마<b>!', dateKey: '2026-11-5', totalPoints: 52 });
  assert.equal(sec.name, '엄마b'); assert.equal(sec.element, BRANCH_EL[1]); assert.equal(sec.base, 52);
  assert.equal(secondPoints(sec, 52), 0); assert.equal(secondStage(sec, 52), 1);
  assert.equal(secondPoints(sec, 56), 6); assert.equal(secondStage(sec, 56), 2);
  // 세 그릇씩이면 5단계까지 약 9일(큰 지신 14일보다 빠름)
  let d = 0; while (secondStage(sec, 52 + d * 4) < 5) d++; assert.ok(d <= 10, `${d}일`);
  assert.equal(secondPoints(null, 100), 0);
  assert.throws(() => adoptSecond({ branch: 12, dateKey: 'x' }));
  assert.equal(cleanName('일이삼사오육칠'), '일이삼사오육');
});
t('두 번째 지신 추천: 내 띠 제외 · 육합 먼저 · 최대 5 · 문장 조사', () => {
  for (let me = 0; me < 12; me++) for (let y = 0; y < 5; y++) {
    const r = recommendSecond(me, y);
    assert.ok(r.length >= 3 && r.length <= 5); assert.ok(r.every((x) => x.branch !== me));
    assert.equal(new Set(r.map((x) => x.branch)).size, r.length);
    assert.equal(r[0].tags[0], '찰떡 짝꿍');
    for (const x of r) assert.deepEqual(josaProblems(x.why), []);
  }
  assert.equal(recommendSecond(0, 1)[0].branch, 1); // 쥐 ↔ 소
  assert.equal(duoScene('2026-11-5', 3), DUO_FULL);
  const seen = new Set(); for (let i = 0; i < 30; i++) seen.add(duoScene(dk(i), 1)); assert.ok(seen.size >= 5);
  for (const l of [...DUO_SCENES, DUO_FULL]) assert.deepEqual(josaProblems(l), []);
});
console.log(`jisin: ${pass} passed`);
