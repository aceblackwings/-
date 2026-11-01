import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { computeFortune, CATEGORIES } from '../js/fortune.js';
import { createTalisman, renderTalismanSVG, computeEffect, RARITIES, TALISMAN_TYPES } from '../js/talisman.js';
import { renderEmoticonSVG } from '../js/emoticon.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const date = { year: 2026, month: 11, day: 1 };

// 1950~2010년 사이 여러 생일로 전체 파이프라인 점검
const births = [];
for (let y = 1950; y <= 2010; y += 7) for (let m = 1; m <= 12; m += 5) births.push({ year: y, month: m, day: (y + m) % 28 + 1, hour: (y * m) % 24, minute: 15 });

t('운세 점수는 5~98, 같은 날 같은 결과', () => {
  for (const b of births) {
    const s = computeSaju(b);
    const f1 = computeFortune(s, date); const f2 = computeFortune(s, date);
    for (const c of CATEGORIES) {
      assert.ok(f1.scores[c.key] >= 5 && f1.scores[c.key] <= 98, `${c.key}=${f1.scores[c.key]}`);
    }
    assert.deepEqual(f1.scores, f2.scores);
  }
});
t('효과 공식 예시: 영웅, 수 6점, 오늘 금 → 19%', () => {
  const epic = RARITIES.find((r) => r.key === 'epic');
  assert.equal(computeEffect(epic, 6, 4, 3).value, 19);
});
t('부적과 이모티콘 SVG 생성 (모든 종류 × 테마)', () => {
  const s = computeSaju(births[3]); const f = computeFortune(s, date);
  for (const type of TALISMAN_TYPES) for (const theme of ['classic', 'neon']) {
    const tl = createTalisman(s, f, { type: type.key, theme });
    const svg = renderTalismanSVG(tl);
    assert.ok(svg.startsWith('<svg') && svg.includes(type.hanja[0]));
    assert.equal(tl.effects.length, 3);
  }
  assert.ok(renderEmoticonSVG(s, f).startsWith('<svg'));
});
t('등급 분포가 확률표와 비슷함', () => {
  const s = computeSaju(births[0]); const f = computeFortune(s, date);
  const counts = {};
  for (let i = 0; i < 20000; i++) {
    const r = createTalisman(s, f, { reroll: i }).rarity.key;
    counts[r] = (counts[r] || 0) + 1;
  }
  assert.ok(Math.abs(counts.common / 20000 - 0.6) < 0.03, JSON.stringify(counts));
  assert.ok(Math.abs(counts.rare / 20000 - 0.28) < 0.03, JSON.stringify(counts));
});
console.log(`\n${pass} passed`);
