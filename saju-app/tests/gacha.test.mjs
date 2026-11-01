import assert from 'node:assert/strict';
import { drawPack, rollRarity, emptyGacha, todayGacha, drawsLeft, isSubscribed, PITY } from '../js/gacha.js';
import { abilitiesAt, ASCENSION } from '../js/ascension.js';
import { stageForLevel, STAGES } from '../js/growth.js';
let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
let seed = 7; const rng = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const ctx = { emoteKeys: ['a', 'b'], types: ['luck'], elements: [0, 1] };
t('등급 분포가 공개 확률과 비슷함', () => {
  const c = {}; for (let i = 0; i < 40000; i++) { const r = rollRarity(rng()); c[r] = (c[r] || 0) + 1; }
  assert.ok(Math.abs(c.common / 40000 - 0.55) < 0.02); assert.ok(Math.abs(c.legend / 40000 - 0.045) < 0.006);
  for (let i = 0; i < 2000; i++) assert.notEqual(rollRarity(rng(), { minRare: true }), 'common');
});
t(`천장: ${PITY}회 안에 반드시 전설 이상`, () => {
  let pity = 0; let since = 0; let maxGap = 0;
  for (let i = 0; i < 5000; i++) { const p = drawPack(rng, { ...ctx, pity }); since++; if (['legend', 'myth'].includes(p.charm.rarity)) { maxGap = Math.max(maxGap, since); since = 0; } pity = p.pity; }
  assert.ok(maxGap <= PITY, `gap ${maxGap}`);
});
t('하루 무료 1회, 추가권·구독 시 +3회', () => {
  let g = todayGacha(emptyGacha(), '2026-11-1');
  assert.deepEqual([drawsLeft(g, '2026-11-1').free, drawsLeft(g, '2026-11-1').extra], [1, 0]);
  g = { ...g, freeUsed: 1, extraBought: true };
  assert.equal(drawsLeft(g, '2026-11-1').extra, 3);
  g = todayGacha({ ...g, subUntil: '2026-12-1' }, '2026-11-2');
  assert.equal(drawsLeft(g, '2026-11-2').free, 1);
  assert.equal(drawsLeft(g, '2026-11-2').extra, 3);
  assert.equal(isSubscribed(g, '2026-12-2'), false);
});
t('승천 14단계와 누적 능력', () => {
  assert.equal(STAGES.length, 14); assert.equal(stageForLevel(150), 14); assert.equal(stageForLevel(44), 5);
  assert.equal(ASCENSION.length, 9);
  const a6 = abilitiesAt(6); assert.ok(a6.chargeMult[0] > 1.29 && a6.cat.career === 3);
  const a10 = abilitiesAt(10); assert.ok(a10.chargeMult.every((m) => m >= 1.3)); assert.ok(a10.weakBoost >= 0.5);
  const a14 = abilitiesAt(14); assert.equal(a14.amp, 1.2); assert.ok(a14.rareFree && a14.autoCharge === 5 && a14.forecast > 4);
  assert.equal(abilitiesAt(5).list.length, 0);
});
console.log(`\n${pass} passed`);
