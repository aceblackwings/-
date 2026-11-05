// 유료 상세 풀이(v0.46): 분량 · 조사 · 금지어 · 같은 입력이면 같은 글 · 점수는 건드리지 않음
import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { yearOf } from '../js/period.js';
import { analyzeGyeok } from '../js/gyeokguk.js';
import { computeDaewoon } from '../js/luck.js';
import { computeCompat } from '../js/compat.js';
import { buildPremiumYear, buildLifeReport, buildCompatReport, premiumTeaser, compatTeaser, tarotBridge, charCount, PRODUCTS } from '../js/premium.js';
import { josaProblems } from '../js/josa.js';
import { toneProblems } from '../js/habit.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const flat = (r) => r.sections.map((s) => [s.h, s.intro || '', ...s.blocks.flatMap((b) => [b.h || '', ...b.paras])].join('\n')).join('\n');
const PEOPLE = [
  [1992, 5, 14, 9, 30], [1975, 11, 2, 22, 10], [2001, 2, 28, 3, 0], [1964, 8, 19, 13, 45], [1988, 1, 7, 6, 20], [1999, 7, 23, 18, 5],
  [1983, 10, 11, 11, 40], [2008, 4, 3, 15, 15], [1958, 12, 25, 0, 30], [1995, 9, 9, 21, 0], [1970, 3, 17, 8, 50], [2012, 6, 1, 12, 0],
].map(([year, month, day, hour, minute], i) => ({ s: computeSaju({ year, month, day, hour, minute }), g: i % 2 ? 'male' : 'female' }));
const yearRep = ({ s, g }, Y = 2027) => buildPremiumYear({ y: yearOf(s, Y, g), thisYear: yearOf(s, Y - 1, g), saju: s, gyeok: analyzeGyeok(s), name: '은하', gender: g, concern: 'love' });
const lifeRep = ({ s, g }) => buildLifeReport({ saju: s, gyeok: analyzeGyeok(s), daewoon: computeDaewoon(s, g), name: '은하', gender: g, nowYear: 2026 });
const compatRep = (a, b) => buildCompatReport({ me: a.s, friend: b.s, compat: computeCompat(a.s, b.s, { year: 2026, month: 11, day: 4 }), myName: '은하', friendName: '민준', myGender: a.g, friendGender: b.g, yMe: yearOf(a.s, 2027, a.g), yFriend: yearOf(b.s, 2027, b.g) });

t('그해 상세판: 사람마다 1만 4천 자 이상, 12달·분야 8개가 모두 들어감', () => {
  for (const p of PEOPLE) {
    const r = yearRep(p);
    assert.ok(r.chars >= 14000, `상세판 ${r.chars}자`);
    assert.equal(r.sections.find((s) => s.key === 'months').blocks.filter((b) => /^\d+월/.test(b.h)).length, 12);
    assert.equal(r.sections.find((s) => s.key === 'fields').blocks.length, 8);
    assert.equal(r.chars, charCount(r));
  }
});
t('평생 정통사주: 1만 4천 자 이상 · 궁합 상세: 4천 5백 자 이상', () => {
  for (const p of PEOPLE) assert.ok(lifeRep(p).chars >= 14000, `평생 ${lifeRep(p).chars}자`);
  for (let i = 0; i < PEOPLE.length; i++) { const r = compatRep(PEOPLE[i], PEOPLE[(i + 5) % PEOPLE.length]); assert.ok(r.chars >= 4500, `궁합 ${r.chars}자`); }
});
t('조사 · 금지어 검사(상세판 2027·2028, 평생, 궁합)', () => {
  for (let i = 0; i < PEOPLE.length; i++) {
    const p = PEOPLE[i];
    for (const r of [yearRep(p), yearRep(p, 2028), lifeRep(p), compatRep(p, PEOPLE[(i + 3) % PEOPLE.length])]) {
      const text = flat(r);
      assert.deepEqual(josaProblems(text).map((x) => `${x.why} | ${x.text}`), [], `${r.kind} 조사`);
      assert.deepEqual(toneProblems(text), [], `${r.kind} 금지어`);
      assert.ok(!/undefined|NaN|\[object/.test(text), `${r.kind} 빈 값`);
    }
  }
});
t('같은 입력이면 같은 글, 점수는 그대로', () => {
  const p = PEOPLE[0]; const y = yearOf(p.s, 2027, p.g); const before = JSON.stringify(y);
  const a = buildPremiumYear({ y, saju: p.s, gyeok: analyzeGyeok(p.s), name: '은하', gender: p.g });
  const b = buildPremiumYear({ y, saju: p.s, gyeok: analyzeGyeok(p.s), name: '은하', gender: p.g });
  assert.equal(flat(a), flat(b));
  assert.equal(JSON.stringify(y), before);
  assert.equal(flat(lifeRep(p)), flat(lifeRep(p)));
});
t('맛보기: 첫 문장은 보이고 다음 문장은 흐리게', () => {
  const tz = premiumTeaser(yearRep(PEOPLE[1]));
  assert.ok(tz.h && tz.open.length > 30 && tz.blur.length > 20);
});
t('궁합 상세 990원 · 맛보기는 배우자 기운 비율까지 보이고 결론·답 5개·좋은 달은 흐리게', () => {
  assert.equal(PRODUCTS.compat.price, 990);
  const tz = compatTeaser(compatRep(PEOPLE[0], PEOPLE[3]));
  assert.match(tz.open, /%/); assert.ok(tz.blur.length > 10);
  assert.equal(tz.qa.length, 5); assert.ok(tz.qa.every((x) => x.q.endsWith('?') && x.a.length > 10));
  assert.ok(tz.months.includes('월'));
});
t('타로 다리: 주제마다 상세판의 맞는 분야로 잇고, 질문 2개 + 흐린 답 · 찾아갈 자리가 실제로 있음', () => {
  for (const p of PEOPLE.slice(0, 6)) {
    const r = yearRep(p);
    for (const [topic, label] of [['love', '애정운'], ['job', '직장·학업운'], ['money', '재물운'], ['day', null]]) {
      const b = tarotBridge(r, topic);
      assert.equal(b.q.length, 2); assert.ok(b.q.every((x) => x.q.endsWith('?') && x.a.length > 15));
      const blk = r.sections[b.sec].blocks[b.block]; assert.ok(blk, `${topic} 자리`);
      if (label) { assert.ok(blk.h.startsWith(label)); assert.match(b.q[0].a, /두 달은 \d+월/); }
      else assert.equal(r.sections[b.sec].key, 'months');
      for (const x of b.q) { assert.deepEqual(josaProblems(x.q + ' ' + x.a), []); assert.deepEqual(toneProblems(x.a), []); }
    }
  }
});
console.log(`premium: ${pass} passed`);
