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
  assert.ok(speak(0, 'greet', { index: 0, stage: 1 }).startsWith('🍼'));
  assert.ok(speak(0, 'greet', { index: 0, stage: 5 }).endsWith('✦'));
});
console.log(`\n${pass} passed`);
import { pairDialogue } from '../js/pairtalk.js';
t('말투 가이드: 유치한 말버릇(뀨·이 몸·본 용·문장 끝 의성어) 없음, 의성어는 쓰다듬기에서만', () => {
  const banned = /뀨|이 몸|본 용|찍!|찍\.|어흥|크르릉|음머|깡총|히힝|메에|끼끼|꼬끼오|멍!|꿀꿀|스으/;
  PERSONALITIES.forEach((p, i) => {
    for (const sit of ['greet', 'tier', 'best', 'mission', 'missionDone', 'equip', 'evolve', 'back', 'compat']) {
      const lines = Array.isArray(p[sit]) ? p[sit] : [p[sit]];
      lines.forEach((l) => assert.ok(!banned.test(l), `${p.key}.${sit}: ${l}`));
    }
  });
  for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) pairDialogue(a, b).lines.forEach((l) => assert.ok(!banned.test(l.text), `${a}-${b}: ${l.text}`));
});
