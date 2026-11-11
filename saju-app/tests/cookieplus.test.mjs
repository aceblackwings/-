// v0.61 포춘 쿠키 다듬기 1부: 지신 한마디 48줄 · 절기·명절 30줄 · 황금 쿠키 10%
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { REACT, TIER_MOOD, tierOf, cookieReaction, TERMS24, HOLIDAYS6, SPECIAL_LINES, specialOf, isGolden, GOLD_RATE, GOLD_NOTE } from '../js/cookieplus.js';
import { PERSONALITIES } from '../js/personality.js';
import { EMOTES } from '../js/character.js';
import { toneProblems } from '../js/habit.js';
import { josaProblems } from '../js/josa.js';

let n = 0; const t = (name, fn) => { fn(); n++; console.log(`ok - ${name}`); };
const CUTE = /뀨|이 몸|본 용|헤헤|히히|ㅋㅋ|ㅎㅎ|♡|~~|어흥|음머|꿀꿀|꼬끼오/;
const SCARY = /나쁜|조심하지 않으면|큰일|위험|사고|다칠|잃을|실패/;

t('지신 한마디: 12띠 × 4단계 = 48줄 · 서로 다름 · 금지어·겁주는 말·조사 없음', () => {
  assert.deepEqual(Object.keys(REACT).sort(), PERSONALITIES.map((p) => p.key).sort());
  const all = Object.values(REACT).flat();
  assert.equal(all.length, 48); assert.equal(new Set(all).size, 48);
  for (const s of all) {
    assert.deepEqual(toneProblems(s), [], s); assert.deepEqual(josaProblems(s), [], s);
    assert.ok(!CUTE.test(s), s); assert.ok(!SCARY.test(s), s); assert.ok(s.length <= 60, s);
  }
  for (const s of REACT.rooster) assert.ok(/요[.!?]?$/.test(s), `닭띠는 존댓말: ${s}`);
  for (const [k, list] of Object.entries(REACT)) if (k !== 'rooster') for (const s of list) assert.ok(!/(에요|해요|세요)[.!?]$/.test(s), `반말: ${s}`);
  // 흐린 날 문장은 날씨 → 우산(다독임)
  for (const list of Object.values(REACT)) assert.ok(/흐|구름|비|쉬어|천천히|괜찮/.test(list[0]), list[0]);
});

t('점수대 4단계 · 표정은 실제 표정 그림 8장 중에서 · 황금이면 크게 놀람', () => {
  assert.deepEqual([30, 54, 55, 67, 68, 79, 80, 96].map(tierOf), [0, 0, 1, 1, 2, 2, 3, 3]);
  const keys = EMOTES.map((e) => e.key);
  for (const m of [...TIER_MOOD, 'wow']) assert.ok(keys.includes(m));
  const a = cookieReaction(40, 'dragon'); assert.equal(a.mood, 'calm'); assert.equal(a.big, false); assert.equal(a.line, REACT.dragon[0]);
  const g = cookieReaction(90, 'rooster', true); assert.equal(g.mood, 'wow'); assert.ok(g.big); assert.ok(g.line.includes('황금 쿠키') && g.line.endsWith(REACT.rooster[3]));
  assert.ok(cookieReaction(70, 'pig', true).line.includes('나왔어!'));
});

t('절기 24 + 명절 6 = 특별 한 줄 30줄 · 금지어·조사 없음', () => {
  assert.equal(TERMS24.length, 24); assert.equal(HOLIDAYS6.length, 6);
  assert.equal(SPECIAL_LINES.length, 30); assert.equal(new Set(SPECIAL_LINES).size, 30);
  for (const s of SPECIAL_LINES) { assert.deepEqual(toneProblems(s), [], s); assert.deepEqual(josaProblems(s), [], s); assert.ok(!SCARY.test(s), s); }
  for (const h of HOLIDAYS6) assert.ok(h.shape, h.key);
});

t('날짜: 출시일 2026-12-22 = 동지 특별 쿠키 · 명절은 음력 · 절기는 해마다 24번', () => {
  const dj = specialOf({ year: 2026, month: 12, day: 22 }); assert.equal(dj.key, 'dongji'); assert.equal(dj.shape, 'redbean');
  assert.equal(specialOf({ year: 2027, month: 2, day: 7 }).key, 'seollal'); // 2027 설날
  assert.equal(specialOf({ year: 2027, month: 2, day: 7 }).shape, 'string');
  assert.equal(specialOf({ year: 2026, month: 9, day: 25 }).key, 'chuseok');
  assert.equal(specialOf({ year: 2026, month: 11, day: 7 }).name, '입동');
  assert.equal(specialOf({ year: 2026, month: 11, day: 6 }), null);
  for (const y of [2026, 2027, 2028]) {
    const seen = new Set(); let d = new Date(Date.UTC(y, 0, 1));
    while (d.getUTCFullYear() === y) {
      const s = specialOf({ year: y, month: d.getUTCMonth() + 1, day: d.getUTCDate() });
      if (s) { seen.add(s.name); if (s.termName) seen.add(s.termName); }
      d = new Date(d.getTime() + 864e5);
    }
    assert.equal(seen.size, 29, `${y}년: 절기 24 + 명절 6(동지는 둘 다)`); // 명절과 겹친 절기는 「칠석 · 입추」처럼 함께
  }
});

t('황금 쿠키: 10번에 한 번 · 같은 날은 같음 · 사람마다 다름 · 확률 공개 문구', () => {
  assert.equal(GOLD_RATE, 0.1); assert.ok(GOLD_NOTE.includes('10번에 한 번') && GOLD_NOTE.includes('10%') && GOLD_NOTE.includes('점수는 같'));
  let c = 0; const N = 5000;
  for (let i = 0; i < N; i++) { const k = `2027-${(i % 12) + 1}-${i}`; if (isGolden(k, 'p1')) c++; assert.equal(isGolden(k, 'p1'), isGolden(k, 'p1')); }
  assert.ok(c / N > 0.085 && c / N < 0.115, String(c / N));
  let diff = 0; for (let i = 0; i < 400; i++) if (isGolden(`d${i}`, 'a') !== isGolden(`d${i}`, 'b')) diff++;
  assert.ok(diff > 20);
});

t('소리는 sound.js에서만(v0.65) · 진동은 도장에만', () => {
  const src = readFileSync(new URL('../js/cookieplus.js', import.meta.url), 'utf8').replace(/\/\/.*$/gm, '');
  assert.ok(!/vibrate|Audio|AudioContext|speechSynthesis/.test(src));
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  assert.equal((app.match(/navigator\.vibrate\?\.\(|navigator\.vibrate\(/g) || []).length, 1);
  const fc = app.slice(app.indexOf('function cookieInfo'), app.indexOf("document.addEventListener('click', (e) => {\n  if (e.target.closest('[data-fc-turn]'))"));
  assert.ok(fc.length > 100 && !/vibrate|Audio|play\(/.test(fc));
});

console.log(`${n} tests passed`);
