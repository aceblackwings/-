// v0.59 4단계(2026-11-06 사용자 결정): 첫 화면 = 요약판(결론·할 일, 3~5천 자), 「자세히 보기」 = 다시 쓰지 않고
// 요약판과 같은 문장(20자 이상)을 뺀 상세판(이유·사례·달마다의 장면) · 나의 흐름 카드 요약(이번 주 1천·올해 2천·10년 3천 자 이내)
import assert from 'node:assert/strict';
import { computeSaju, tenGod } from '../js/saju.js';
import { yearOf, weekOf } from '../js/period.js';
import { analyzeGyeok, GYEOK_PROFILE } from '../js/gyeokguk.js';
import { computeDaewoon, daewoonAt } from '../js/luck.js';
import { weekStory, yearStory, decadeStory } from '../js/flowstory.js';
import { GOD_READING } from '../js/reading.js';
import { GOD_TALE, TODAY_TALE, EL_TALE } from '../js/storybook.js';
import { toneProblems } from '../js/habit.js';
import { natalWatch } from '../js/natal.js';
import { buildBooklet } from '../js/booklet.js';
import { buildPremiumYear, buildLifeReport } from '../js/premium.js';
import { bookletStory, sajuStory, yearSummary, textsOf } from '../js/storyreport.js';
import { plainText, yearize, splitSentences, sentenceKey, SEED_MIN } from '../js/storybook.js';
import { josaProblems } from '../js/josa.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
export const PEOPLE = [
  [1992, 5, 14, 9, 30], [1975, 11, 2, 22, 10], [2001, 2, 28, 3, 0], [1964, 8, 19, 13, 45], [1988, 1, 7, 6, 20], [1999, 7, 23, 18, 5],
  [1983, 10, 11, 11, 40], [2008, 4, 3, 15, 15], [1958, 12, 25, 0, 30], [1995, 9, 9, 21, 0],
].map(([year, month, day, hour, minute], i) => ({ s: computeSaju({ year, month, day, hour, minute }), g: i % 2 ? 'male' : 'female', name: i % 3 ? '은하' : '' }));

const keysOf = (texts) => new Set(texts.flatMap(splitSentences).map(sentenceKey).filter((k) => k.length >= SEED_MIN));
const repTexts = (r, appendix = true) => r.sections.filter((s) => appendix || !s.appendix).flatMap((s) => [s.intro || '', ...s.blocks.flatMap((b) => b.paras)]);
const overlap = (a, b) => [...keysOf(b)].filter((k) => keysOf(a).has(k));

function yearPair(p, Y = 2027) {
  const y = yearOf(p.s, Y, p.g); const prev = yearOf(p.s, Y - 1, p.g); const gk = analyzeGyeok(p.s);
  const b = buildBooklet({ y, thisYear: prev, saju: p.s, gyeok: gk, name: p.name, concern: 'love', gender: p.g });
  const st = bookletStory({ y, thisYear: prev, saju: p.s, name: p.name, gender: p.g });
  const sum = yearSummary({ b, st });
  const T = (x) => yearize(plainText(x), Y, Y - 1);
  const rep = buildPremiumYear({ y, thisYear: prev, saju: p.s, gyeok: gk, name: p.name, gender: p.g, concern: 'love', nowYear: Y - 1, skip: textsOf(sum) });
  return { sum, sumTexts: textsOf(sum).map(T), rep };
}
function lifePair(p) {
  const gk = analyzeGyeok(p.s);
  const st = sajuStory({ saju: p.s, gyeok: gk, gp: GYEOK_PROFILE[gk.name], name: p.name, gender: p.g, curAge: 2026 - p.s.input.year, watch: natalWatch(p.s) });
  const rep = buildLifeReport({ saju: p.s, gyeok: gk, daewoon: computeDaewoon(p.s, p.g), name: p.name, gender: p.g, nowYear: 2026, skip: textsOf(st) });
  return { st, sumTexts: textsOf(st).map((x) => plainText(x)), rep };
}
const chars = (texts) => texts.join('').length;

