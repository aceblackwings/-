import assert from 'node:assert/strict';
import { computeDex, emptyDex, recordDiscoveries, claimMilestone } from '../js/dex.js';
let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
t('내 띠 칸은 처음부터 열림 (1/12)', () => {
  const r = computeDex(2, []);
  assert.equal(r.count, 1);
  assert.ok(r.entries[2].unlocked && r.entries[2].isMe);
  assert.equal(r.expGain, 0);
});
t('친구 띠 해금, 새 띠 +20, 전설 +30, 중복 보상 없음', () => {
  let dex = emptyDex();
  const friends = [{ name: '민지', branch: 3 }, { name: '준호', branch: 6 }, { name: '수아', branch: 3 }];
  const r = computeDex(2, friends, dex); // 호랑이: 토끼(전설), 말(전설·삼합)
  assert.equal(r.count, 3);
  assert.deepEqual(r.entries[3].friends, ['민지', '수아']);
  assert.equal(r.legendsFound, 2);
  assert.equal(r.expGain, 2 * 20 + 2 * 30);
  dex = recordDiscoveries(dex, r);
  assert.equal(computeDex(2, friends, dex).expGain, 0);
});
t('관계 배지 수집과 마일스톤 보상', () => {
  let dex = emptyDex();
  const friends = [0, 1, 6].map((b, i) => ({ name: `f${i}`, branch: b }));
  const r = computeDex(2, friends, dex);
  assert.ok(r.relations.find((x) => x.type === 'samhap').found); // 寅午
  assert.ok(r.milestones[0].reached);
  const c = claimMilestone(dex, r, 3); dex = c.dex;
  assert.equal(c.reward.rarity, 'rare');
  assert.equal(claimMilestone(dex, computeDex(2, friends, dex), 3).reward, null);
  assert.equal(computeDex(2, friends, dex).title, '새싹 인맥러');
  assert.equal(claimMilestone(dex, r, 6).reward, null);
});
t('12띠 완성', () => {
  const friends = Array.from({ length: 12 }, (_, b) => ({ name: `f${b}`, branch: b }));
  const r = computeDex(5, friends);
  assert.equal(r.count, 12);
  assert.equal(r.nextMilestone, null);
  assert.ok(r.relations.every((x) => x.found));
});
console.log(`\n${pass} passed`);
