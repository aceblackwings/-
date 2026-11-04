import assert from 'node:assert/strict';
import { TAROT_DECK, MAJOR_ARCANA, FULL_DECK, TAROT_TOPICS, TAROT_SPREADS, TAROT_SITU, shuffleDeck, seededRng, readTarot } from '../js/tarot.js';
import { josaProblems } from '../js/josa.js';
import { toneProblems } from '../js/habit.js';
import { ZODIAC } from '../js/character.js';
let pass = 0; const t = (n, fn) => { fn(); pass++; console.log('ok -', n); };

t('덱 = 12지신 12장, 띠 순서 그대로, 분야 문장 4개·조언·행동', () => {
  assert.deepEqual(TAROT_DECK.map((c) => c.key), ZODIAC.map((z) => z.key));
  TAROT_DECK.forEach((c) => { TAROT_TOPICS.forEach((tp) => assert.ok(/[.?!]$/.test(FULL_DECK.find((x) => x.key === c.key).up[tp.key] || ''), c.key + tp.key)); assert.ok(c.rev && c.act && c.title && c.keyword); });
});
t('메이저 아르카나 22장(0~21) + 지신 12장 = 34장, 문장·조언·행동 모두', () => {
  assert.deepEqual(MAJOR_ARCANA.map((c) => c.num), [...Array(22).keys()]);
  assert.equal(FULL_DECK.length, 34); assert.equal(new Set(FULL_DECK.map((c) => c.key)).size, 34);
  FULL_DECK.filter((c) => c.kind === 'major').forEach((c) => { TAROT_TOPICS.forEach((tp) => assert.ok(/[.?!]$/.test(c.up[tp.key] || ''), c.key + tp.key)); assert.ok(c.rev && c.act && c.icon && c.title); });
});
t('섞기: 34장 모두 한 번씩, 같은 시드면 같은 순서, 누운 카드 약 25%', () => {
  const a = shuffleDeck(seededRng('x')); assert.equal(new Set(a.map((c) => c.key)).size, 34);
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
t('이야기 풀이(v0.47): 34장 모두 그림 이야기·뜻·흐름 성격·건강운, 주제 5개(건강운 포함)', () => {
  assert.deepEqual(TAROT_TOPICS.map((x) => x.key), ['love', 'job', 'money', 'health', 'day']);
  for (const c of FULL_DECK) { assert.ok(['act', 'build', 'feel', 'turn'].includes(c.tone), c.key); assert.ok(c.scene.length > 20 && c.meaning.length > 20 && c.core && /[.?!]$/.test(c.up.health), c.key); }
  const tones = new Set(FULL_DECK.map((c) => c.tone)); assert.equal(tones.size, 4);
});
t('이야기 풀이: 모든 주제 × 상황 × 한 장/세 장 — 대답·이야기·상황 문장, 조사·금지어 검사', () => {
  for (const tp of TAROT_TOPICS) for (const st of [null, ...TAROT_SITU[tp.key].map((x) => x.key)]) for (const sp of Object.keys(TAROT_SPREADS)) for (let i = 0; i < 25; i++) {
    const d = shuffleDeck(seededRng(`${tp.key}${st}${sp}${i}`)); const picks = d.slice(0, TAROT_SPREADS[sp].positions.length);
    const r = readTarot({ topic: tp.key, spread: sp, picks, name: '은하', situ: st });
    assert.ok(r.answer.startsWith('은하 님, ') && r.answer.length > 15);
    if (sp === 'three') assert.ok(r.story.length > 120 && r.cards.every((c) => r.story.includes(c.card.name)));
    else assert.equal(r.story, '');
    r.cards.forEach((c) => assert.equal(!!c.situLine, !!st));
    const txt = [r.answer, r.story, r.summary, r.act, ...r.cards.flatMap((c) => [c.scene, c.meaning, c.reading, c.situLine])].join(' ');
    assert.deepEqual(toneProblems(txt), []); assert.deepEqual(josaProblems(txt), [], txt); assert.ok(!/undefined|NaN|null/.test(txt));
  }
});
t('같은 카드라도 주제·상황이 다르면 읽는 문장이 달라짐, 건강 주제의 할 일은 몸·마음 챙기기', () => {
  const picks = [{ key: 'tiger' }];
  const a = readTarot({ topic: 'love', spread: 'one', picks, situ: 'some' }); const b = readTarot({ topic: 'love', spread: 'one', picks, situ: 'couple' }); const h = readTarot({ topic: 'health', spread: 'one', picks });
  assert.notEqual(a.cards[0].situLine, b.cards[0].situLine); assert.notEqual(a.cards[0].reading, h.cards[0].reading);
  assert.match(h.act, /걷기|스트레칭|스쿼트/);
});
{
  const fs = await import('node:fs');
  const { TAROT_FILES } = await import('../js/tarot-manifest.js');
  const { tarotImage } = await import('../js/assets.js');
  t('아르카나 그림: 목록의 파일은 모두 있고(m0~m21), 없으면 null → 코드 카드', () => {
    for (const k of TAROT_FILES) { assert.match(k, /^m(\d|1\d|2[01])$/); assert.ok(fs.statSync(new URL(`../assets/tarot/${k}.webp`, import.meta.url)).size > 1000, k); assert.equal(tarotImage(k), `assets/tarot/${k}.webp`); }
    if (!TAROT_FILES.includes('m0')) assert.equal(tarotImage('m0'), null);
    assert.equal(tarotImage('rat'), null, '지신 카드는 표정 그림 그대로');
  });
}
console.log(`\ntarot: ${pass} passed`);
