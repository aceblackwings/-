import assert from 'node:assert/strict';
import { pairLine, pairDialogue, withJosa, SPECIAL_COUNT } from '../js/pairtalk.js';
let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
t('조사 자동 처리', () => {
  assert.equal(withJosa('토끼', '이랑'), '토끼랑');
  assert.equal(withJosa('호랑이', '이'), '호랑이가');
  assert.equal(withJosa('말', '과'), '말과');
  assert.equal(withJosa('쥐', '과'), '쥐와');
  assert.equal(withJosa('용', '은'), '용은');
});
t('144개 조합 모두 대사가 있고 빈칸이 없음', () => {
  let specials = 0;
  for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) {
    const d = pairDialogue(a, b);
    for (const l of d.lines) { assert.ok(l.text.length > 5); assert.ok(!/\{|\}|undefined/.test(l.text), l.text); }
    if (d.special) specials++;
  }
  assert.equal(specials, SPECIAL_COUNT * 2);
});
t('대표 조합: 쥐와 소의 십이지 경주', () => {
  assert.ok(pairLine(0, 1).text.includes('경주'));
  assert.ok(pairLine(1, 0).special);
});
t('관계별 대사: 쥐와 말은 충 전용 대사, 쥐와 원숭이는 삼합', () => {
  assert.equal(pairLine(0, 8).relation.type, 'samhap');
  assert.ok(pairLine(0, 8).text.includes('원숭이'));
  assert.ok(pairLine(3, 3, { stage: 1 }).text.startsWith('🍼'));
});
t('속담 전설 10쌍', () => {
  const pairs = [[6, 10], [7, 8], [0, 8], [1, 3], [4, 11], [1, 2], [3, 10], [9, 11], [2, 7], [6, 9]];
  for (const [a, b] of pairs) {
    const d = pairDialogue(a, b);
    assert.equal(d.kind, 'proverb', `${a}-${b}`);
    assert.ok(d.proverb.text && d.proverb.meaning);
    assert.equal(pairDialogue(b, a).kind, 'proverb');
  }
  assert.ok(pairLine(6, 10).text.includes('편자'));
});
console.log(`\n${pass} passed`);
