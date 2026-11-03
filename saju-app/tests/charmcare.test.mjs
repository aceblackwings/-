import assert from 'node:assert/strict';
import { growEquipped, fillOf, replaceCharm, pairType, fiveDone, setUnlocked, boostRarity, offerUnlocked, offerValue, offerable, removeOffered, equipLine, charmKey, GROW_FULL } from '../js/charmcare.js';
import { toneProblems } from '../js/habit.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const R = (type, rarity = 'common', element = 1, dateKey = '2026-11-3') => ({ type, theme: 'classic', element, rarity, dateKey, label: 'x' });

t('C 부적 성장: 쪽지마다 장착 부적에 1칸, 7칸이면 등급 +1·기운 0, 같은 부적 두 번 안 셈', () => {
  const a = R('wealth'); let st = {};
  for (let i = 0; i < GROW_FULL - 1; i++) st = growEquipped(st, [a, null]).store;
  assert.equal(fillOf(st, a), 6);
  const r = growEquipped(st, [a, a]);
  assert.equal(r.upgrades.length, 1); assert.equal(r.upgrades[0].to.rarity, 'rare');
  assert.equal(fillOf(r.store, a), 0); assert.equal(fillOf(r.store, r.upgrades[0].to), 0);
  const m = growEquipped({ [charmKey(R('luck', 'myth'))]: 6 }, [R('luck', 'myth')]);
  assert.equal(m.upgrades.length, 0, '신화는 더 오르지 않음');
});

t('등급이 오르면 도감·장착 목록에서 바꿔 끼움', () => {
  const a = R('love'); const to = { ...a, rarity: 'rare' };
  const list = replaceCharm([a, R('exam'), { ...a, label: '쪽지 보상 일반 애정부' }], a, { ...to, label: '희귀 애정부' });
  assert.equal(list[0].rarity, 'rare'); assert.equal(list[1].rarity, 'common'); assert.equal(list[2].label, '쪽지 보상 희귀 애정부');
});

t('D 세트: 같은 종류 두 장 = 쌍부적, 보상 등급 +1(전설까지), 오행 다섯 = 완성', () => {
  assert.equal(pairType([R('wealth'), R('wealth', 'rare')]), 'wealth'); assert.equal(pairType([R('wealth'), R('love')]), null); assert.equal(pairType([R('wealth'), null]), null);
  assert.equal(boostRarity('common', 'wealth'), 'rare'); assert.equal(boostRarity('legend', 'wealth'), 'legend'); assert.equal(boostRarity('epic', null), 'epic');
  assert.ok(setUnlocked([R('a'), R('a')])); assert.ok(!setUnlocked([R('a'), R('b')]));
  assert.ok(fiveDone([0, 1, 2, 3, 4].map((e) => R('luck', 'common', e)))); assert.ok(!fiveDone([R('luck', 'common', 0)]));
});

t('E 바치기: 10장부터, 장착한 부적은 빼고, 등급·기운만큼 점수', () => {
  const col = Array.from({ length: 10 }, (_, i) => R('luck', 'common', i % 5, `2026-10-${i + 1}`));
  assert.ok(offerUnlocked(col)); assert.ok(!offerUnlocked(col.slice(0, 9)));
  const list = offerable(col, [col[0], null]);
  assert.equal(list.length, 9); assert.ok(!list.some(({ i }) => i === 0));
  assert.equal(offerValue(R('x', 'epic'), 3), 26);
  assert.equal(removeOffered(col, [1, 2]).length, 8);
});

t('A 장착 대사: 6종 × 반말·존댓말, 금지어 없음', () => {
  for (const k of ['protect', 'luck', 'wealth', 'love', 'exam', 'health']) {
    const c = equipLine(k); const p = equipLine(k, true);
    assert.ok(c !== p && /요[.!]?$/.test(p)); assert.deepEqual(toneProblems(c + p), []);
  }
});

console.log(`\ncharmcare: ${pass} passed`);
