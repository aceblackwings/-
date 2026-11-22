// v0.78 쉬운 종합 풀이: 타로 「전체를 하나로」 · 이번 주 운세 창(좋은 날·조심할 날 + 놓치면/그냥 지나가면)
import assert from 'node:assert/strict';
import { readTarot, shuffleDeck, seededRng, TAROT_TOPICS, FULL_DECK } from '../js/tarot.js';
import { weekGuide } from '../js/flowstory.js';
import { weekOf } from '../js/period.js';
import { computeSaju } from '../js/saju.js';
import { toneProblems } from '../js/habit.js';
import { josaProblems } from '../js/josa.js';
let pass = 0; const t = (n, f) => { f(); pass++; console.log('ok -', n); };
const clean = (txt, why) => { assert.deepEqual(toneProblems(txt), [], `${why}: ${txt}`); assert.deepEqual(josaProblems(txt), [], `${why}: ${txt}`); };

t('타로 종합 풀이: 카드 제목(「~」의 기운) 나열 없이 흐름 · 할 일 2 · 조심 1 · 집중 · 정리', () => {
  for (const tp of TAROT_TOPICS) {
    for (let i = 0; i < 30; i++) {
      const d = shuffleDeck(seededRng(`${tp.key}-${i}`));
      for (const spread of ['one', 'three']) {
        const r = readTarot({ topic: tp.key, spread, picks: d.slice(0, spread === 'one' ? 1 : 3) });
        const w = r.whole;
        assert.equal(w.good.length, 2); assert.ok(w.bad && w.focus);
        assert.ok(!/의 기운이/.test(w.flow), '카드 제목을 「~의 기운」으로 나열하지 않음');
        for (const c of r.cards) assert.ok(!w.flow.includes(`「${c.card.core}」`), '시적인 제목 대신 쉬운 말');
        assert.ok(w.verdict.includes('좋은 방향') && w.verdict.includes('반대로'), '좋아지는 길과 힘들어지는 길을 함께');
        clean(`${w.flow} ${w.good.join(' ')} ${w.bad}. ${w.verdict}`, `${tp.key}/${spread}`);
      }
    }
  }
});
t('타로 종합 풀이: 누운 열쇠 카드는 쉬어 가는 쪽 안내', () => {
  const r = readTarot({ topic: 'money', spread: 'one', picks: [{ key: FULL_DECK[0].key, reversed: true }] });
  assert.ok(r.whole.flow.includes('무르익지 않은'));
  assert.equal(r.whole.focus, '지키며 지켜보기');
});
t('이번 주 운세: 7일 · 가장 좋은 날/조심할 날 + 놓치면 · 분야 요일 4 · 할 일 3 · 주말엔 다음 주', () => {
  const s = computeSaju({ year: 1992, month: 5, day: 14, hour: 9, minute: 30, timeKnown: true, gender: 'female' });
  for (const day of [16, 19, 22]) {
    const w = weekOf(s, { year: 2026, month: 11, day }, 'female');
    const next = day === 22 ? weekOf(s, { year: 2026, month: 11, day: 23 }, 'female') : null;
    const G = weekGuide(w, next);
    assert.equal(G.days.length, 7); assert.equal(G.days.filter((x) => x.best).length, 1); assert.equal(G.days.filter((x) => x.low).length, 1);
    assert.equal(G.fields.length, 4); assert.equal(G.todo.length, 3);
    assert.ok(G.best.miss && G.low.miss);
    assert.equal(!!G.next, day === 22);
    if (day === 22) { assert.ok(G.days.filter((x) => x.past).length === 6, '일요일이면 월~토는 지난 날'); assert.ok(G.next.best.text.includes('월')); }
    clean([G.head, G.shape, G.best.line, G.best.miss, G.low.line, G.low.miss, ...G.todo, G.avoid, ...G.days.map((x) => x.tag)].join(' '), `week ${day}`);
  }
});
console.log(`readable: ${pass} 통과`);
