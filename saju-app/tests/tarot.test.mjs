import assert from 'node:assert/strict';
import { TAROT_DECK, TAROT_TOPICS, TAROT_SPREADS, shuffleDeck, seededRng, readTarot } from '../js/tarot.js';
import { toneProblems } from '../js/habit.js';
import { ZODIAC } from '../js/character.js';
let pass = 0; const t = (n, fn) => { fn(); pass++; console.log('ok -', n); };

t('덱 = 12지신 12장, 띠 순서 그대로, 분야 문장 4개·조언·행동', () => {
  assert.deepEqual(TAROT_DECK.map((c) => c.key), ZODIAC.map((z) => z.key));
  TAROT_DECK.forEach((c) => { TAROT_TOPICS.forEach((tp) => assert.ok(/[.?!]$/.test(c.up[tp.key] || ''), c.key + tp.key)); assert.ok(c.rev && c.act && c.title && c.keyword); });
});
t('섞기: 12장 모두 한 번씩, 같은 시드면 같은 순서, 누운 카드 약 25%', () => {
  const a = shuffleDeck(seededRng('x')); assert.equal(new Set(a.map((c) => c.key)).size, 12);
  assert.deepEqual(shuffleDeck(seededRng('x')), a);
  let rev = 0; let n = 0; for (let i = 0; i < 400; i++) shuffleDeck(seededRng(i)).forEach((c) => { n++; if (c.reversed) rev++; });
  assert.ok(rev / n > 0.18 && rev / n < 0.32, String(rev / n));
});
t('풀이: 자리 수 확인, 모든 조합 금지어 없음·undefined 없음·행동 1개', () => {
  for (const tp of TAROT_TOPICS) for (const sp of Object.keys(TAROT_SPREADS)) for (let i = 0; i < 40; i++) {
    const d = shuffleDeck(seededRng(`${tp.key}${sp}${i}`)); const picks = d.slice(0, TAROT_SPREADS[sp].positions.length);
    const r = readTarot({ topic: tp.key, spread: sp, picks, name: '은하' }); const txt = JSON.stringify({ c: r.cards.map((c) => c.line), s: r.summary, a: r.act });
    assert.deepEqual(toneProblems(txt), []); assert.ok(!/undefined|NaN|null/.test(txt), txt); assert.ok(r.act.length > 4);
    assert.equal(r.cards.length, picks.length);
  }
  assert.throws(() => readTarot({ topic: 'love', spread: 'three', picks: [{ key: 'rat' }] }));
});
console.log(`\ntarot: ${pass} passed`);