t('2027년 요약판: 3천~5천 자 · 상세판에 같은 문장 없음 · 한눈에 정리는 요약판에만', () => {
  for (const p of PEOPLE) {
    const { sumTexts, rep } = yearPair(p);
    const n = chars(sumTexts); assert.ok(n >= 3000 && n <= 5000, `요약판 ${n}자`);
    assert.deepEqual(overlap(sumTexts, repTexts(rep)), [], '요약판과 같은 문장');
    assert.ok(!rep.sections.some((s) => s.key === 'brief'), '상세판에 한눈에 정리 없음');
    for (const k of ['why', 'risk', 'people', 'money', 'months']) assert.ok(rep.sections.some((s) => s.key === k), `상세판 ${k}`);
    assert.ok(rep.chars >= 8000, `상세판 ${rep.chars}자`);
    assert.deepEqual(josaProblems(sumTexts.join('\n')).map((x) => x.text), []);
  }
});
t('정통사주 요약판(쉽게 읽는 나): 2천~4천 자 · 결론 블록(조심·사람·일·지금 10년) · 상세판과 겹침 없음', () => {
  for (const p of PEOPLE) {
    const { st, sumTexts, rep } = lifePair(p);
    const n = chars(sumTexts); assert.ok(n >= 2000 && n <= 4000, `요약판 ${n}자`);
    assert.ok(st.more.length >= 4, '결론 블록');
    assert.deepEqual(overlap(sumTexts, repTexts(rep)), [], '요약판과 같은 문장');
    assert.ok(!rep.sections.some((s) => s.key === 'brief'));
    assert.ok(rep.sections.some((s) => s.appendix), '부록(근거)은 그대로');
    assert.deepEqual(josaProblems(sumTexts.join('\n')).map((x) => x.text), []);
  }
});
t('skip 없이 부르면 예전 상세판 그대로(한눈에 정리 포함)', () => {
  const p = PEOPLE[0]; const gk = analyzeGyeok(p.s);
  const a = buildLifeReport({ saju: p.s, gyeok: gk, daewoon: computeDaewoon(p.s, p.g), name: '은하', gender: p.g, nowYear: 2026 });
  assert.ok(a.sections.some((s) => s.key === 'brief')); assert.ok(!a.summarized);
});

const HANJA = /[㐀-鿿]/;
t('나의 흐름 요약: 이번 주 1천 · 올해 2천 · 10년 3천 자 이내 · 할 일·피할 일 · 조사·말투 · 한자 없음', () => {
  const days = [{ year: 2026, month: 11, day: 6 }, { year: 2027, month: 3, day: 18 }, { year: 2028, month: 8, day: 1 }];
  for (const p of PEOPLE) for (const today of days) {
    const age = today.year - p.s.input.year; const dw = computeDaewoon(p.s, p.g);
    const w = weekStory(weekOf(p.s, today, p.g)); const y = yearStory(yearOf(p.s, today.year, p.g));
    const d = decadeStory({ dw, cur: daewoonAt(dw, age, today), age, godOf: (x) => tenGod(p.s.dayMaster, x.stem), name: p.name });
    for (const [st, max, label] of [[w, 1000, '이번 주'], [y, 2000, '올해'], [d, 3000, '10년']]) {
      const all = st.paras.join(' ');
      assert.ok(all.length <= max && all.length >= 250, `${label} ${all.length}자`);
      assert.ok(!HANJA.test(all), `${label} 한자`);
      assert.deepEqual(josaProblems(st.paras.join('\n')).map((x) => x.text), [], `${label} 조사`);
      assert.deepEqual(toneProblems(all), [], `${label} 말투`);
      if (label !== '10년' || daewoonAt(dw, age, today)) assert.ok(/✅/.test(all) && /⛔/.test(all), `${label} 할 일·피할 일`);
    }
  }
});
t('나의 흐름 요약: 사주·2027년 운세·상세판·정통사주·운세 풀이 문장과 겹치지 않고, 세 요약끼리도 겹치지 않음', () => {
  const today = { year: 2026, month: 11, day: 6 };
  const tables = textsOf([GOD_READING, GOD_TALE, TODAY_TALE, EL_TALE]).map((x) => plainText(x));
  for (const p of PEOPLE) {
    const age = today.year - p.s.input.year; const dw = computeDaewoon(p.s, p.g);
    const flows = [weekStory(weekOf(p.s, today, p.g)), yearStory(yearOf(p.s, 2026, p.g)), decadeStory({ dw, cur: daewoonAt(dw, age, today), age, godOf: (x) => tenGod(p.s.dayMaster, x.stem), name: p.name })].map((x) => x.paras);
    const yp = yearPair(p); const lp = lifePair(p); const gk = analyzeGyeok(p.s);
    const others = [...yp.sumTexts, ...repTexts(yp.rep), ...lp.sumTexts, ...repTexts(lp.rep), ...tables,
      ...repTexts(buildPremiumYear({ y: yearOf(p.s, 2026, p.g), thisYear: yearOf(p.s, 2025, p.g), saju: p.s, gyeok: gk, name: p.name, gender: p.g }))];
    for (const f of flows) assert.deepEqual(overlap(others, f), [], '다른 화면과 같은 문장');
    assert.deepEqual(overlap(flows[0], flows[1]), []); assert.deepEqual(overlap(flows[1], flows[2]), []); assert.deepEqual(overlap(flows[0], flows[2]), []);
  }
});

console.log(`summary: ${pass} 통과`);
