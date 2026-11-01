import assert from 'node:assert/strict';
import { PERSONALITIES, speak } from '../js/personality.js';
let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const SIT = ['greet', 'tier', 'best', 'mission', 'missionDone', 'equip', 'evolve', 'tap', 'back', 'compat'];
t('12띠 모두 성격·말투·상황별 대사를 갖춤', () => {
  assert.equal(PERSONALITIES.length, 12);
  const types = new Set();
  PERSONALITIES.forEach((p, i) => {
    for (const k of ['type', 'traits', 'intro', 'voice', 'me', ...SIT]) assert.ok(p[k], `${p.key}.${k}`);
    assert.equal(p.tier.length, 4); assert.equal(p.compat.length, 3); assert.ok(p.tap.length >= 4);
    types.add(p.type);
    for (const sit of SIT) {
      const n = Array.isArray(p[sit]) ? p[sit].length : 1;
      for (let j = 0; j < n; j++) {
        const line = speak(i, sit, { index: j, tier: j, vars: { score: 77, cat: '재물', friend: '준호', name: '은하' } });
        assert.ok(!/\{\w+\}/.test(line), `${p.key}.${sit}: ${line}`);
      }
    }
  });
  assert.equal(types.size, 12);
});
t('점수 대사에 점수가 들어감', () => {
  assert.ok(speak(2, 'tier', { tier: 3, vars: { score: 91 } }).includes('91'));
});
t('진화 단계별 말투: 아기는 서툴고 신수는 위엄', () => {
  assert.ok(speak(0, 'greet', { index: 0, stage: 1 }).startsWith('뀨'));
  assert.ok(speak(0, 'greet', { index: 0, stage: 5 }).endsWith('✦'));
});
console.log(`\n${pass} passed`);
