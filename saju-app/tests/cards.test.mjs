import assert from 'node:assert/strict';
import { DECK_SIZE, CARD_ZODIAC, CARD_ELEMENT, CARD_AREAS, SPREADS, cardOf, cardName, drawCards, drawReading, readCard } from '../js/cards.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const saju = { yongsin: 0, gisin: 3 };

t('덱 60장 = 띠 12 × 오행 5, 이름이 모두 다름, 분야별 오행 문장 5개', () => {
  assert.equal(DECK_SIZE, CARD_ZODIAC.length * CARD_ELEMENT.length);
  const names = new Set(Array.from({ length: DECK_SIZE }, (_, i) => cardName(cardOf(i))));
  assert.equal(names.size, 60);
  for (const a of CARD_AREAS) assert.equal(a.lines.length, 5, a.key);
  for (const z of CARD_ZODIAC) for (const k of ['title', 'keyword', 'message', 'action', 'caution']) assert.ok(z[k], k);
});

t('같은 사람·날·질문·방식이면 같은 카드, 하나라도 바뀌면 달라질 수 있음', () => {
  const a = drawReading({ person: 'p', dateKey: '2026-11-2', area: 'love', spread: 'three', saju });
  const b = drawReading({ person: 'p', dateKey: '2026-11-2', area: 'love', spread: 'three', saju });
  assert.deepEqual(a.readings.map((r) => r.id), b.readings.map((r) => r.id));
  const diff = ['2026-11-3', '2026-11-4', '2026-11-5', '2026-11-6'].some((d) => drawReading({ person: 'p', dateKey: d, area: 'love', spread: 'three', saju }).readings[0].id !== a.readings[0].id);
  assert.ok(diff, '날마다 바뀜');
});

t('세 장 뽑기는 서로 다른 카드, 자리 이름(지금·조언·앞으로)과 요약', () => {
  const r = drawReading({ person: 'q', dateKey: '2026-11-2', area: 'money', spread: 'three', saju });
  assert.equal(new Set(r.readings.map((x) => x.id)).size, 3);
  assert.deepEqual(r.readings.map((x) => x.position), SPREADS.three.positions);
  assert.ok(r.summary.includes(r.readings[1].keyword));
  const one = drawReading({ person: 'q', dateKey: '2026-11-2', area: 'today', spread: 'one', saju });
  assert.equal(one.readings.length, 1);
});

t('모든 카드가 고르게 나옴 (6,000번 뽑기에서 카드마다 1/60 ± 여유)', () => {
  const count = new Array(60).fill(0);
  for (let i = 0; i < 6000; i++) count[drawCards(`s${i}`, 1)[0].id]++;
  assert.ok(Math.min(...count) >= 60 && Math.max(...count) <= 150, `${Math.min(...count)}~${Math.max(...count)}`);
});

t('내 사주와의 관계: 용신 카드·기신 카드·보통 카드 문장', () => {
  assert.equal(readCard(cardOf(12 * 0 + 5), 'today', saju).fit, 'need');
  assert.equal(readCard(cardOf(12 * 3 + 5), 'today', saju).fit, 'slow');
  assert.equal(readCard(cardOf(12 * 2 + 5), 'today', saju).fit, 'plain');
  const r = readCard(cardOf(12 * 4 + 2), 'work', saju);
  assert.equal(r.areaLine, CARD_AREAS.find((a) => a.key === 'work').lines[4]);
  assert.equal(r.name, '흐르는 용기의 포효');
});

console.log(`${pass} passed`);
