import assert from 'node:assert/strict';
import { emptyGrowth, checkIn, complete, addExp, evolve, levelFromExp, stageForLevel, claimStreakReward, summary } from '../js/growth.js';
let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };

t('레벨 계산', () => {
  assert.equal(levelFromExp(0).level, 1);
  assert.equal(levelFromExp(19).level, 1);
  assert.equal(levelFromExp(20).level, 2);
  assert.equal(stageForLevel(4), 1); assert.equal(stageForLevel(5), 2); assert.equal(stageForLevel(35), 5);
});
t('출석은 하루 한 번, 연속 출석과 보너스', () => {
  let g = emptyGrowth();
  let r = checkIn(g, '2026-11-1'); g = r.growth;
  assert.equal(r.gained, 15); assert.equal(g.streak.count, 1);
  assert.equal(checkIn(g, '2026-11-1').gained, 0);
  r = checkIn(g, '2026-11-2'); g = r.growth;
  assert.equal(g.streak.count, 2); assert.equal(r.gained, 17);
  r = checkIn(g, '2026-11-5'); g = r.growth;
  assert.equal(g.streak.count, 1);
  assert.ok(r.events.some((e) => e.type === 'streak-lost'));
});
t('스트릭 보호 부적은 하루 빠진 날을 지켜 줌', () => {
  let g = emptyGrowth();
  for (let d = 1; d <= 7; d++) g = checkIn(g, `2026-11-${d}`).growth;
  assert.equal(g.streak.count, 7);
  const cr = claimStreakReward(g, 7); g = cr.growth;
  assert.equal(cr.reward.rarity, 'epic'); assert.equal(g.freeze, 1);
  assert.equal(claimStreakReward(g, 7).reward, null);
  const r = checkIn(g, '2026-11-9'); // 8일 빠짐
  assert.equal(r.growth.streak.count, 8); assert.equal(r.growth.freeze, 0);
  assert.ok(r.events.some((e) => e.type === 'freeze-used'));
});
t('퀘스트 중복 방지, 하루 최대 135 EXP', () => {
  let g = emptyGrowth();
  for (const q of ['checkin', 'fortune', 'mission', 'charm', 'equip', 'share', 'compat', 'journey', 'social', 'spot', 'mission']) g = complete(g, '2026-11-1', q).growth;
  assert.equal(g.exp, 135);
  assert.equal(summary(g, '2026-11-1').todayExp, 135);
});
t('진화는 버튼으로, 도달한 단계까지', () => {
  let g = emptyGrowth();
  const r = addExp(g, 2000); g = r.growth;
  assert.ok(r.events.some((e) => e.type === 'can-evolve'));
  assert.equal(g.evolved, 1);
  const ev = evolve(g);
  assert.equal(ev.from, 1); assert.ok(ev.to >= 3);
  assert.equal(summary(ev.growth, '2026-11-1').canEvolve, false);
});
console.log(`\n${pass} passed`);
